const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  generarBloquesHorarios,
  validarFechaHoraAgendamiento,
} = require("../src/features/solicitudes/domain/agendamientoRules");

const now = new Date("2026-06-13T10:00:00.000Z");

test("acepta una cita futura en un dia habil", () => {
  const date = validarFechaHoraAgendamiento(
    "2026-06-15T14:00:00.000Z",
    now,
  );

  assert.equal(date.toISOString(), "2026-06-15T14:00:00.000Z");
});

test("rechaza fechas invalidas o sin anticipacion suficiente", () => {
  assert.throws(
    () => validarFechaHoraAgendamiento("fecha-invalida", now),
    /no es valida/,
  );
  assert.throws(
    () => validarFechaHoraAgendamiento("2026-06-13T10:15:00.000Z", now),
    /30 minutos/,
  );
});

test("rechaza agendamientos durante el fin de semana", () => {
  assert.throws(
    () => validarFechaHoraAgendamiento("2026-06-14T14:00:00.000Z", now),
    /lunes a viernes/,
  );
});

test("rechaza minutos intermedios y horas fuera de la jornada", () => {
  assert.throws(
    () => validarFechaHoraAgendamiento("2026-06-15T14:30:00.000Z", now),
    /hora exacta/,
  );
  assert.throws(
    () => validarFechaHoraAgendamiento("2026-06-15T22:00:00.000Z", now),
    /entre las 9:00 y las 17:00/,
  );
});

test("genera nueve bloques horarios entre las 09:00 y las 17:00", () => {
  const bloques = generarBloquesHorarios("2026-06-15", now);

  assert.equal(bloques.length, 9);
  assert.equal(bloques[0].hora, "09:00");
  assert.equal(bloques[8].hora, "17:00");
  assert.equal(bloques.every((bloque) => bloque.disponible), true);
});
