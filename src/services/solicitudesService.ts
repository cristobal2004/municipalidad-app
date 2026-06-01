import { funcionariosService } from "./funcionariosService";

export interface Solicitud {
  id?: string;
  codigo?: string;
  solicitudId?: string;
  tramite?: string;
  tipoTramite?: string;
  tipoPatente?: string;
  estado?: string;
  area?: string;
  departamento?: string;
  areaResponsable?: string;
  encargado?: string;
  funcionario?: string;
  asignadoA?: string;
  funcionarioAsignado?: string;
  funcionarioId?: string;
  cargoFuncionario?: string;
  numeroEmpleadoFuncionario?: string;
  fechaIngreso?: string;
  ultimaActualizacion?: string;
  solicitante?: string;
  nombreSolicitante?: string;
  razonSocial?: string;
  rut?: string;
  correo?: string;
  email?: string;
  telefono?: string;
  contacto?: string;
  direccion?: string;
  giro?: string;
  superficie?: string;
  observacion?: string;
  observaciones?: string;
  comentarioFuncionario?: string;
  documentosFaltantes?: string[] | string;
  fechaLimiteDocumentos?: string;
  [key: string]: any;
}

const STORAGE_KEY = "solicitudes";

const leerSolicitudesStorage = (): Solicitud[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const escribirSolicitudesStorage = (
  solicitudes: Solicitud[],
  emitirEvento = true
) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));

  if (emitirEvento) {
    window.dispatchEvent(new Event("solicitudesActualizadas"));
  }
};

const obtenerIdSolicitud = (solicitud: any) => {
  return solicitud?.codigo || solicitud?.id || solicitud?.solicitudId || "";
};

