const pool = require("../../../core/database/connection");

const solicitudColumns = `
    s.id,
    s.codigo,
    s.usuario_id,
    s.funcionario_id,
    s.tipo_tramite,
    s.razon_social,
    s.rut_empresa,
    s.direccion,
    s.tipo_patente,
    s.rol_avaluo,
    s.pyme,
    s.estado,
    s.correo_contacto,
    s.telefono_contacto,
    s.giro,
    s.superficie,
    s.observaciones_solicitante,
    s.prioridad,
    s.area_responsable,
    s.datos_tramite,
    s.documentos_faltantes,
    s.fecha_limite_documentos,
    s.created_at,
    s.updated_at
`;

const selectSolicitudesBase = `
  SELECT
    ${solicitudColumns},
    u.nombre AS usuario_nombre,
    u.correo AS usuario_correo,
    u.rut AS usuario_rut,
    f.nombre AS funcionario_nombre,
    f.correo AS funcionario_correo,
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
            'estado', d.estado_validacion,
            'estadoRecepcion', d.estado,
            'descripcion', COALESCE(d.descripcion, 'Documento asociado a la solicitud.'),
            'url', '/solicitudes/' || s.codigo || '/documentos/' || d.id || '/archivo',
            'createdAt', d.created_at
          )
          ORDER BY d.created_at ASC
        )
        FROM documentos d
        WHERE d.solicitud_id = s.id
      ),
      '[]'::json
    ) AS documentos,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', h.id,
            'fecha', h.created_at,
            'titulo', h.titulo,
            'descripcion', h.descripcion,
            'tipo', h.accion,
            'actorNombre', actor.nombre,
            'actorRol', h.actor_rol,
            'cambios', h.cambios
          )
          ORDER BY h.created_at DESC, h.id DESC
        )
        FROM historial_solicitudes h
        LEFT JOIN usuarios actor ON actor.id = h.actor_id
        WHERE h.solicitud_id = s.id
      ),
      '[]'::json
    ) AS historial
  FROM solicitudes s
  INNER JOIN usuarios u ON u.id = s.usuario_id
  LEFT JOIN usuarios f ON f.id = s.funcionario_id
`;

