const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.JWT_SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";

const poolPath = require.resolve("../src/core/database/connection");
let ejecutarQuery = async () => ({ rows: [] });

require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: {
    query: (...args) => ejecutarQuery(...args),
  },
};

const {
  register,
} = require("../src/features/auth/presentation/http/authController");
const {
  crearAgendamientoSolicitud,
  obtenerSolicitudPorId,
} = require("../src/features/solicitudes/presentation/http/solicitudesController");

const crearRespuesta = () => {
  const respuesta = {
    statusCode: 200,
    body: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  return respuesta;
};

const solicitudDb = {
  id: 10,
  codigo: "SOL-2026-0010",
  usuario_id: 1,
  funcionario_id: 2,
  tipo_tramite: "Patente comercial",
  razon_social: "Comercio de prueba",
  rut_empresa: "76.000.000-0",
  direccion: "Calle de prueba 123",
  tipo_patente: "Comercial",
  rol_avaluo: "123-4",
  pyme: true,
  estado: "pendiente",
  created_at: new Date("2026-06-13T12:00:00Z"),
  updated_at: new Date("2026-06-13T12:00:00Z"),
  usuario_nombre: "Usuario Prueba",
  usuario_correo: "usuario@example.com",
  usuario_rut: "11.111.111-1",
  funcionario_nombre: "Funcionario Prueba",
  funcionario_correo: "funcionario@example.com",
  funcionario_area: "Patentes",
  funcionario_cargo: "Analista",
  documentos: [],
  documentos_faltantes: [],
};

test("el registro publico crea siempre una cuenta ciudadana", async () => {
  let sqlInsert;
  let llamada = 0;

  ejecutarQuery = async (sql, parametros) => {
    llamada += 1;

    if (llamada === 1) {
      return { rows: [] };
    }

    sqlInsert = sql;

    return {
      rows: [
        {
          id: 20,
          nombre: parametros[0],
          rut: parametros[1],
          correo: parametros[2],
          rol: "usuario",
          region: parametros[4],
          comuna: parametros[5],
          tipo_usuario: parametros[6],
        },
      ],
    };
  };

  const req = {
    body: {
      nombre: "Usuario Seguro",
      rut: "22.222.222-2",
      correo: "seguro@example.com",
      password: "PasswordSegura123",
      rol: "funcionario",
    },
  };
  const res = crearRespuesta();

  await register(req, res);

  assert.equal(res.statusCode, 201);
  assert.match(sqlInsert, /'usuario'/);
  assert.equal(res.body.usuario.rol, "usuario");
});

test("obtiene una solicitud usando el parametro de ruta", async () => {
  ejecutarQuery = async () => ({ rows: [solicitudDb] });

  const req = {
    params: {
      id: solicitudDb.codigo,
    },
    usuario: {
      id: 1,
      rol: "usuario",
    },
  };
  const res = crearRespuesta();

  await obtenerSolicitudPorId(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.solicitud.codigo, solicitudDb.codigo);
});

test("crea un agendamiento sin referencias a variables inexistentes", async () => {
  const fechaFutura = new Date();
  fechaFutura.setUTCDate(fechaFutura.getUTCDate() + 2);
  fechaFutura.setUTCHours(14, 0, 0, 0);

  if (fechaFutura.getUTCDay() === 0) {
    fechaFutura.setUTCDate(fechaFutura.getUTCDate() + 1);
  }

  ejecutarQuery = async (sql) => {
    if (sql.includes("FROM solicitudes s")) {
      return { rows: [solicitudDb] };
    }

    if (sql.includes("SELECT id") && sql.includes("FROM agendamientos")) {
      return { rows: [] };
    }

    if (sql.includes("INSERT INTO agendamientos")) {
      return {
        rows: [
          {
            id: 30,
            fecha_hora: fechaFutura,
            estado: "agendada",
          },
        ],
      };
    }

    return { rows: [] };
  };

  const req = {
    params: {
      id: solicitudDb.codigo,
    },
    body: {
      fechaHora: fechaFutura.toISOString(),
    },
    usuario: {
      id: 1,
      rol: "usuario",
    },
  };
  const res = crearRespuesta();

  await crearAgendamientoSolicitud(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.agendamiento.id, 30);
});
