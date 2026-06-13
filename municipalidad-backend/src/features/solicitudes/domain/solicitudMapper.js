const normalizarEstado = (estado) => {
  const valor = String(estado || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const aliases = {
    ingresada: "pendiente",
    en_proceso: "en_revision",
    "en_revisión": "en_revision",
    pendiente_de_documentos: "observada",
    falta_documentacion: "observada",
    "falta_documentación": "observada",
    documentos_pendientes: "observada",
    aprobado: "aprobada",
    rechazado: "rechazada",
  };

  const normalized = aliases[valor] || valor;
  const allowedStates = [
    "pendiente",
    "en_revision",
    "observada",
    "aprobada",
    "rechazada",
  ];

  return allowedStates.includes(normalized) ? normalized : "pendiente";
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
  if (typeof valor === "boolean") {
    return valor;
  }

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

const parsearObjeto = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const normalizarDocumentosFaltantes = (documentosFaltantes) => {
  if (Array.isArray(documentosFaltantes)) {
    return documentosFaltantes
      .map((documento) => String(documento).trim())
      .filter(Boolean);
  }

  if (
    typeof documentosFaltantes === "string" &&
    documentosFaltantes.trim()
  ) {
    try {
      const data = JSON.parse(documentosFaltantes);

      if (Array.isArray(data)) {
        return data.map((documento) => String(documento).trim()).filter(Boolean);
      }
    } catch {
      return documentosFaltantes
        .split(",")
        .map((documento) => documento.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const obtenerDocumentosDesdeArchivos = (archivos = []) =>
  Array.isArray(archivos)
    ? archivos.map((archivo) => ({
        nombre: archivo.originalname,
        tipo: archivo.mimetype,
        size: archivo.size,
        rutaArchivo: `/uploads/documentos/${archivo.filename}`,
      }))
    : [];

const formatearSolicitud = (solicitud) => ({
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
  areaResponsable:
    solicitud.area_responsable || solicitud.funcionario_area || "",
  datosTramite: parsearObjeto(solicitud.datos_tramite),
  estadoBackend: solicitud.estado,
  estado: convertirEstadoFrontend(solicitud.estado),
  fechaIngreso: solicitud.created_at,
  fechaRecibo: solicitud.created_at,
  ultimaActualizacion: solicitud.updated_at,
  funcionarioAsignado: solicitud.funcionario_nombre,
  funcionarioCorreo: solicitud.funcionario_correo,
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
  historial: parsearDocumentos(solicitud.historial),
  documentosFaltantes: parsearDocumentos(solicitud.documentos_faltantes),
  fechaLimiteDocumentos: solicitud.fecha_limite_documentos,
});

const formatearAgendamiento = (agendamiento) => ({
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
});

module.exports = {
  convertirPyme,
  formatearAgendamiento,
  formatearSolicitud,
  normalizarDocumentosFaltantes,
  normalizarEstado,
  obtenerDocumentosDesdeArchivos,
  parsearDocumentos,
  parsearObjeto,
};
