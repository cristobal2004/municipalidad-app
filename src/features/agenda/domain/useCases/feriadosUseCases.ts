import type { FeriadosRepository } from "../repositories/FeriadosRepository";

export const createFeriadosUseCases = (repository: FeriadosRepository) => ({
  obtenerPorAnio: repository.obtenerPorAnio.bind(repository),
  verificarFecha: repository.verificarFecha.bind(repository),
});
