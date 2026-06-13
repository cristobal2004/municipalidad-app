import type { SolicitudesRepository } from "../repositories/SolicitudesRepository";

export const createSolicitudesUseCases = (
  repository: SolicitudesRepository,
) => ({
  crearSolicitud: repository.crearSolicitud.bind(repository),
  crearSolicitudConArchivos:
    repository.crearSolicitudConArchivos.bind(repository),
  obtenerMisSolicitudes: repository.obtenerMisSolicitudes.bind(repository),
  obtenerSolicitudes: repository.obtenerSolicitudes.bind(repository),
  obtenerSolicitudPorId: repository.obtenerSolicitudPorId.bind(repository),
  actualizarSolicitud: repository.actualizarSolicitud.bind(repository),
  eliminarSolicitud: repository.eliminarSolicitud.bind(repository),
});
