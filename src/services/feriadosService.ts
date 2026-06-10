import api from "./api";

export interface Feriado {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties: string[] | null;
  types: string[];
}

interface VerificarFeriadoResponse {
  ok: boolean;
  esFeriado: boolean;
  feriado: Feriado | null;
  fuente: string;
}

interface ObtenerFeriadosResponse {
  ok: boolean;
  fuente: string;
  feriados: Feriado[];
}

export const feriadosService = {
  async obtenerPorAnio(anio: number): Promise<Feriado[]> {
    const response = await api.get<ObtenerFeriadosResponse>(
      `/feriados/${anio}`
    );

    return response.data.feriados || [];
  },

  async verificarFecha(fecha: string): Promise<VerificarFeriadoResponse> {
    const response = await api.get<VerificarFeriadoResponse>(
      `/feriados/verificar/fecha?fecha=${fecha}`
    );

    return response.data;
  },
};
