export interface CrearSolicitudPayload {
  tipoTramite: string;
  razonSocial?: string;
  rut: string;
  direccion?: string;
  tipoPatente?: string;
  rolAvaluo?: string;
  pyme?: string;
  correoContacto?: string;
  telefonoContacto?: string;
  giro?: string;
  superficie?: string;
  observacionesSolicitante?: string;
  datosTramite?: Record<string, string>;
}

export interface CrearSolicitudConArchivosPayload
  extends CrearSolicitudPayload {
  archivos: File[];
}
