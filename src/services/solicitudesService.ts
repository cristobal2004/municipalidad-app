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
  },
  {
    id: "SOL-2026-0002",
    fechaRecibo: "15/04/26",
    estado: "Falta Documentación",
    encargado: "María Barroso",
    area: "Serv. Ciudadano",
    observacion: "Subir copia de Cédula de Identidad.",
    razonSocial: "Panadería San Pedro",
    rut: "77.456.321-9",
    direccion: "Av. Principal 120, Santo Domingo",
    tipoPatente: "Comercial Provisoria",
    rolAvaluo: "2222-11",
    pyme: "Sí",
    documentos: ["Formulario_Solicitud.pdf"],
  },
  {
    id: "SOL-2026-0003",
    fechaRecibo: "10/04/26",
    estado: "Aprobado",
    encargado: "Cristian Díaz",
    area: "Finanzas",
    observacion: "Patente otorgada correctamente.",
    razonSocial: "Servicios Costa Azul",
    rut: "78.111.222-3",
    direccion: "Calle Los Pinos 45, Santo Domingo",
    tipoPatente: "Patente Profesional",
    rolAvaluo: "7890-12",
    pyme: "No",
    documentos: ["Resolucion_Final.pdf", "Comprobante_Pago.pdf"],
  },
];

function obtenerSolicitudesGuardadas(): Solicitud[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudesIniciales));
    return solicitudesIniciales;
  }

  return JSON.parse(data);
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