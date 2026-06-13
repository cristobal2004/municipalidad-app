const {
  pool,
  obtenerSolicitudResumenPorIdOCodigo,
} = require("../../data/solicitudesRepository");
const {
  crearFechaHoraChile,
  generarBloquesHorarios,
} = require("../../domain/agendamientoRules");

const obtenerDisponibilidadAgendamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes indicar una fecha valida en formato AAAA-MM-DD.",
      });
    }

    const solicitud = await obtenerSolicitudResumenPorIdOCodigo(id);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada.",
      });
    }

    const puedeConsultar =
      (req.usuario.rol === "usuario" &&
        solicitud.usuario_id === req.usuario.id) ||
      (req.usuario.rol === "funcionario" &&
        solicitud.funcionario_id === req.usuario.id);

    if (!puedeConsultar) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para consultar estos horarios.",
      });
    }

    if (!solicitud.funcionario_id) {
      return res.status(400).json({
        ok: false,
        mensaje: "La solicitud aun no tiene un funcionario asignado.",
      });
    }

    const inicio = crearFechaHoraChile(fecha, 9);
    const fin = crearFechaHoraChile(fecha, 18);
    const ocupadosResult = await pool.query(
      `
      SELECT fecha_hora
      FROM agendamientos
      WHERE funcionario_id = $1
        AND fecha_hora >= $2
        AND fecha_hora < $3
        AND estado IN ('agendada', 'confirmada')
      `,
      [solicitud.funcionario_id, inicio, fin],
    );
    const ocupados = new Set(
      ocupadosResult.rows.map((row) => new Date(row.fecha_hora).toISOString()),
    );
    const horarios = generarBloquesHorarios(fecha).map((horario) => ({
      ...horario,
      disponible:
        horario.disponible && !ocupados.has(horario.fechaHora),
    }));

    return res.json({
      ok: true,
      fecha,
      funcionario: {
        id: solicitud.funcionario_id,
        nombre: solicitud.funcionario_nombre,
        area: solicitud.funcionario_area,
      },
      horarios,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        ok: false,
        mensaje: error.message,
      });
    }

    console.error("Error al obtener disponibilidad:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar horarios disponibles.",
    });
  }
};

module.exports = {
  obtenerDisponibilidadAgendamiento,
};
