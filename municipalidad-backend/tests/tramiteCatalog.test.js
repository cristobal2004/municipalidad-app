const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  obtenerTramite,
  parsearDatosTramite,
  validarDatosTramite,
} = require("../src/features/solicitudes/domain/tramiteCatalog");

test("asigna cada tramite al area municipal correspondiente", () => {
  assert.equal(obtenerTramite("Permiso de circulación").area, "Finanzas");
  assert.equal(obtenerTramite("Obras municipales").area, "Obras Municipales");
  assert.equal(
    obtenerTramite("Patente comercial").area,
    "Patentes Comerciales",
  );
});

test("parsea datos estructurados enviados como multipart", () => {
  assert.deepEqual(parsearDatosTramite('{"marca":"Toyota","anio":"2022"}'), {
    marca: "Toyota",
    anio: "2022",
  });
  assert.deepEqual(parsearDatosTramite("{invalido"), {});
});

test("valida los campos propios de permiso de circulacion", () => {
  const tramite = obtenerTramite("Permiso de circulacion");
  const faltantes = validarDatosTramite(
    tramite,
    { rut: "12.345.678-9" },
    { patenteVehiculo: "ABCD12", marca: "Toyota" },
  );

  assert.deepEqual(faltantes, ["modelo", "anio"]);
});
