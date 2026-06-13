const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  obtenerFeriadosChile,
  validarAnio,
  validarFechaIso,
} = require("../src/features/feriados/domain/feriadosService");

test("valida año y fecha antes de consultar el servicio externo", () => {
  assert.throws(() => validarAnio("verificar"), /año solicitado/);
  assert.throws(() => validarFechaIso("2026-02-30"), /fecha solicitada/);
  assert.equal(validarAnio("2026"), 2026);
  assert.equal(validarFechaIso("2026-06-13"), "2026-06-13");
});

test("reutiliza en cache los feriados de un mismo año", async () => {
  const originalFetch = global.fetch;
  let calls = 0;

  global.fetch = async () => {
    calls += 1;

    return {
      ok: true,
      json: async () => [
        {
          date: "2099-01-01",
          localName: "Año Nuevo",
        },
      ],
    };
  };

  try {
    const first = await obtenerFeriadosChile(2099);
    const second = await obtenerFeriadosChile(2099);

    assert.deepEqual(first, second);
    assert.equal(calls, 1);
  } finally {
    global.fetch = originalFetch;
  }
});