const selectAgendamientosBase = `
  SELECT
    a.id,
    a.solicitud_id,
    a.usuario_id,
    a.funcionario_id,
    a.fecha_hora,
    a.estado,
    a.created_at,
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

const obtenerCondicionSolicitudPorIdOCodigo = (alias = "s", value) => {
  const numericId = /^\d+$/.test(String(value || ""));

  return numericId
    ? { condicion: `${alias}.id = $1`, parametro: Number(value) }
    : { condicion: `${alias}.codigo = $1`, parametro: value };
};

const obtenerPaginacion = (request) => {
  const page = Math.max(Number(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(request.query.limit) || 10, 1), 50);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const reservarIdentidadSolicitud = async (database = pool) => {
  const result = await database.query(
    "SELECT nextval(pg_get_serial_sequence('solicitudes', 'id')) AS id",
  );
  const id = Number(result.rows[0].id);

  return {
    id,
    codigo: `SOL-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`,
  };
};

const obtenerFuncionarioAsignado = async (area, database = pool) => {
  const result = await database.query(
    `
    SELECT u.id
    FROM usuarios u
    LEFT JOIN solicitudes s
      ON s.funcionario_id = u.id
      AND s.estado IN ('pendiente', 'en_revision', 'observada')
    WHERE u.rol = 'funcionario'
      AND (
        lower(COALESCE(u.area, '')) = lower(COALESCE($1, ''))
        OR NOT EXISTS (
          SELECT 1
          FROM usuarios area_user
          WHERE area_user.rol = 'funcionario'
            AND lower(COALESCE(area_user.area, '')) =
              lower(COALESCE($1, ''))
        )
      )
    GROUP BY u.id
    ORDER BY COUNT(s.id) ASC, u.id ASC
    LIMIT 1
    `,
    [area],
  );

  return result.rows[0]?.id || null;
};

const insertarDocumentosSolicitud = async (
  solicitudId,
  documentos = [],
  database = pool,
) => {
  for (const documento of documentos) {
    const nombreArchivo =
      documento.nombre ||
      documento.name ||
      documento.nombreArchivo ||
      "Documento sin nombre";
    const tipoArchivo =
      documento.tipo || documento.type || documento.tipoArchivo || "archivo";
    const sizeBytes =
      documento.size || documento.sizeBytes || documento.tamano || 0;
    const rutaArchivo =
      documento.rutaArchivo || documento.ruta_archivo || documento.url || null;

    await database.query(
      `
      INSERT INTO documentos
      (
        solicitud_id, nombre_archivo, tipo_documento, tipo_archivo,
        size_bytes, ruta_archivo, estado_validacion, estado, descripcion
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', 'recibido', $7)
      `,
      [
        solicitudId,
        nombreArchivo,
        tipoArchivo,
        tipoArchivo,
        sizeBytes,
        rutaArchivo,
        "Documento adjuntado por el solicitante.",
      ],
    );
  }
};

const obtenerSolicitudCompletaPorCodigo = async (codigo, database = pool) => {
  const result = await database.query(
    `
    ${selectSolicitudesBase}
    WHERE s.codigo = $1
    LIMIT 1
    `,
    [codigo],
  );

  return result.rows[0] || null;
};

const obtenerSolicitudResumenPorIdOCodigo = async (
  value,
  database = pool,
) => {
  const busqueda = obtenerCondicionSolicitudPorIdOCodigo("s", value);
  const result = await database.query(
    `
    SELECT
      s.id,
      s.codigo,
      s.usuario_id,
      s.funcionario_id,
      s.tipo_tramite,
      s.estado,
      s.area_responsable,
      s.datos_tramite,
      u.nombre AS usuario_nombre,
      u.correo AS usuario_correo,
      f.nombre AS funcionario_nombre,
      f.correo AS funcionario_correo,
      f.area AS funcionario_area,
      f.cargo AS funcionario_cargo
    FROM solicitudes s
    INNER JOIN usuarios u ON u.id = s.usuario_id
    LEFT JOIN usuarios f ON f.id = s.funcionario_id
    WHERE ${busqueda.condicion}
    LIMIT 1
    `,
    [busqueda.parametro],
  );

  return result.rows[0] || null;
};

const registrarHistorialSolicitud = async (
  {
    solicitudId,
    actorId,
    actorRol,
    accion,
    titulo,
    descripcion,
    cambios = {},
  },
  database = pool,
) => {
  await database.query(
    `
    INSERT INTO historial_solicitudes
    (
      solicitud_id,
      actor_id,
      actor_rol,
      accion,
      titulo,
      descripcion,
      cambios
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      solicitudId,
      actorId || null,
      actorRol || "sistema",
      accion,
      titulo,
      descripcion,
      JSON.stringify(cambios),
    ],
  );
};

const obtenerDocumentoSolicitud = async (
  solicitudValue,
  documentoId,
  database = pool,
) => {
  const busqueda = obtenerCondicionSolicitudPorIdOCodigo("s", solicitudValue);
  const result = await database.query(
    `
    SELECT
      d.id,
      d.solicitud_id,
      d.nombre_archivo,
      d.tipo_archivo,
      d.tipo_documento,
      d.ruta_archivo,
      d.estado_validacion,
      s.codigo,
      s.usuario_id,
      s.funcionario_id
    FROM documentos d
    INNER JOIN solicitudes s ON s.id = d.solicitud_id
    WHERE ${busqueda.condicion}
      AND d.id = $2
    LIMIT 1
    `,
    [busqueda.parametro, Number(documentoId)],
  );

  return result.rows[0] || null;
};

module.exports = {
  pool,
  selectAgendamientosBase,
  selectSolicitudesBase,
  insertarDocumentosSolicitud,
  obtenerCondicionSolicitudPorIdOCodigo,
  obtenerFuncionarioAsignado,
  obtenerDocumentoSolicitud,
  obtenerPaginacion,
  obtenerSolicitudCompletaPorCodigo,
  obtenerSolicitudResumenPorIdOCodigo,
  registrarHistorialSolicitud,
  reservarIdentidadSolicitud,
};