const generarCodigoSolicitud = (solicitudes: Solicitud[]) => {
  const numeros = solicitudes
    .map((solicitud) => obtenerIdSolicitud(solicitud))
    .map((id) => {
      const match = String(id).match(/SOL-2026-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .filter((numero) => !Number.isNaN(numero));

  const maximo = numeros.length > 0 ? Math.max(...numeros) : 0;
  const siguiente = String(maximo + 1).padStart(4, "0");

  return `SOL-2026-${siguiente}`;
};

const normalizarSolicitud = (
  solicitud: Solicitud,
  codigoForzado?: string
): Solicitud => {
  const codigo =
    codigoForzado ||
    solicitud.codigo ||
    solicitud.id ||
    solicitud.solicitudId ||
    "SOL-2026-0001";

  const base = {
    ...solicitud,
    id: codigo,
    codigo,
    solicitudId: codigo,
    tramite:
      solicitud.tramite ||
      solicitud.tipoTramite ||
      solicitud.tipoPatente ||
      "Trámite municipal",
    estado: solicitud.estado || "Ingresada",
    fechaIngreso:
      solicitud.fechaIngreso ||
      solicitud.fecha ||
      new Date().toLocaleString("es-CL"),
    ultimaActualizacion:
      solicitud.ultimaActualizacion ||
      solicitud.fechaActualizacion ||
      solicitud.fechaIngreso ||
      new Date().toLocaleString("es-CL"),
  };

  return funcionariosService.normalizarSolicitudConFuncionario(base);
};

const normalizarSolicitudesExistentes = (solicitudes: Solicitud[]) => {
  return solicitudes.map((solicitud, index) => {
    const codigo =
      solicitud.codigo ||
      solicitud.id ||
      solicitud.solicitudId ||
      `SOL-2026-${String(index + 1).padStart(4, "0")}`;

    return normalizarSolicitud(solicitud, codigo);
  });
};

const crearNotificacionFuncionario = (solicitud: Solicitud) => {
  const idSolicitud = obtenerIdSolicitud(solicitud);
  const funcionario = solicitud.funcionarioAsignado || solicitud.encargado || "";

  if (!funcionario) return;

  const nuevaNotificacion = {
    id: `NF-${idSolicitud}`,
    titulo: "Nueva solicitud asignada",
    mensaje: `Se asignó la solicitud ${idSolicitud} a tu bandeja de gestión.`,
    fecha: solicitud.fechaIngreso || new Date().toLocaleString("es-CL"),
    leida: false,
    tipo: "asignacion",
    solicitudId: idSolicitud,
    accionTexto: "Ver solicitud",
    funcionario,
  };

  let notificaciones: any[] = [];

  try {
    const raw = localStorage.getItem("notificaciones_funcionario");
    const data = raw ? JSON.parse(raw) : [];
    notificaciones = Array.isArray(data) ? data : [];
  } catch {
    notificaciones = [];
  }

  const existe = notificaciones.some(
    (notificacion) => notificacion.id === nuevaNotificacion.id
  );

  if (!existe) {
    localStorage.setItem(
      "notificaciones_funcionario",
      JSON.stringify([nuevaNotificacion, ...notificaciones])
    );

    window.dispatchEvent(new Event("notificacionesFuncionarioActualizadas"));
  }
};

const crearNotificacionUsuario = (solicitud: Solicitud) => {
  const idSolicitud = obtenerIdSolicitud(solicitud);

  const nuevaNotificacion = {
    id: `NU-${idSolicitud}`,
    titulo: "Solicitud ingresada correctamente",
    mensaje: `Tu solicitud ${idSolicitud} fue registrada correctamente.`,
    fecha: solicitud.fechaIngreso || new Date().toLocaleString("es-CL"),
    leida: false,
    tipo: "tramite",
    solicitudId: idSolicitud,
    accionTexto: "Ver seguimiento",
  };

  let notificaciones: any[] = [];

  try {
    const raw = localStorage.getItem("notificaciones_usuario");
    const data = raw ? JSON.parse(raw) : [];
    notificaciones = Array.isArray(data) ? data : [];
  } catch {
    notificaciones = [];
  }

  const existe = notificaciones.some(
    (notificacion) => notificacion.id === nuevaNotificacion.id
  );

  if (!existe) {
    localStorage.setItem(
      "notificaciones_usuario",
      JSON.stringify([nuevaNotificacion, ...notificaciones])
    );

    window.dispatchEvent(new Event("notificacionesUsuarioActualizadas"));
  }
};

const guardarUltimaSolicitud = (solicitud: Solicitud) => {
  const idSolicitud = obtenerIdSolicitud(solicitud);

  localStorage.setItem("ultima_solicitud_creada", JSON.stringify(solicitud));
  localStorage.setItem("ultimaSolicitudCreada", JSON.stringify(solicitud));
  localStorage.setItem("solicitud_confirmada", JSON.stringify(solicitud));
  localStorage.setItem("solicitudConfirmada", JSON.stringify(solicitud));
  localStorage.setItem("ultimaSolicitudId", idSolicitud);
};

const obtenerSolicitudes = (): Solicitud[] => {
  const solicitudes = leerSolicitudesStorage();
  const normalizadas = normalizarSolicitudesExistentes(solicitudes);

  escribirSolicitudesStorage(normalizadas, false);

  return normalizadas;
};

const obtenerSolicitudPorId = (id: string): Solicitud | null => {
  const solicitudes = obtenerSolicitudes();

  return (
    solicitudes.find((solicitud) => obtenerIdSolicitud(solicitud) === id) ||
    null
  );
};

const crearSolicitud = (solicitud: Solicitud): Solicitud => {
  const existentes = obtenerSolicitudes();
  const codigo = generarCodigoSolicitud(existentes);

  const nuevaSolicitud = normalizarSolicitud(
    {
      ...solicitud,
      id: codigo,
      codigo,
      solicitudId: codigo,
      estado: solicitud.estado || "Ingresada",
      fechaIngreso: new Date().toLocaleString("es-CL"),
      ultimaActualizacion: new Date().toLocaleString("es-CL"),
    },
    codigo
  );

  const actualizadas = [nuevaSolicitud, ...existentes];

  escribirSolicitudesStorage(actualizadas, true);
  guardarUltimaSolicitud(nuevaSolicitud);
  crearNotificacionFuncionario(nuevaSolicitud);
  crearNotificacionUsuario(nuevaSolicitud);

  return nuevaSolicitud;
};

const guardarSolicitud = (solicitud: Solicitud): Solicitud => {
  const existentes = obtenerSolicitudes();

  const codigo =
    solicitud.codigo ||
    solicitud.id ||
    solicitud.solicitudId ||
    generarCodigoSolicitud(existentes);

  const solicitudNormalizada = normalizarSolicitud(solicitud, codigo);

  const existe = existentes.some(
    (item) => obtenerIdSolicitud(item) === codigo
  );

  const actualizadas = existe
    ? existentes.map((item) =>
        obtenerIdSolicitud(item) === codigo ? solicitudNormalizada : item
      )
    : [solicitudNormalizada, ...existentes];

  escribirSolicitudesStorage(actualizadas, true);

  return solicitudNormalizada;
};

const actualizarSolicitud = (
  id: string,
  cambios: Partial<Solicitud>
): Solicitud | null => {
  const existentes = obtenerSolicitudes();

  const actual = existentes.find(
    (solicitud) => obtenerIdSolicitud(solicitud) === id
  );

  if (!actual) return null;

  const actualizada = guardarSolicitud({
    ...actual,
    ...cambios,
    ultimaActualizacion: new Date().toLocaleString("es-CL"),
  });

  return actualizada;
};

const eliminarSolicitud = (id: string) => {
  const existentes = obtenerSolicitudes();

  const actualizadas = existentes.filter(
    (solicitud) => obtenerIdSolicitud(solicitud) !== id
  );

  escribirSolicitudesStorage(actualizadas, true);
};

const obtenerSolicitudesPorUsuario = (identificadorUsuario: string) => {
  const usuarioNormalizado =
    funcionariosService.normalizarTexto(identificadorUsuario);

  if (!usuarioNormalizado) {
    return obtenerSolicitudes();
  }

  return obtenerSolicitudes().filter((solicitud) => {
    const posiblesDatosUsuario = [
      solicitud.correo,
      solicitud.email,
      solicitud.rut,
      solicitud.solicitante,
      solicitud.nombreSolicitante,
      solicitud.contacto,
    ];

    return posiblesDatosUsuario.some((dato) => {
      const datoNormalizado = funcionariosService.normalizarTexto(dato || "");
      return datoNormalizado === usuarioNormalizado;
    });
  });
};

const obtenerSolicitudesPorFuncionario = (nombreFuncionario: string) => {
  const funcionarioNormalizado =
    funcionariosService.normalizarTexto(nombreFuncionario);

  return obtenerSolicitudes().filter((solicitud) => {
    const encargadoNormalizado = funcionariosService.normalizarTexto(
      solicitud.encargado ||
        solicitud.funcionario ||
        solicitud.asignadoA ||
        solicitud.funcionarioAsignado ||
        ""
    );

    return encargadoNormalizado === funcionarioNormalizado;
  });
};

const obtenerUltimaSolicitud = (): Solicitud | null => {
  const keys = [
    "ultima_solicitud_creada",
    "ultimaSolicitudCreada",
    "solicitud_confirmada",
    "solicitudConfirmada",
  ];

  for (const key of keys) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    try {
      const data = JSON.parse(raw);

      if (data && typeof data === "object") {
        return normalizarSolicitud(data);
      }
    } catch {
      continue;
    }
  }

  const solicitudes = obtenerSolicitudes();

  return solicitudes.length > 0 ? solicitudes[0] : null;
};

export const solicitudesService = {
  obtenerSolicitudes,
  listarSolicitudes: obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  guardarSolicitud,
  actualizarSolicitud,
  eliminarSolicitud,
  borrarSolicitud: eliminarSolicitud,
  obtenerSolicitudesPorUsuario,
  obtenerSolicitudesPorFuncionario,
  obtenerUltimaSolicitud,
};