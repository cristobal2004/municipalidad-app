import { feriadosApiRepository } from "../data/remote/feriadosService";
import { createFeriadosUseCases } from "../domain/useCases/feriadosUseCases";

export const feriadosService = createFeriadosUseCases(feriadosApiRepository);
