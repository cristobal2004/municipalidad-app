import React from "react";
import type { Solicitud } from "../../domain/entities/Solicitud";

interface DatosTramiteProps {
  solicitud: Solicitud;
  variante?: "parrafos" | "grid";
}

const etiquetas: Record<string, string> = {
  rut: "RUT",
  direccion: "Direccion",
  domicilio: "Domicilio",
  razonSocial: "Razon social",
  tipoPatente: "Tipo de patente",
  patenteVehiculo: "Patente del vehiculo",
  marca: "Marca",
  modelo: "Modelo",
  anio: "Año del vehiculo",
  tipoVehiculo: "Tipo de vehiculo",
  tipoObra: "Tipo de obra",
  rolPropiedad: "Rol de la propiedad",
  superficie: "Superficie",
  nombreProyecto: "Nombre del proyecto",
  nombrePropietario: "Propietario",
};

const formatearEtiqueta = (key: string) =>
  etiquetas[key] ||
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

const DatosTramite: React.FC<DatosTramiteProps> = ({
  solicitud,
  variante = "parrafos",
}) => {
  const datos = solicitud.datosTramite || {};
  const entradas = Object.entries(datos).filter(
    ([, value]) => value !== undefined && value !== null && String(value) !== ""
  );
  const campos = entradas.length
    ? entradas
    : [
        ["razonSocial", solicitud.razonSocial],
        ["rut", solicitud.rut],
        ["direccion", solicitud.direccion],
        ["tipoPatente", solicitud.tipoPatente],
        ["rolAvaluo", solicitud.rolAvaluo],
        ["giro", solicitud.giro],
        ["superficie", solicitud.superficie],
      ].filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      );

  if (variante === "grid") {
    return (
      <>
        {campos.map(([key, value]) => (
          <div key={String(key)}>
            <span>{formatearEtiqueta(String(key))}</span>
            <strong>{String(value)}</strong>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {campos.map(([key, value]) => (
        <p key={String(key)}>
          <b>{formatearEtiqueta(String(key))}:</b> {String(value)}
        </p>
      ))}
    </>
  );
};

export default DatosTramite;
