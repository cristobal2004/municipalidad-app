const fs = require("fs");
const path = require("path");

const {
  pool,
  selectAgendamientosBase,
  selectSolicitudesBase,
  insertarDocumentosSolicitud,
  obtenerCondicionSolicitudPorIdOCodigo,
  obtenerDocumentoSolicitud,
  obtenerFuncionarioAsignado,
  obtenerPaginacion,
  obtenerSolicitudCompletaPorCodigo,
  obtenerSolicitudResumenPorIdOCodigo,
  registrarHistorialSolicitud,
  reservarIdentidadSolicitud,
} = require("../../data/solicitudesRepository");
const {
  convertirPyme,
  formatearAgendamiento,
  formatearSolicitud,
  normalizarDocumentosFaltantes,
  normalizarEstado,
  obtenerDocumentosDesdeArchivos,
  parsearDocumentos,
} = require("../../domain/solicitudMapper");
const {
  validarFechaHoraAgendamiento,
} = require("../../domain/agendamientoRules");
const {
  citaTemplate,
  solicitudActualizadaTemplate,
} = require("../../../notificaciones/domain/emailTemplates");
const {
  enviarCorreoSeguro,
} = require("../../../notificaciones/data/emailService");

const uploadsRoot = path.resolve(__dirname, "../../../../../uploads");
const areasMunicipales = [
  "Atención General",
  "Servicio Ciudadano",
  "Finanzas",
  "Obras Municipales",
  "Patentes Comerciales",
];

const formatearFechaChile = (value) =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(value));

const notificarCita = async (solicitud, fechaHora, action) => {
  const template = citaTemplate(
    {
      codigoSolicitud: solicitud.codigo,
      fechaFormateada: formatearFechaChile(fechaHora),
      funcionarioNombre: solicitud.funcionario_nombre,
    },
    action,
  );

  const confirmacion = await enviarCorreoSeguro({
    to: solicitud.correo_contacto || solicitud.usuario_correo,
    ...template,
  });

  await enviarCorreoSeguro({
    to: solicitud.funcionario_correo,
    ...template,
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

    const {
      tipoTramite,
      tramite,
      razonSocial,
      rut,
      rutEmpresa,
      direccion,
      tipoPatente,
      rolAvaluo,
      pyme,
      correo,
      email,
      correoContacto,
      usuarioCorreo,
      telefono,
      telefonoContacto,
      usuarioTelefono,
      giro,
      superficie,
      observacion,
      observaciones,
      observacionesSolicitante,
      documentos,
    } = req.body;

    if (!razonSocial || !rut || !direccion || !tipoPatente) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Debe completar razón social, RUT, dirección y tipo de patente.",
      });
    }

    const identidad = await reservarIdentidadSolicitud();
    const funcionarioId = await obtenerFuncionarioAsignado();

    const correoFinal =
      correoContacto || usuarioCorreo || correo || email || null;

    const telefonoFinal =
      telefonoContacto || usuarioTelefono || telefono || null;

    const observacionesFinal =
      observacionesSolicitante || observaciones || observacion || null;

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
        prioridad
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, codigo
      `,
      [
        identidad.id,
        identidad.codigo,
        req.usuario.id,
        funcionarioId,
        tipoTramite || tramite || "Patente comercial",
        razonSocial,
        rutEmpresa || rut,
        direccion,
        tipoPatente,
        rolAvaluo || null,
        convertirPyme(pyme),
        "pendiente",
        correoFinal,
        telefonoFinal,
        giro || null,
        superficie || null,
        observacionesFinal,
        "media",
      ]
    );

    const documentosDesdeBody = parsearDocumentos(documentos);
    const documentosDesdeArchivos = obtenerDocumentosDesdeArchivos(req.files);

    const documentosFinales = [
      ...documentosDesdeBody,
      ...documentosDesdeArchivos,
    ];

    await insertarDocumentosSolicitud(resultado.rows[0].id, documentosFinales);

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      resultado.rows[0].codigo
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Solicitud creada correctamente.",
      solicitud: formatearSolicitud(solicitudCompleta),
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al crear la solicitud.",
    });
  }
};

const listarSolicitudes = async (req, res) => {
  try {
    const { page, limit, offset } = obtenerPaginacion(req);

    let query = selectSolicitudesBase;
    const params = [];

    if (req.usuario.rol === "usuario") {
      query += " WHERE s.usuario_id = $1";
      params.push(req.usuario.id);
    }

    if (req.usuario.rol === "funcionario") {
      query += " WHERE s.funcionario_id = $1";
      params.push(req.usuario.id);
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;

    params.push(limit, offset);

    const resultado = await pool.query(query, params);

    return res.json({
      ok: true,
      page,
      limit,
      cantidad: resultado.rows.length,
      solicitudes: resultado.rows.map(formatearSolicitud),
    });
  } catch (error) {
    console.error("Error al listar solicitudes:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al listar solicitudes.",
    });
  }
};

const obtenerDatosReporte = async (req, res) => {
  try {
    if (req.usuario.rol !== "funcionario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo funcionarios pueden consultar reportes municipales.",
      });
    }

    const resultado = await pool.query(
      `
      ${selectSolicitudesBase}
      ORDER BY s.created_at DESC
      LIMIT 500
      `,
    );

    return res.json({
      ok: true,
      cantidad: resultado.rows.length,
      solicitudes: resultado.rows.map(formatearSolicitud),
    });
  } catch (error) {
    console.error("Error al obtener datos de reportes:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener los datos del reporte.",
    });
  }
};

const obtenerMisSolicitudes = async (req, res) => {
  try {
    const { page, limit, offset } = obtenerPaginacion(req);

    const resultado = await pool.query(
      `
      ${selectSolicitudesBase}
      WHERE s.usuario_id = $1
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [req.usuario.id, limit, offset]
    );

    return res.json({
      ok: true,
      page,
      limit,
      cantidad: resultado.rows.length,
      solicitudes: resultado.rows.map(formatearSolicitud),
    });
  } catch (error) {
    console.error("Error al obtener mis solicitudes:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener tus solicitudes.",
    });
  }
};

const obtenerSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const busqueda = obtenerCondicionSolicitudPorIdOCodigo("s", id);

    const solicitudResult = await pool.query(
      `
      ${selectSolicitudesBase}
      WHERE ${busqueda.condicion}
      LIMIT 1
      `,
      [busqueda.parametro]
    );

    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitud = solicitudResult.rows[0];

    if (
      req.usuario.rol === "usuario" &&
      solicitud.usuario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para ver esta solicitud.",
      });
    }

    if (
      req.usuario.rol === "funcionario" &&
      solicitud.funcionario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No tienes permiso para ver esta solicitud porque no está asignada a tu usuario.",
      });
    }

    return res.json({
      ok: true,
      solicitud: formatearSolicitud(solicitud),
    });
  } catch (error) {
    console.error("Error al obtener solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener la solicitud.",
    });
  }
};

const actualizarSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "funcionario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo funcionarios pueden actualizar solicitudes.",
      });
    }

    const { id } = req.params;

    const {
      estado,
      observacion,
      documentosFaltantes,
      fechaLimiteDocumentos,
    } = req.body;

    const solicitudActual = await obtenerSolicitudResumenPorIdOCodigo(id);

    if (!solicitudActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    if (solicitudActual.funcionario_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes actualizar esta solicitud porque no está asignada a tu usuario.",
      });
    }

    const estadoNormalizado = normalizarEstado(estado);

    const documentosNormalizados =
      estadoNormalizado === "observada"
        ? normalizarDocumentosFaltantes(documentosFaltantes)
        : [];

    const fechaLimiteFinal =
      estadoNormalizado === "observada" ? fechaLimiteDocumentos || null : null;

    const resultado = await pool.query(
      `
      UPDATE solicitudes
      SET estado = $1,
          documentos_faltantes = $2::jsonb,
          fecha_limite_documentos = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, codigo
      `,
      [
        estadoNormalizado,
        JSON.stringify(documentosNormalizados),
        fechaLimiteFinal,
        solicitudActual.id,
      ]
    );

    const observacionLimpia = String(observacion || "").trim();

    if (observacionLimpia) {
      await pool.query(
        `
        INSERT INTO observaciones
        (
          solicitud_id,
          funcionario_id,
          mensaje,
          estado_resultante
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          resultado.rows[0].id,
          req.usuario.id,
          observacionLimpia,
          estadoNormalizado,
        ]
      );
    }

    await registrarHistorialSolicitud({
      solicitudId: solicitudActual.id,
      actorId: req.usuario.id,
      actorRol: req.usuario.rol,
      accion: "estado",
      titulo: "Estado de solicitud actualizado",
      descripcion:
        observacionLimpia ||
        `El estado cambió de ${solicitudActual.estado} a ${estadoNormalizado}.`,
      cambios: {
        estadoAnterior: solicitudActual.estado,
        estadoNuevo: estadoNormalizado,
        documentosFaltantes: documentosNormalizados,
        fechaLimiteDocumentos: fechaLimiteFinal,
      },
    });

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      resultado.rows[0].codigo
    );
    const solicitudFormateada = formatearSolicitud(solicitudCompleta);
    const correo = await enviarCorreoSeguro({
      to: solicitudFormateada.correoContacto,
      ...solicitudActualizadaTemplate(solicitudFormateada),
    });

    return res.json({
      ok: true,
      mensaje: "Solicitud actualizada correctamente.",
      correoEnviado: correo.sent,
      solicitud: {
        ...solicitudFormateada,
        correoEnviado: correo.sent,
      },
    });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al actualizar la solicitud.",
    });
  }
};

const subirDocumentosSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "usuario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo usuarios ciudadanos pueden subir documentos.",
      });
    }

    const { id } = req.params;
    const documentosDesdeArchivos = obtenerDocumentosDesdeArchivos(req.files);

    if (documentosDesdeArchivos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes adjuntar al menos un documento.",
      });
    }

    const solicitudActual = await obtenerSolicitudResumenPorIdOCodigo(id);

    if (!solicitudActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    if (solicitudActual.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes subir documentos a esta solicitud porque no pertenece a tu usuario.",
      });
    }

    await insertarDocumentosSolicitud(
      solicitudActual.id,
      documentosDesdeArchivos
    );

    const resultado = await pool.query(
      `
      UPDATE solicitudes
      SET estado = $1,
          documentos_faltantes = '[]'::jsonb,
          fecha_limite_documentos = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING codigo
      `,
      ["en_revision", solicitudActual.id]
    );

    await registrarHistorialSolicitud({
      solicitudId: solicitudActual.id,
      actorId: req.usuario.id,
      actorRol: req.usuario.rol,
      accion: "documentos",
      titulo: "Documentos adicionales recibidos",
      descripcion: `El ciudadano adjuntó ${documentosDesdeArchivos.length} documento(s) solicitado(s).`,
      cambios: {
        estadoAnterior: solicitudActual.estado,
        estadoNuevo: "en_revision",
        documentosAdjuntos: documentosDesdeArchivos.map(
          (documento) => documento.nombre,
        ),
      },
    });

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      resultado.rows[0].codigo
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Documentos subidos correctamente.",
      solicitud: formatearSolicitud(solicitudCompleta),
    });
  } catch (error) {
    console.error("Error al subir documentos de solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al subir documentos.",
    });
  }
};

const descargarDocumentoSolicitud = async (req, res) => {
  try {
    if (!/^\d+$/.test(String(req.params.documentoId || ""))) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador del documento no es válido.",
      });
    }

    const documento = await obtenerDocumentoSolicitud(
      req.params.id,
      req.params.documentoId,
    );

    if (!documento) {
      return res.status(404).json({
        ok: false,
        mensaje: "Documento no encontrado.",
      });
    }

    const autorizado =
      (req.usuario.rol === "usuario" &&
        documento.usuario_id === req.usuario.id) ||
      (req.usuario.rol === "funcionario" &&
        documento.funcionario_id === req.usuario.id);

    if (!autorizado) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para descargar este documento.",
      });
    }

    const rutaGuardada = String(documento.ruta_archivo || "");
    const rutaRelativa = rutaGuardada
      .replace(/^[/\\]?uploads[/\\]/i, "")
      .replace(/^[/\\]+/, "");
    const rutaAbsoluta = path.resolve(uploadsRoot, rutaRelativa);

    if (
      !rutaRelativa ||
      !rutaAbsoluta.startsWith(`${uploadsRoot}${path.sep}`) ||
      !fs.existsSync(rutaAbsoluta)
    ) {
      return res.status(404).json({
        ok: false,
        mensaje: "El archivo físico no está disponible.",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(documento.nombre_archivo)}`,
    );
    res.type(
      documento.tipo_archivo ||
        documento.tipo_documento ||
        "application/octet-stream",
    );
    return res.sendFile(rutaAbsoluta);
  } catch (error) {
    console.error("Error al descargar documento:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al descargar el documento.",
    });
  }
};

const validarDocumentoSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "funcionario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo funcionarios pueden validar documentos.",
      });
    }

    if (!/^\d+$/.test(String(req.params.documentoId || ""))) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador del documento no es válido.",
      });
    }

    const solicitudActual = await obtenerSolicitudResumenPorIdOCodigo(
      req.params.id,
    );

    if (!solicitudActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    if (solicitudActual.funcionario_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje: "La solicitud no está asignada a tu usuario.",
      });
    }

    const estado = String(req.body.estado || "").trim().toLowerCase();

    if (!["pendiente", "aprobado", "rechazado"].includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "El estado del documento no es válido.",
      });
    }

    const documento = await obtenerDocumentoSolicitud(
      req.params.id,
      req.params.documentoId,
    );

    if (!documento) {
      return res.status(404).json({
        ok: false,
        mensaje: "Documento no encontrado.",
      });
    }

    const descripcion = String(req.body.descripcion || "").trim();
    await pool.query(
      `
      UPDATE documentos
      SET estado_validacion = $1,
          descripcion = CASE
            WHEN $2 = '' THEN descripcion
            ELSE $2
          END
      WHERE id = $3
        AND solicitud_id = $4
      `,
      [estado, descripcion, documento.id, solicitudActual.id],
    );

    await registrarHistorialSolicitud({
      solicitudId: solicitudActual.id,
      actorId: req.usuario.id,
      actorRol: req.usuario.rol,
      accion: "documentos",
      titulo:
        estado === "aprobado"
          ? "Documento aprobado"
          : estado === "rechazado"
            ? "Documento rechazado"
            : "Documento pendiente de revisión",
      descripcion:
        descripcion ||
        `El documento ${documento.nombre_archivo} quedó en estado ${estado}.`,
      cambios: {
        documentoId: documento.id,
        documento: documento.nombre_archivo,
        estadoAnterior: documento.estado_validacion,
        estadoNuevo: estado,
      },
    });

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      solicitudActual.codigo,
    );
    const solicitudFormateada = formatearSolicitud(solicitudCompleta);
    const correo = await enviarCorreoSeguro({
      to: solicitudFormateada.correoContacto,
      ...solicitudActualizadaTemplate(solicitudFormateada),
    });

    return res.json({
      ok: true,
      mensaje: "Documento actualizado correctamente.",
      correoEnviado: correo.sent,
      solicitud: solicitudFormateada,
    });
  } catch (error) {
    console.error("Error al validar documento:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al validar el documento.",
    });
  }
};

const derivarSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "funcionario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo funcionarios pueden derivar solicitudes.",
      });
    }

    const solicitudActual = await obtenerSolicitudResumenPorIdOCodigo(
      req.params.id,
    );

    if (!solicitudActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    if (solicitudActual.funcionario_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje: "La solicitud no está asignada a tu usuario.",
      });
    }

    const area = String(req.body.area || "").trim();

    if (!areasMunicipales.includes(area)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes seleccionar un área municipal válida.",
      });
    }

    const funcionarioId = await obtenerFuncionarioAsignado(area);

    if (!funcionarioId) {
      return res.status(409).json({
        ok: false,
        mensaje: "No existe un funcionario disponible para el área seleccionada.",
      });
    }

    await pool.query(
      `
      UPDATE solicitudes
      SET funcionario_id = $1,
          area_responsable = $2,
          estado = 'derivada',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [funcionarioId, area, solicitudActual.id],
    );

    await registrarHistorialSolicitud({
      solicitudId: solicitudActual.id,
      actorId: req.usuario.id,
      actorRol: req.usuario.rol,
      accion: "derivacion",
      titulo: "Solicitud derivada",
      descripcion: `La solicitud fue derivada al área ${area}.`,
      cambios: {
        areaAnterior: solicitudActual.area_responsable,
        areaNueva: area,
        funcionarioAnterior: solicitudActual.funcionario_id,
        funcionarioNuevo: funcionarioId,
      },
    });

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      solicitudActual.codigo,
    );
    const solicitudFormateada = formatearSolicitud(solicitudCompleta);
    const correo = await enviarCorreoSeguro({
      to: solicitudFormateada.correoContacto,
      ...solicitudActualizadaTemplate(solicitudFormateada),
    });

    return res.json({
      ok: true,
      mensaje: "Solicitud derivada correctamente.",
      correoEnviado: correo.sent,
      solicitud: solicitudFormateada,
    });
  } catch (error) {
    console.error("Error al derivar solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al derivar la solicitud.",
    });
  }
};

const crearAgendamientoSolicitud = async (req, res) => {
  try {
    if (req.usuario.rol !== "usuario") {
      return res.status(403).json({
        ok: false,
        mensaje: "Solo usuarios ciudadanos pueden agendar una cita.",
      });
    }

    const { id } = req.params;
    const { fechaHora, fecha_hora } = req.body;

    const fechaHoraFinal = fechaHora || fecha_hora;

    if (!fechaHoraFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes seleccionar una fecha y hora para el agendamiento.",
      });
    }

    const fechaDate = validarFechaHoraAgendamiento(fechaHoraFinal);

    const busqueda = obtenerCondicionSolicitudPorIdOCodigo("s", id);

    const solicitudResult = await pool.query(
      `
      ${selectSolicitudesBase}
      WHERE ${busqueda.condicion}
      LIMIT 1
      `,
      [busqueda.parametro]
    );

    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitudActual = solicitudResult.rows[0];

    if (solicitudActual.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes agendar una cita para una solicitud que no pertenece a tu usuario.",
      });
    }

    if (!solicitudActual.funcionario_id) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "La solicitud aún no tiene un funcionario asignado para agendar una cita.",
      });
    }

    const conflictoFuncionario = await pool.query(
      `
      SELECT id
      FROM agendamientos
      WHERE funcionario_id = $1
        AND fecha_hora = $2
        AND estado IN ('agendada', 'confirmada')
      LIMIT 1
      `,
      [solicitudActual.funcionario_id, fechaDate]
    );

    if (conflictoFuncionario.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje:
          "El funcionario ya tiene una cita agendada en ese horario. Selecciona otro horario.",
      });
    }

    const agendamientoExistente = await pool.query(
      `
      SELECT id
      FROM agendamientos
      WHERE solicitud_id = $1
        AND usuario_id = $2
        AND estado IN ('agendada', 'confirmada')
      LIMIT 1
      `,
      [solicitudActual.id, req.usuario.id]
    );

    if (agendamientoExistente.rows.length > 0) {
      await pool.query(
        `
        UPDATE agendamientos
        SET estado = 'reagendada',
            fecha_hora = $1
        WHERE id = $2
        `,
        [fechaDate, agendamientoExistente.rows[0].id]
      );

      await pool.query(
        `
        UPDATE agendamientos
        SET estado = 'agendada'
        WHERE id = $1
        `,
        [agendamientoExistente.rows[0].id]
      );

      const agendamientoActualizado = await pool.query(
        `
        SELECT id, fecha_hora, estado
        FROM agendamientos
        WHERE id = $1
        LIMIT 1
        `,
        [agendamientoExistente.rows[0].id]
      );

      await pool.query(
        `
        UPDATE solicitudes
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [solicitudActual.id]
      );

      const agendamiento = {
        id: agendamientoActualizado.rows[0].id,
        solicitudId: solicitudActual.id,
        solicitudCodigo: solicitudActual.codigo,
        codigoSolicitud: solicitudActual.codigo,
        usuarioId: req.usuario.id,
        funcionarioId: solicitudActual.funcionario_id,
        fechaHora: agendamientoActualizado.rows[0].fecha_hora,
        estado: agendamientoActualizado.rows[0].estado,
        tramite: solicitudActual.tipo_tramite,
        tipoTramite: solicitudActual.tipo_tramite,
        funcionarioNombre: solicitudActual.funcionario_nombre,
        funcionarioCorreo: solicitudActual.funcionario_correo,
        funcionarioArea: solicitudActual.funcionario_area,
        funcionarioCargo: solicitudActual.funcionario_cargo,
      };
      const correoEnviado = await notificarCita(
        solicitudActual,
        agendamiento.fechaHora,
        "reagendada",
      );

      return res.json({
        ok: true,
        mensaje: "Agendamiento actualizado correctamente.",
        correoEnviado,
        agendamiento,
      });
    }

    const resultadoAgendamiento = await pool.query(
      `
      INSERT INTO agendamientos
      (
        solicitud_id,
        usuario_id,
        funcionario_id,
        fecha_hora,
        estado
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, fecha_hora, estado
      `,
      [
        solicitudActual.id,
        req.usuario.id,
        solicitudActual.funcionario_id,
        fechaDate,
        "agendada",
      ]
    );

    await pool.query(
      `
      UPDATE solicitudes
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [solicitudActual.id]
    );

    const agendamiento = {
      id: resultadoAgendamiento.rows[0].id,
      solicitudId: solicitudActual.id,
      solicitudCodigo: solicitudActual.codigo,
      codigoSolicitud: solicitudActual.codigo,
      usuarioId: req.usuario.id,
      funcionarioId: solicitudActual.funcionario_id,
      fechaHora: resultadoAgendamiento.rows[0].fecha_hora,
      estado: resultadoAgendamiento.rows[0].estado,
      tramite: solicitudActual.tipo_tramite,
      tipoTramite: solicitudActual.tipo_tramite,
      funcionarioNombre: solicitudActual.funcionario_nombre,
      funcionarioCorreo: solicitudActual.funcionario_correo,
      funcionarioArea: solicitudActual.funcionario_area,
      funcionarioCargo: solicitudActual.funcionario_cargo,
    };
    const correoEnviado = await notificarCita(
      solicitudActual,
      agendamiento.fechaHora,
      "agendada",
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Agendamiento creado correctamente.",
      correoEnviado,
      agendamiento,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        ok: false,
        mensaje: error.message,
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        ok: false,
        mensaje:
          "El horario acaba de ser reservado. Selecciona otra fecha y hora.",
      });
    }

    console.error("Error al crear agendamiento:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al crear el agendamiento.",
    });
  }
};

const obtenerMisAgendamientos = async (req, res) => {
  try {
    let query = selectAgendamientosBase;
    const params = [];

    if (req.usuario.rol === "usuario") {
      query += " WHERE a.usuario_id = $1";
      params.push(req.usuario.id);
    }

    if (req.usuario.rol === "funcionario") {
      query += " WHERE a.funcionario_id = $1";
      params.push(req.usuario.id);
    }

    query += " ORDER BY a.fecha_hora ASC";

    const resultado = await pool.query(query, params);

    return res.json({
      ok: true,
      agendamientos: resultado.rows.map(formatearAgendamiento),
    });
  } catch (error) {
    console.error("Error al obtener agendamientos:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener agendamientos.",
    });
  }
};

const obtenerAgendamientosSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitudActual = await obtenerSolicitudResumenPorIdOCodigo(id);

    if (!solicitudActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    if (
      req.usuario.rol === "usuario" &&
      solicitudActual.usuario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes ver agendamientos de una solicitud que no pertenece a tu usuario.",
      });
    }

    if (
      req.usuario.rol === "funcionario" &&
      solicitudActual.funcionario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        mensaje:
          "No puedes ver agendamientos de una solicitud que no está asignada a tu usuario.",
      });
    }

    const resultado = await pool.query(
      `
      ${selectAgendamientosBase}
      WHERE a.solicitud_id = $1
      ORDER BY a.fecha_hora ASC
      `,
      [solicitudActual.id]
    );

    return res.json({
      ok: true,
      agendamientos: resultado.rows.map(formatearAgendamiento),
    });
  } catch (error) {
    console.error("Error al obtener agendamientos de solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener agendamientos de la solicitud.",
    });
  }
};

const eliminarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const busqueda = obtenerCondicionSolicitudPorIdOCodigo("s", id);

    let resultado;

    if (req.usuario.rol === "usuario") {
      resultado = await pool.query(
        `
        DELETE FROM solicitudes s
        WHERE ${busqueda.condicion}
          AND s.usuario_id = $2
        RETURNING id
        `,
        [busqueda.parametro, req.usuario.id]
      );
    } else {
      resultado = await pool.query(
        `
        DELETE FROM solicitudes s
        WHERE ${busqueda.condicion}
          AND s.funcionario_id = $2
        RETURNING id
        `,
        [busqueda.parametro, req.usuario.id]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada o sin permisos.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Solicitud eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al eliminar la solicitud.",
    });
  }
};

module.exports = {
  crearSolicitud,
  listarSolicitudes,
  obtenerDatosReporte,
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  subirDocumentosSolicitud,
  descargarDocumentoSolicitud,
  validarDocumentoSolicitud,
  derivarSolicitud,
  crearAgendamientoSolicitud,
  obtenerMisAgendamientos,
  obtenerAgendamientosSolicitud,
  eliminarSolicitud,
};
