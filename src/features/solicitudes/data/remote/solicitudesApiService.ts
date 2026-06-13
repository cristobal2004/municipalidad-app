import api from "../../../../core/data/http/apiClient";
import type { Solicitud } from "../../domain/entities/Solicitud";
import type {
  CrearSolicitudConArchivosPayload,
  CrearSolicitudPayload,
} from "../../domain/entities/SolicitudPayload";
import type { SolicitudesRepository } from "../../domain/repositories/SolicitudesRepository";

export type {
  CrearSolicitudConArchivosPayload,
  CrearSolicitudPayload,
} from "../../domain/entities/SolicitudPayload";

export interface DocumentoSolicitudApi {
  id?: number;
  nombre: string;
  tipo?: string;
  size?: number;
  estado?: string;
  descripcion?: string;
  rutaArchivo?: string;
  url?: string;
  createdAt?: string;
}

export interface SolicitudApi extends Solicitud {
  id: string;
  idInterno?: number;
  codigo: string;
  solicitudId: string;

  usuarioId?: number;
  funcionarioId?: number;

  tipoTramite: string;
  tramite?: string;

  razonSocial?: string;
  rut: string;
  rutEmpresa?: string;
  direccion?: string;
  tipoPatente?: string;
  rolAvaluo?: string;
  pyme?: boolean;
  areaResponsable?: string;
  datosTramite?: Record<string, string>;
  correoEnviado?: boolean;

  correo?: string;
  email?: string;
  correoContacto?: string;
  telefono?: string;
  telefonoContacto?: string;

  giro?: string;
  superficie?: string;

  observacion?: string;
  observaciones?: string;
  observacionesSolicitante?: string;

  comentarioFuncionario?: string;
  observacionFuncionario?: string;
  fechaComentario?: string | null;

  prioridad?: string;

  estado: string;
  estadoBackend?: string;

  fechaIngreso: string;
  fechaRecibo?: string;
  ultimaActualizacion?: string;

  funcionarioAsignado?: string;
  encargado?: string;
  area?: string;
  cargoFuncionario?: string;
  numeroEmpleadoFuncionario?: string;

  usuarioNombre?: string;
  solicitante?: string;
  nombreSolicitante?: string;
  usuarioCorreo?: string;
  usuarioRut?: string;

  documentos?: DocumentoSolicitudApi[];
}

interface CrearSolicitudResponse {
  ok: boolean;
  mensaje: string;
  solicitud: SolicitudApi;
}

interface ListarSolicitudesResponse {
  ok: boolean;
  solicitudes: SolicitudApi[];
}

interface ObtenerSolicitudResponse {
  ok: boolean;
  solicitud: SolicitudApi;
}

interface ActualizarSolicitudResponse {
  ok: boolean;
  mensaje: string;
  solicitud: SolicitudApi;
}

const agregarCampo = (
  formData: FormData,
  nombre: string,
  valor: string | undefined
) => {
  if (valor !== undefined && valor !== null) {
    formData.append(nombre, valor);
  }
};

export const solicitudesApiRepository: SolicitudesRepository = {
  async crearSolicitud(data: CrearSolicitudPayload): Promise<SolicitudApi> {
    const response = await api.post<CrearSolicitudResponse>(
      "/solicitudes",
      data
    );

    return response.data.solicitud;
  },

  async crearSolicitudConArchivos(
    data: CrearSolicitudConArchivosPayload
  ): Promise<SolicitudApi> {
    const formData = new FormData();

    agregarCampo(formData, "tipoTramite", data.tipoTramite);
    agregarCampo(formData, "razonSocial", data.razonSocial);
    agregarCampo(formData, "rut", data.rut);
    agregarCampo(formData, "direccion", data.direccion);
    agregarCampo(formData, "tipoPatente", data.tipoPatente);
    agregarCampo(formData, "rolAvaluo", data.rolAvaluo);
    agregarCampo(formData, "pyme", data.pyme);
    agregarCampo(formData, "correoContacto", data.correoContacto);
    agregarCampo(formData, "telefonoContacto", data.telefonoContacto);
    agregarCampo(formData, "giro", data.giro);
    agregarCampo(formData, "superficie", data.superficie);
    agregarCampo(
      formData,
      "observacionesSolicitante",
      data.observacionesSolicitante
    );
    agregarCampo(
      formData,
      "datosTramite",
      data.datosTramite ? JSON.stringify(data.datosTramite) : undefined
    );

    data.archivos.forEach((archivo) => {
      formData.append("documentos", archivo);
    });

    /*
      Importante:
      No forzamos Content-Type aquí.
      El navegador debe poner automáticamente:
      multipart/form-data; boundary=...
    */
    const response = await api.post<CrearSolicitudResponse>(
      "/solicitudes",
      formData
    );

    return response.data.solicitud;
  },

  async obtenerMisSolicitudes(): Promise<SolicitudApi[]> {
    const response = await api.get<ListarSolicitudesResponse>(
      "/solicitudes/mis-solicitudes"
    );

    return response.data.solicitudes;
  },

  async obtenerSolicitudes(): Promise<SolicitudApi[]> {
    const response = await api.get<ListarSolicitudesResponse>("/solicitudes");

    return response.data.solicitudes;
  },

  async obtenerSolicitudPorId(id: string): Promise<SolicitudApi> {
    const response = await api.get<ObtenerSolicitudResponse>(
      `/solicitudes/${id}`
    );

    return response.data.solicitud;
  },

  async actualizarSolicitud(
    id: string,
    data: {
      estado: string;
      observacion?: string;
    }
  ): Promise<SolicitudApi> {
    const response = await api.patch<ActualizarSolicitudResponse>(
      `/solicitudes/${id}`,
      data
    );

    return response.data.solicitud;
  },

  async eliminarSolicitud(id: string): Promise<void> {
    await api.delete(`/solicitudes/${id}`);
  },
};

export const solicitudesApiService = solicitudesApiRepository;
