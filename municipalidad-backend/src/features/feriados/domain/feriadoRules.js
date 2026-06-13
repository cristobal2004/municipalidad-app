const createDomainError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validarAnio = (value) => {
  const year = Number(value);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw createDomainError("El año solicitado no es valido.");
  }

  return year;
};

const validarFechaIso = (value) => {
  const date = String(value || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createDomainError("La fecha debe usar el formato YYYY-MM-DD.");
  }

  const utcDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(utcDate.getTime()) ||
    utcDate.toISOString().slice(0, 10) !== date
  ) {
    throw createDomainError("La fecha solicitada no es valida.");
  }

  return date;
};

module.exports = {
  validarAnio,
  validarFechaIso,
};
