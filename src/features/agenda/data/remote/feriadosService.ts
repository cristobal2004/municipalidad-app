import api from "../../../../core/data/http/apiClient";
import type { Feriado } from "../../domain/entities/Feriado";
import type {
  FeriadosRepository,
  VerificarFeriadoResult,
} from "../../domain/repositories/FeriadosRepository";

export type { Feriado } from "../../domain/entities/Feriado";

interface ObtenerFeriadosResponse {
  ok: boolean;
  fuente: string;
  feriados: Feriado[];
}

export const feriadosApiRepository: FeriadosRepository = {
  async obtenerPorAnio(anio: number): Promise<Feriado[]> {
    const response = await api.get<ObtenerFeriadosResponse>(
      `/feriados/${anio}`
    );

    return response.data.feriados || [];
  },

  async verificarFecha(fecha: string): Promise<VerificarFeriadoResult> {
    const response = await api.get<VerificarFeriadoResult>(
      `/feriados/verificar/fecha?fecha=${fecha}`
    );

    return response.data;
  },
};

export const feriadosService = feriadosApiRepository;
