const TRAMITES = {
  patente_comercial: {
    tipo: "Patente comercial",
    area: "Patentes Comerciales",
    requiredFields: ["razonSocial", "rut", "direccion", "tipoPatente"],
  },
  permiso_circulacion: {
    tipo: "Permiso de circulación",
    area: "Finanzas",
    requiredFields: ["rut", "patenteVehiculo", "marca", "modelo", "anio"],
  },
  obras_municipales: {
    tipo: "Obras municipales",
    area: "Obras Municipales",
    requiredFields: ["rut", "direccion", "tipoObra", "rolPropiedad"],
  },
};

const normalizarTexto = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const obtenerTramite = (value) => {
  const normalized = normalizarTexto(value);

  if (normalized.includes("circulacion")) {
    return TRAMITES.permiso_circulacion;
  }

  if (
    normalized.includes("obra") ||
    normalized.includes("construccion") ||
    normalized.includes("edificacion")
  ) {
    return TRAMITES.obras_municipales;
  }

  return TRAMITES.patente_comercial;
};

const parsearDatosTramite = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const validarDatosTramite = (tramite, body, datosTramite) => {
  const values = {
    ...datosTramite,
    razonSocial: body.razonSocial,
    rut: body.rutEmpresa || body.rut,
    direccion: body.direccion,
    tipoPatente: body.tipoPatente,
  };

  return tramite.requiredFields.filter(
    (field) => String(values[field] || "").trim() === "",
  );
};

module.exports = {
  TRAMITES,
  normalizarTexto,
  obtenerTramite,
  parsearDatosTramite,
  validarDatosTramite,
};
