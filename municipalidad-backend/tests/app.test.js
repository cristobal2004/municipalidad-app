const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
process.env.CORS_ORIGIN = "http://localhost:5173";

const app = require("../src/app");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /api/health responde correctamente", async () => {
  const response = await fetch(`${baseUrl}/api/health?entrada=<script>`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.servicio, "Municipalidad de Santo Domingo");
});

test("las rutas desconocidas usan una respuesta JSON controlada", async () => {
  const response = await fetch(`${baseUrl}/api/no-existe`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    ok: false,
    mensaje: "Ruta no encontrada.",
  });
});

test("CORS rechaza origenes no autorizados", async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: {
      Origin: "https://sitio-no-autorizado.example",
    },
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.ok, false);
});

test("registro invalido se rechaza antes de consultar la base", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: "A",
      rut: "1",
      correo: "correo-invalido",
      password: "123",
      rol: "funcionario",
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.ok(Array.isArray(body.errores));
});

test("la ruta de verificacion de feriados no queda oculta por /:anio", async () => {
  const token = jwt.sign(
    {
      id: 1,
      rol: "usuario",
      correo: "usuario@example.com",
    },
    process.env.JWT_SECRET
  );

  const response = await fetch(
    `${baseUrl}/api/feriados/verificar/fecha?fecha=fecha-invalida`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.errores[0].campo, "fecha");
});
