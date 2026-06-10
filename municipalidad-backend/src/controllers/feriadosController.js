const obtenerFeriadosPorAnio = async (req, res) => {
  try {
    const { anio } = req.params;

    const respuesta = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${anio}/CL`
    );

    if (!respuesta.ok) {
      return res.status(502).json({
        ok: false,
        mensaje: "No se pudo consultar la API externa de feriados.",
      });
    }

    const feriados = await respuesta.json();

    return res.json({
      ok: true,
      fuente: "Nager.Date",
      feriados,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener feriados.",
    });
  }
};

const verificarFechaFeriado = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        mensaje: "La fecha es obligatoria.",
      });
    }

    const anio = String(fecha).slice(0, 4);

    const respuesta = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${anio}/CL`
    );

    if (!respuesta.ok) {
      return res.status(502).json({
        ok: false,
        mensaje: "No se pudo consultar la API externa de feriados.",
      });
    }

    const feriados = await respuesta.json();

    const feriado = feriados.find((item) => item.date === fecha);

    return res.json({
      ok: true,
      esFeriado: Boolean(feriado),
      feriado: feriado || null,
      fuente: "Nager.Date",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al verificar feriado.",
    });
  }
};

module.exports = {
  obtenerFeriadosPorAnio,
  verificarFechaFeriado,
};