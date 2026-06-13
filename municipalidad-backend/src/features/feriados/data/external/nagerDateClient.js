const CACHE_TTL_MS =
  Number(process.env.FERIADOS_CACHE_TTL_MS) || 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = Number(process.env.FERIADOS_TIMEOUT_MS) || 5000;

const cacheByYear = new Map();

const createExternalError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const nagerDateClient = {
  async getHolidaysByYear(year) {
    const now = Date.now();
    const cached = cacheByYear.get(year);

    if (cached && cached.expiresAt > now) {
      return cached.holidays;
    }

    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/CL`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );

      if (!response.ok) {
        throw createExternalError(
          "No se pudo consultar la API externa de feriados.",
          502,
        );
      }

      const holidays = await response.json();

      if (!Array.isArray(holidays)) {
        throw createExternalError(
          "La API externa devolvio una respuesta invalida.",
          502,
        );
      }

      cacheByYear.set(year, {
        holidays,
        expiresAt: now + CACHE_TTL_MS,
      });

      return holidays;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw createExternalError(
          "La API externa de feriados tardo demasiado en responder.",
          504,
        );
      }

      throw createExternalError(
        "No fue posible conectar con la API externa de feriados.",
        502,
      );
    }
  },

  clearCache() {
    cacheByYear.clear();
  },
};

module.exports = {
  nagerDateClient,
};
