export interface Solicitud {
  id: string;
  fechaRecibo: string;
  estado: string;
  encargado: string;
  area: string;
  observacion: string;

  razonSocial: string;
  rut: string;
  direccion: string;
  tipoPatente: string;
  rolAvaluo: string;
  pyme: string;

  documentos: string[];

  usuarioNombre: string;
  usuarioRut: string;
  usuarioCorreo: string;
}

const STORAGE_KEY = "solicitudes_usuario";

const funcionariosMunicipales = [
  {
    nombre: "Cristian Mejías",
    area: "Atención Gral.",
  },
  {
    nombre: "Benjamin Gomez",
    area: "Serv. Ciudadano",
  },
  {
    nombre: "Oscar Ruiz",
    area: "Finanzas",
  },
  {
    nombre: "Pablo Aguilera",
    area: "Obras Municipales",
  },
  {
    nombre: "Martina Ponce",
    area: "Patentes Comerciales",
  },
];

const solicitudesIniciales: Solicitud[] = [
  {
    id: "SOL-2026-0001",
    fechaRecibo: "18/04/26",
    estado: "En Proceso",
    encargado: "Cristian Mejías",
    area: "Atención Gral.",
    observacion: "En revisión de antecedentes.",
    razonSocial: "Almacén El Parque",
    rut: "76.123.456-7",
    direccion: "Av. Litoral 450, Santo Domingo",
    tipoPatente: "Comercial Definitiva",
    rolAvaluo: "1234-56",
    pyme: "Sí",
    documentos: ["Escritura_Sociedad.pdf", "Cert_Residencia.pdf"],
    usuarioNombre: "Usuario Demo",
    usuarioRut: "11.111.111-1",
    usuarioCorreo: "demo@municipalidad.cl",
  },
  {
    id: "SOL-2026-0002",
    fechaRecibo: "15/04/26",
    estado: "Falta Documentación",
    encargado: "Benjamin Gomez",
    area: "Serv. Ciudadano",
    observacion: "Subir copia de Cédula de Identidad.",
    razonSocial: "Panadería San Pedro",
    rut: "77.456.321-9",
    direccion: "Av. Principal 120, Santo Domingo",
    tipoPatente: "Comercial Provisoria",
    rolAvaluo: "2222-11",
    pyme: "Sí",
    documentos: ["Formulario_Solicitud.pdf"],
    usuarioNombre: "Usuario Demo",
    usuarioRut: "11.111.111-1",
    usuarioCorreo: "demo@municipalidad.cl",
  },
  {
    id: "SOL-2026-0003",
    fechaRecibo: "10/04/26",
    estado: "Aprobado",
    encargado: "Oscar Ruiz",
    area: "Finanzas",
    observacion: "Patente otorgada correctamente.",
    razonSocial: "Servicios Costa Azul",
    rut: "78.111.222-3",
    direccion: "Calle Los Pinos 45, Santo Domingo",
    tipoPatente: "Patente Profesional",
    rolAvaluo: "7890-12",
    pyme: "No",
    documentos: ["Resolucion_Final.pdf", "Comprobante_Pago.pdf"],
    usuarioNombre: "Usuario Demo",
    usuarioRut: "11.111.111-1",
    usuarioCorreo: "demo@municipalidad.cl",
  },
];

function normalizarSolicitudes(solicitudes: any[]): Solicitud[] {
  return solicitudes.map((solicitud, index) => ({
    id: solicitud.id || `SOL-2026-${String(index + 1).padStart(4, "0")}`,
    fechaRecibo: solicitud.fechaRecibo || "10/05/26",
    estado: solicitud.estado || "En Proceso",
    encargado: solicitud.encargado || "Cristian Mejías",
    area: solicitud.area || "Atención Gral.",
    observacion: solicitud.observacion || "Solicitud ingresada correctamente.",

    razonSocial: solicitud.razonSocial || "No informado",
    rut: solicitud.rut || "No informado",
    direccion: solicitud.direccion || "No informado",
    tipoPatente: solicitud.tipoPatente || "Patente Comercial",
    rolAvaluo: solicitud.rolAvaluo || "No informado",
    pyme: solicitud.pyme || "No informado",

    documentos: solicitud.documentos || [],

    usuarioNombre: solicitud.usuarioNombre || "Usuario Demo",
    usuarioRut: solicitud.usuarioRut || "11.111.111-1",
    usuarioCorreo: solicitud.usuarioCorreo || "demo@municipalidad.cl",
  }));
}

