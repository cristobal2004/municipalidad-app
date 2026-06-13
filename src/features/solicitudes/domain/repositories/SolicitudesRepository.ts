import type {
  CrearSolicitudConArchivosPayload,
  CrearSolicitudPayload,
} from "../entities/SolicitudPayload";
import type { Solicitud } from "../entities/Solicitud";

export interface SolicitudesRepository {
  crearSolicitud(data: CrearSolicitudPayload): Promise<Solicitud>;
  crearSolicitudConArchivos(
    data: CrearSolicitudConArchivosPayload,
  ): Promise<Solicitud>;
  obtenerMisSolicitudes(): Promise<Solicitud[]>;
  obtenerSolicitudes(): Promise<Solicitud[]>;
  obtenerSolicitudPorId(id: string): Promise<Solicitud>;
  actualizarSolicitud(
    id: string,
    data: { estado: string; observacion?: string },
  ): Promise<Solicitud>;
  eliminarSolicitud(id: string): Promise<void>;
}
