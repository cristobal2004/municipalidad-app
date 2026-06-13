import { solicitudesApiRepository } from "../data/remote/solicitudesApiService";
import { createSolicitudesUseCases } from "../domain/useCases/solicitudesUseCases";

export const solicitudesApiService = createSolicitudesUseCases(
  solicitudesApiRepository,
);
