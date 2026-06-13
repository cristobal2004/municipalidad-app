const { nagerDateClient } = require("../data/external/nagerDateClient");
const { validarAnio, validarFechaIso } = require("./feriadoRules");

const obtenerFeriadosChile = async (value) => {
  const year = validarAnio(value);
  return nagerDateClient.getHolidaysByYear(year);
};

const verificarFeriado = async (value) => {
  const date = validarFechaIso(value);
  const holidays = await obtenerFeriadosChile(date.slice(0, 4));

  return holidays.find((holiday) => holiday.date === date) || null;
};

module.exports = {
  obtenerFeriadosChile,
  verificarFeriado,
  validarAnio,
  validarFechaIso,
};
