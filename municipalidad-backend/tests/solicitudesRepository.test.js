const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  obtenerCondicionSolicitudPorIdOCodigo,
  obtenerFuncionarioAsignado,
  obtenerPaginacion,
  registrarHistorialSolicitud,
  reservarIdentidadSolicitud,
} = require("../src/features/solicitudes/data/solicitudesRepository");

test("busca IDs numericos sin convertir la columna de PostgreSQL", () => {
  assert.deepEqual(obtenerCondicionSolicitudPorIdOCodigo("s", "42"), {
    condicion: "s.id = $1",
    parametro: 42,
  });
  assert.deepEqual(
    obtenerCondicionSolicitudPorIdOCodigo("s", "SOL-2026-0042"),
    {
      condicion: "s.codigo = $1",
      parametro: "SOL-2026-0042",
    },
  );
});

test("selecciona funcionarios del area responsable", async () => {
  const database = {
    query: async (sql, params) => {
      assert.match(sql, /u\.area/);
      assert.deepEqual(params, ["Finanzas"]);
      return { rows: [{ id: 7 }] };
    },
  };

  const funcionarioId = await obtenerFuncionarioAsignado("Finanzas", database);

  assert.equal(funcionarioId, 7);
});

test("limita la paginacion a un maximo razonable", () => {
  assert.deepEqual(
    obtenerPaginacion({ query: { page: "-2", limit: "999" } }),
    {
      page: 1,
      limit: 50,
      offset: 0,
    },
  );
});

test("reserva codigos mediante la secuencia para evitar colisiones", async () => {
  const database = {
    query: async (sql) => {
      assert.match(sql, /nextval/);
      return { rows: [{ id: "27" }] };
    },
  };

  const identity = await reservarIdentidadSolicitud(database);

  assert.equal(identity.id, 27);
  assert.match(identity.codigo, /^SOL-\d{4}-0027$/);
});

test("registra un evento estructurado en el historial de la solicitud", async () => {
  const database = {
    query: async (sql, params) => {
      assert.match(sql, /INSERT INTO historial_solicitudes/);
      assert.equal(params[0], 27);
      assert.equal(params[3], "cambio_estado");
      assert.deepEqual(JSON.parse(params[6]), {
        estadoAnterior: "pendiente",
        estadoNuevo: "aprobada",
      });
      return { rows: [] };
    },
  };

  await registrarHistorialSolicitud(
    {
      solicitudId: 27,
      actorId: 4,
      actorRol: "funcionario",
      accion: "cambio_estado",
      titulo: "Solicitud aprobada",
      descripcion: "La solicitud finalizó correctamente.",
      cambios: {
        estadoAnterior: "pendiente",
        estadoNuevo: "aprobada",
      },
    },
    database,
  );
});
