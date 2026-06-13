const {
  obtenerFeriadosChile,
  verificarFeriado,
} = require("../../domain/feriadosService");

const responderErrorExterno = (res, error) => {
  const status = error.statusCode || 500;

  return res.status(status).json({
    ok: false,
    mensaje:
      status === 500
        ? "Error interno al consultar feriados."
        : error.message,
  });
};

const obtenerFeriadosPorAnio = async (req, res) => {
  try {
    const feriados = await obtenerFeriadosChile(req.params.anio);

    return res.json({
      ok: true,
      fuente: "Nager.Date",
      feriados,
    });
  } catch (error) {
    return responderErrorExterno(res, error);
  }
};

const verificarFechaFeriado = async (req, res) => {
  try {
    const feriado = await verificarFeriado(req.query.fecha);

    return res.json({
      ok: true,
      esFeriado: Boolean(feriado),
      feriado: feriado || null,
      fuente: "Nager.Date",
    });
  } catch (error) {
    return responderErrorExterno(res, error);
  }
};

module.exports = {
  obtenerFeriadosPorAnio,
  verificarFechaFeriado,
};