function obtenerSolicitudesGuardadas(): Solicitud[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesIniciales));
    return solicitudesIniciales;
  }

  try {
    const solicitudes = JSON.parse(data);
    const solicitudesNormalizadas = normalizarSolicitudes(solicitudes);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(solicitudesNormalizadas)
    );

    return solicitudesNormalizadas;
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesIniciales));
    return solicitudesIniciales;
  }
}

function guardarSolicitudes(solicitudes: Solicitud[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
}

function generarNuevoId(solicitudes: Solicitud[]) {
  const numeros = solicitudes.map((solicitud) => {
    const partes = solicitud.id.split("-");
    const ultimoNumero = partes[partes.length - 1];
    return Number(ultimoNumero);
  });

  const maximo = numeros.length > 0 ? Math.max(...numeros) : 0;
  const nuevoNumero = maximo + 1;

  return `SOL-2026-${String(nuevoNumero).padStart(4, "0")}`;
}

function obtenerFechaActual() {
  const fecha = new Date();

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = String(fecha.getFullYear()).slice(-2);

  return `${dia}/${mes}/${anio}`;
}

function asignarFuncionario(solicitudes: Solicitud[]) {
  const indice = solicitudes.length % funcionariosMunicipales.length;
  return funcionariosMunicipales[indice];
}

export const solicitudesService = {
  obtenerSolicitudes(): Solicitud[] {
    return obtenerSolicitudesGuardadas();
  },

  obtenerSolicitudesPorUsuario(usuarioCorreo: string): Solicitud[] {
    const solicitudes = obtenerSolicitudesGuardadas();

    return solicitudes.filter((solicitud) => {
      const esSolicitudDemo =
        solicitud.usuarioCorreo === "demo@municipalidad.cl";

      const esSolicitudDelUsuario =
        solicitud.usuarioCorreo &&
        solicitud.usuarioCorreo.toLowerCase() === usuarioCorreo.toLowerCase();

      return esSolicitudDemo || esSolicitudDelUsuario;
    });
  },

  obtenerSolicitudPorId(id: string): Solicitud | undefined {
    const solicitudes = obtenerSolicitudesGuardadas();
    return solicitudes.find((solicitud) => solicitud.id === id);
  },

  crearSolicitud(data: {
    razonSocial: string;
    rut: string;
    direccion: string;
    tipoPatente: string;
    rolAvaluo: string;
    pyme: string;
    documentos: string[];

    usuarioNombre: string;
    usuarioRut: string;
    usuarioCorreo: string;
  }): Solicitud {
    const solicitudes = obtenerSolicitudesGuardadas();
    const funcionarioAsignado = asignarFuncionario(solicitudes);

    const nuevaSolicitud: Solicitud = {
      id: generarNuevoId(solicitudes),
      fechaRecibo: obtenerFechaActual(),
      estado: "En Proceso",
      encargado: funcionarioAsignado.nombre,
      area: funcionarioAsignado.area,
      observacion: "Solicitud ingresada correctamente.",

      razonSocial: data.razonSocial,
      rut: data.rut,
      direccion: data.direccion,
      tipoPatente: data.tipoPatente,
      rolAvaluo: data.rolAvaluo,
      pyme: data.pyme,

      documentos: data.documentos,

      usuarioNombre: data.usuarioNombre,
      usuarioRut: data.usuarioRut,
      usuarioCorreo: data.usuarioCorreo,
    };

    const nuevasSolicitudes = [...solicitudes, nuevaSolicitud];
    guardarSolicitudes(nuevasSolicitudes);

    localStorage.setItem("ultima_solicitud_id", nuevaSolicitud.id);

    return nuevaSolicitud;
  },

  agregarDocumentoExtra(id: string, documentosExtra: string[]) {
    const solicitudes = obtenerSolicitudesGuardadas();

    const solicitudesActualizadas = solicitudes.map((solicitud) => {
      if (solicitud.id !== id) {
        return solicitud;
      }

      return {
        ...solicitud,
        documentos: [...solicitud.documentos, ...documentosExtra],
      };
    });

    guardarSolicitudes(solicitudesActualizadas);
  },
};