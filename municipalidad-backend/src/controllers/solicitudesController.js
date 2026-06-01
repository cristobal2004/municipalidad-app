const pool = require("../db/connection");

const obtenerCodigoSolicitud = async () => {
  const resultado = await pool.query(
    "SELECT COALESCE(MAX(id), 0) + 1 AS siguiente FROM solicitudes"
  );

  const siguiente = String(resultado.rows[0].siguiente).padStart(4, "0");

  return `SOL-2026-${siguiente}`;
};

const obtenerFuncionarioAsignado = async () => {
  const resultadoFuncionario = await pool.query(
    `
    SELECT id
    FROM usuarios
    WHERE rol = 'funcionario'
    ORDER BY RANDOM()
    LIMIT 1
    `
  );

  if (resultadoFuncionario.rows.length > 0) {
    return resultadoFuncionario.rows[0].id;
  }

  return null;
};

const normalizarEstado = (estado) => {
  const valor = String(estado || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (valor === "ingresada") return "pendiente";
  if (valor === "en_proceso") return "en_revision";
  if (valor === "en_revisión") return "en_revision";
  if (valor === "pendiente_de_documentos") return "observada";
  if (valor === "falta_documentacion") return "observada";
  if (valor === "falta_documentación") return "observada";
  if (valor === "documentos_pendientes") return "observada";
  if (valor === "aprobado") return "aprobada";
  if (valor === "rechazado") return "rechazada";

  const estadosPermitidos = [
    "pendiente",
    "en_revision",
    "observada",
    "aprobada",
    "rechazada",
  ];

  return estadosPermitidos.includes(valor) ? valor : "pendiente";
};

const convertirEstadoFrontend = (estado) => {
  const estados = {
    pendiente: "Ingresada",
    en_revision: "En revisión",
    observada: "Pendiente de documentos",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
  };

  return estados[estado] || "Ingresada";
};

const convertirPyme = (valor) => {
  if (typeof valor === "boolean") return valor;

  const texto = String(valor || "")
    .trim()
    .toLowerCase();

  return texto === "si" || texto === "sí" || texto === "true";
};

const parsearDocumentos = (documentos) => {
  if (Array.isArray(documentos)) {
    return documentos;
  }

  if (typeof documentos === "string") {
    try {
      const data = JSON.parse(documentos);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizarDocumentosFaltantes = (documentosFaltantes) => {
  if (Array.isArray(documentosFaltantes)) {
    return documentosFaltantes
      .map((documento) => String(documento).trim())
      .filter((documento) => documento !== "");
  }

  if (
    typeof documentosFaltantes === "string" &&
    documentosFaltantes.trim() !== ""
  ) {
    try {
      const data = JSON.parse(documentosFaltantes);

      if (Array.isArray(data)) {
        return data
          .map((documento) => String(documento).trim())
          .filter((documento) => documento !== "");
      }
    } catch {
      return documentosFaltantes
        .split(",")
        .map((documento) => documento.trim())
        .filter((documento) => documento !== "");
    }
  }

  return [];
};

const obtenerDocumentosDesdeArchivos = (archivos = []) => {
  if (!Array.isArray(archivos) || archivos.length === 0) {
    return [];
  }

  return archivos.map((archivo) => ({
    nombre: archivo.originalname,
    tipo: archivo.mimetype,
    size: archivo.size,
    rutaArchivo: `/uploads/documentos/${archivo.filename}`,
  }));
};

const insertarDocumentosSolicitud = async (solicitudId, documentos = []) => {
  if (!Array.isArray(documentos) || documentos.length === 0) {
    return;
  }

  for (const documento of documentos) {
    const nombreArchivo =
      documento.nombre ||
      documento.name ||
      documento.nombreArchivo ||
      "Documento sin nombre";

    const tipoArchivo =
      documento.tipo ||
      documento.type ||
      documento.tipoArchivo ||
      "archivo";

    const sizeBytes =
      documento.size || documento.sizeBytes || documento.tamano || 0;

    const rutaArchivo =
      documento.rutaArchivo || documento.ruta_archivo || documento.url || null;

    await pool.query(
      `
      INSERT INTO documentos
      (
        solicitud_id,
        nombre_archivo,
        tipo_documento,
        tipo_archivo,
        size_bytes,
        ruta_archivo,
        estado_validacion,
        estado,
        descripcion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        solicitudId,
        nombreArchivo,
        tipoArchivo,
        tipoArchivo,
        sizeBytes,
        rutaArchivo,
        "pendiente",
        "recibido",
        "Documento adjuntado por el solicitante.",
      ]
    );
  }
};

const formatearSolicitud = (solicitud) => {
  return {
    id: solicitud.codigo,
    idInterno: solicitud.id,
    codigo: solicitud.codigo,
    solicitudId: solicitud.codigo,

    usuarioId: solicitud.usuario_id,
    funcionarioId: solicitud.funcionario_id,

    tipoTramite: solicitud.tipo_tramite,
    tramite: solicitud.tipo_tramite,

    razonSocial: solicitud.razon_social,
    rut: solicitud.rut_empresa,
    rutEmpresa: solicitud.rut_empresa,
    direccion: solicitud.direccion,
    tipoPatente: solicitud.tipo_patente,
    rolAvaluo: solicitud.rol_avaluo,
    pyme: solicitud.pyme,

    correo: solicitud.correo_contacto || solicitud.usuario_correo,
    email: solicitud.correo_contacto || solicitud.usuario_correo,
    correoContacto: solicitud.correo_contacto || solicitud.usuario_correo,
    telefono: solicitud.telefono_contacto,
    telefonoContacto: solicitud.telefono_contacto,

    giro: solicitud.giro,
    superficie: solicitud.superficie,

    observacion: solicitud.observaciones_solicitante,
    observaciones: solicitud.observaciones_solicitante,
    observacionesSolicitante: solicitud.observaciones_solicitante,

    comentarioFuncionario: solicitud.comentario_funcionario || "",
    observacionFuncionario: solicitud.comentario_funcionario || "",
    fechaComentario: solicitud.fecha_comentario_funcionario || null,

    prioridad: solicitud.prioridad || "media",

    estadoBackend: solicitud.estado,
    estado: convertirEstadoFrontend(solicitud.estado),

    fechaIngreso: solicitud.created_at,
    fechaRecibo: solicitud.created_at,
    ultimaActualizacion: solicitud.updated_at,

    funcionarioAsignado: solicitud.funcionario_nombre,
    encargado: solicitud.funcionario_nombre,
    area: solicitud.funcionario_area,
    cargoFuncionario: solicitud.funcionario_cargo,
    numeroEmpleadoFuncionario: solicitud.funcionario_numero_empleado,

    usuarioNombre: solicitud.usuario_nombre,
    solicitante: solicitud.usuario_nombre,
    nombreSolicitante: solicitud.usuario_nombre,
    usuarioCorreo: solicitud.usuario_correo,
    usuarioRut: solicitud.usuario_rut,

    documentos: parsearDocumentos(solicitud.documentos),

    documentosFaltantes: parsearDocumentos(solicitud.documentos_faltantes),
    fechaLimiteDocumentos: solicitud.fecha_limite_documentos,
  };
};

const formatearAgendamiento = (agendamiento) => {
  return {
    id: agendamiento.id,
    solicitudId: agendamiento.solicitud_id,
    solicitudCodigo: agendamiento.solicitud_codigo,
    codigoSolicitud: agendamiento.solicitud_codigo,
    usuarioId: agendamiento.usuario_id,
    funcionarioId: agendamiento.funcionario_id,
    fechaHora: agendamiento.fecha_hora,
    fecha: agendamiento.fecha_hora,
    estado: agendamiento.estado || "agendada",
    createdAt: agendamiento.created_at,

    tramite: agendamiento.tipo_tramite,
    tipoTramite: agendamiento.tipo_tramite,

    usuarioNombre: agendamiento.usuario_nombre,
    usuarioCorreo: agendamiento.usuario_correo,

    funcionarioNombre: agendamiento.funcionario_nombre,
    funcionarioCorreo: agendamiento.funcionario_correo,
    funcionarioArea: agendamiento.funcionario_area,
    funcionarioCargo: agendamiento.funcionario_cargo,
  };
};

const selectSolicitudesBase = `
  SELECT 
    s.*,
    u.nombre AS usuario_nombre,
    u.correo AS usuario_correo,
    u.rut AS usuario_rut,
    f.nombre AS funcionario_nombre,
    f.area AS funcionario_area,
    f.cargo AS funcionario_cargo,
    f.numero_empleado AS funcionario_numero_empleado,

    (
      SELECT o.mensaje
      FROM observaciones o
      WHERE o.solicitud_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 1
    ) AS comentario_funcionario,

    (
      SELECT o.created_at
      FROM observaciones o
      WHERE o.solicitud_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 1
    ) AS fecha_comentario_funcionario,

    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', d.id,
            'nombre', d.nombre_archivo,
            'tipo', COALESCE(d.tipo_archivo, d.tipo_documento),
            'size', d.size_bytes,
            'estado', COALESCE(d.estado, d.estado_validacion),
            'descripcion', COALESCE(d.descripcion, 'Documento asociado a la solicitud.'),
            'rutaArchivo', d.ruta_archivo,
            'url', d.ruta_archivo,
            'createdAt', d.created_at
          )
          ORDER BY d.created_at ASC
        )
        FROM documentos d
        WHERE d.solicitud_id = s.id
      ),
      '[]'::json
    ) AS documentos
  FROM solicitudes s
  INNER JOIN usuarios u ON u.id = s.usuario_id
  LEFT JOIN usuarios f ON f.id = s.funcionario_id
`;

const selectAgendamientosBase = `
  SELECT
    a.*,
    s.codigo AS solicitud_codigo,
    s.tipo_tramite,
    u.nombre AS usuario_nombre,
    u.correo AS usuario_correo,
    f.nombre AS funcionario_nombre,
    f.correo AS funcionario_correo,
    f.area AS funcionario_area,
    f.cargo AS funcionario_cargo
  FROM agendamientos a
  INNER JOIN solicitudes s ON s.id = a.solicitud_id
  INNER JOIN usuarios u ON u.id = a.usuario_id
  LEFT JOIN usuarios f ON f.id = a.funcionario_id
`;

const obtenerSolicitudCompletaPorCodigo = async (codigo) => {
  const resultado = await pool.query(
    `
    ${selectSolicitudesBase}
    WHERE s.codigo = $1
    LIMIT 1
    `,
    [codigo]
  );

  return resultado.rows[0] || null;
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

    const codigo = await obtenerCodigoSolicitud();
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
      `,
      [
        codigo,
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

    query += " ORDER BY s.created_at DESC";

    const resultado = await pool.query(query, params);

    return res.json({
      ok: true,
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

const obtenerMisSolicitudes = async (req, res) => {
  try {
    const resultado = await pool.query(
      `
      ${selectSolicitudesBase}
      WHERE s.usuario_id = $1
      ORDER BY s.created_at DESC
      `,
      [req.usuario.id]
    );

    return res.json({
      ok: true,
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

    const resultado = await pool.query(
      `
      ${selectSolicitudesBase}
      WHERE s.codigo = $1 OR s.id::text = $1
      LIMIT 1
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitud = resultado.rows[0];

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

    const solicitudActualResult = await pool.query(
      `
      SELECT *
      FROM solicitudes
      WHERE codigo = $1 OR id::text = $1
      LIMIT 1
      `,
      [id]
    );

    if (solicitudActualResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitudActual = solicitudActualResult.rows[0];

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
      RETURNING *
      `,
      [
        estadoNormalizado,
        JSON.stringify(documentosNormalizados),
        fechaLimiteFinal,
        solicitudActual.id,
      ]
    );

    if (observacion && String(observacion).trim() !== "") {
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
          observacion,
          estadoNormalizado,
        ]
      );
    }

    const solicitudCompleta = await obtenerSolicitudCompletaPorCodigo(
      resultado.rows[0].codigo
    );

    return res.json({
      ok: true,
      mensaje: "Solicitud actualizada correctamente.",
      solicitud: formatearSolicitud(solicitudCompleta),
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

    const solicitudActualResult = await pool.query(
      `
      SELECT *
      FROM solicitudes
      WHERE codigo = $1 OR id::text = $1
      LIMIT 1
      `,
      [id]
    );

    if (solicitudActualResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitudActual = solicitudActualResult.rows[0];

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
      RETURNING *
      `,
      ["en_revision", solicitudActual.id]
    );

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

    const fechaDate = new Date(fechaHoraFinal);

    if (Number.isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        ok: false,
        mensaje: "La fecha y hora seleccionada no es válida.",
      });
    }

    const solicitudResult = await pool.query(
      `
      SELECT 
        s.*,
        f.nombre AS funcionario_nombre,
        f.correo AS funcionario_correo,
        f.area AS funcionario_area,
        f.cargo AS funcionario_cargo
      FROM solicitudes s
      LEFT JOIN usuarios f ON f.id = s.funcionario_id
      WHERE s.codigo = $1 OR s.id::text = $1
      LIMIT 1
      `,
      [id]
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
        SELECT *
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

      return res.json({
        ok: true,
        mensaje: "Agendamiento actualizado correctamente.",
        agendamiento: {
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
        },
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
      RETURNING *
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

    return res.status(201).json({
      ok: true,
      mensaje: "Agendamiento creado correctamente.",
      agendamiento: {
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
      },
    });
  } catch (error) {
    console.error("Error al crear agendamiento:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al crear el agendamiento.",
      error: error.message,
      detalle: error.detail || null,
      codigo: error.code || null,
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

    const solicitudActualResult = await pool.query(
      `
      SELECT *
      FROM solicitudes
      WHERE codigo = $1 OR id::text = $1
      LIMIT 1
      `,
      [id]
    );

    if (solicitudActualResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const solicitudActual = solicitudActualResult.rows[0];

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

    let resultado;

    if (req.usuario.rol === "usuario") {
      resultado = await pool.query(
        `
        DELETE FROM solicitudes
        WHERE (codigo = $1 OR id::text = $1)
          AND usuario_id = $2
        RETURNING *
        `,
        [id, req.usuario.id]
      );
    } else {
      resultado = await pool.query(
        `
        DELETE FROM solicitudes
        WHERE (codigo = $1 OR id::text = $1)
          AND funcionario_id = $2
        RETURNING *
        `,
        [id, req.usuario.id]
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
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  subirDocumentosSolicitud,
  crearAgendamientoSolicitud,
  obtenerMisAgendamientos,
  obtenerAgendamientosSolicitud,
  eliminarSolicitud,
};