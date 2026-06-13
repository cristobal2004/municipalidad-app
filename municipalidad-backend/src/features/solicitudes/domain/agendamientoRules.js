const createValidationError = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const TIME_ZONE = "America/Santiago";
const HORA_INICIO = 9;
const HORA_FIN = 17;

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const obtenerPartesChile = (date) =>
  Object.fromEntries(
    dateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

const obtenerOffsetZona = (date) => {
  const parts = obtenerPartesChile(date);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );

  return representedAsUtc - date.getTime();
};

const crearFechaHoraChile = (fecha, hora) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fecha || ""));

  if (!match || !Number.isInteger(hora)) {
    throw createValidationError("La fecha seleccionada no es valida.");
  }

  const [, year, month, day] = match.map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hora, 0, 0, 0);
  const firstOffset = obtenerOffsetZona(new Date(utcGuess));
  const firstResult = new Date(utcGuess - firstOffset);
  const finalOffset = obtenerOffsetZona(firstResult);

  return new Date(utcGuess - finalOffset);
};

const esDiaLaboral = (fecha) => {
  const date = crearFechaHoraChile(fecha, 12);
  const parts = obtenerPartesChile(date);
  const dayOfWeek = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay();

  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

const generarBloquesHorarios = (fecha, now = new Date()) => {
  const slots = [];
  const minimumDate = new Date(now.getTime() + 30 * 60 * 1000);
  const diaLaboral = esDiaLaboral(fecha);

  for (let hora = HORA_INICIO; hora <= HORA_FIN; hora += 1) {
    const date = crearFechaHoraChile(fecha, hora);
    slots.push({
      hora: `${String(hora).padStart(2, "0")}:00`,
      fechaHora: date.toISOString(),
      disponible: diaLaboral && date >= minimumDate,
    });
  }

  return slots;
};

const validarFechaHoraAgendamiento = (value, now = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createValidationError("La fecha y hora seleccionada no es valida.");
  }

  const minimumDate = new Date(now.getTime() + 30 * 60 * 1000);

  if (date < minimumDate) {
    throw createValidationError(
      "La cita debe agendarse con al menos 30 minutos de anticipacion.",
    );
  }

  const parts = obtenerPartesChile(date);
  const dayOfWeek = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw createValidationError(
      "Solo se puede agendar atencion municipal de lunes a viernes.",
    );
  }

  if (
    parts.minute !== 0 ||
    parts.hour < HORA_INICIO ||
    parts.hour > HORA_FIN
  ) {
    throw createValidationError(
      `El horario debe comenzar en una hora exacta entre las ${HORA_INICIO}:00 y las ${HORA_FIN}:00.`,
    );
  }

  return date;
};

module.exports = {
  HORA_FIN,
  HORA_INICIO,
  TIME_ZONE,
  crearFechaHoraChile,
  esDiaLaboral,
  generarBloquesHorarios,
  validarFechaHoraAgendamiento,
};
