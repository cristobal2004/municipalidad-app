const {
  pool,
  insertarDocumentosSolicitud,
  obtenerFuncionarioAsignado,
  obtenerSolicitudCompletaPorCodigo,
  registrarHistorialSolicitud,
  reservarIdentidadSolicitud,
} = require("../../data/solicitudesRepository");
const {
  convertirPyme,
  formatearSolicitud,
  obtenerDocumentosDesdeArchivos,
  parsearDocumentos,
} = require("../../domain/solicitudMapper");
const {
  obtenerTramite,
  parsearDatosTramite,
  validarDatosTramite,
} = require("../../domain/tramiteCatalog");
const {
  solicitudAsignadaTemplate,
  solicitudCreadaTemplate,
} = require("../../../notificaciones/domain/emailTemplates");
const {
  enviarCorreoSeguro,
} = require("../../../notificaciones/data/emailService");

const notificarSolicitudCreada = async (solicitud) => {
  const confirmacion = await enviarCorreoSeguro({
    to: solicitud.correoContacto || solicitud.usuarioCorreo,
    ...solicitudCreadaTemplate(solicitud),
  });

  await enviarCorreoSeguro({
    to: solicitud.funcionarioCorreo,
    ...solicitudAsignadaTemplate(solicitud),
  });

  return confirmacion.sent;
};

const crearSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "usuario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo usuarios ciudadanos pueden crear solicitudes.",
      });
    }

    const tramiteConfig = obtenerTramite(
      req.body.tipoTramite || req.body.tramite,
    );
    const datosTramite = parsearDatosTramite(
      req.body.datosTramite || req.body.datos_tramite,
    );
    const camposFaltantes = validarDatosTramite(
      tramiteConfig,
      req.body,
      datosTramite,
    );

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: `Debe completar los campos obligatorios: ${camposFaltantes.join(
          ", ",
        )}.`,
      });
    }

    const identidad = await reservarIdentidadSolicitud();
    const funcionarioId = await obtenerFuncionarioAsignado(
      tramiteConfig.area,
    );
    const rutFinal =
      req.body.rutEmpresa || req.body.rut || datosTramite.rut || null;
    const direccionFinal =
      req.body.direccion ||
      datosTramite.direccion ||
      datosTramite.domicilio ||
      null;
    const razonSocialFinal =
      req.body.razonSocial ||
      datosTramite.nombreProyecto ||
      datosTramite.nombrePropietario ||
      `${tramiteConfig.tipo} - ${req.usuario.nombre || "solicitante"}`;
    const tipoPatenteFinal =
      req.body.tipoPatente ||
      datosTramite.tipoObra ||
      datosTramite.tipoVehiculo ||
      tramiteConfig.tipo;
    const rolAvaluoFinal =
      req.body.rolAvaluo ||
      datosTramite.rolPropiedad ||
      datosTramite.patenteVehiculo ||
      null;
    const correoFinal =
      req.body.correoContacto ||
      req.body.usuarioCorreo ||
      req.body.correo ||
      req.body.email ||
      null;
    const telefonoFinal =
      req.body.telefonoContacto ||
      req.body.usuarioTelefono ||
      req.body.telefono ||
      null;
    const observacionesFinal =
      req.body.observacionesSolicitante ||
      req.body.observaciones ||
      req.body.observacion ||
      null;
    const datosTramiteFinal = {
      ...datosTramite,
      rut: rutFinal,
      direccion: direccionFinal,
      razonSocial: razonSocialFinal,
      tipoPatente: tipoPatenteFinal,
    };

    const resultado = await pool.query(
      `
      INSERT INTO solicitudes
      (
        id,
        codigo,
        usuario_id,
        funcionario_id,
        tipo_tramite,
        razon_social,
        rut_empresa,
        direccion,
        tipo_patente,
        rol_avaluo,
        pyme,
        estado,
        correo_contacto,
        telefono_contacto,
        giro,
        superficie,
        observaciones_solicitante,
        prioridad,
        area_responsable,
        datos_tramite
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb
      )
      RETURNING id, codigo
      `,
      [
        identidad.id,
        identidad.codigo,
        req.usuario.id,
        funcionarioId,
        tramiteConfig.tipo,
        razonSocialFinal,
        rutFinal,
        direccionFinal,
        tipoPatenteFinal,
        rolAvaluoFinal,
        convertirPyme(req.body.pyme),
        "pendiente",
        correoFinal,
        telefonoFinal,
        req.body.giro || datosTramite.marca || null,
        req.body.superficie ||
          datosTramite.superficie ||
          datosTramite.anio ||
          null,
        observacionesFinal,
        "media",
        tramiteConfig.area,
        JSON.stringify(datosTramiteFinal),
      ],
    );

    const documentosFinales = [
      ...parsearDocumentos(req.body.documentos),
      ...obtenerDocumentosDesdeArchivos(req.files),
    ];

    await insertarDocumentosSolicitud(
      resultado.rows[0].id,
      documentosFinales,
    );

    await registrarHistorialSolicitud({
      solicitudId: resultado.rows[0].id,
      actorId: req.usuario.id,
      actorRol: req.usuario.rol,
      accion: "creacion",
      titulo: "Solicitud ingresada",
      descripcion: "La solicitud fue registrada correctamente.",
      cambios: {
        estado: "pendiente",
        tipoTramite: tramiteConfig.tipo,
        documentosAdjuntos: documentosFinales.length,
      },
    });

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      resultado.rows[0].codigo,
    );
    const solicitud = formatearSolicitud(solicitudCompleta);
    const correoEnviado = await notificarSolicitudCreada(solicitud);

    return res.status(201).json({
      ok: true,
      mensaje: "Solicitud creada correctamente.",
      correoEnviado,
      solicitud: {
        ...solicitud,
        correoEnviado,
      },
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al crear la solicitud.",
    });
  }
};

module.exports = {
  crearSolicitud,
};
