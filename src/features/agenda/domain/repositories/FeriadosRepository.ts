import type { Feriado } from "../entities/Feriado";

export interface VerificarFeriadoResult {
  ok: boolean;
  esFeriado: boolean;
  feriado: Feriado | null;
  fuente: string;
}

export interface FeriadosRepository {
  obtenerPorAnio(anio: number): Promise<Feriado[]>;
  verificarFecha(fecha: string): Promise<VerificarFeriadoResult>;
}
