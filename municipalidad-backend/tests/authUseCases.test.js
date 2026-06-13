const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.JWT_SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";

const {
  createAuthUseCases,
  mapPublicUser,
} = require("../src/features/auth/domain/authUseCases");

const usuarioDb = {
  id: 4,
  nombre: "Usuario Seguro",
  rut: "11.111.111-1",
  correo: "usuario@example.com",
  password_hash: "hash",
  rol: "usuario",
  region: "Valparaiso",
  comuna: "Santo Domingo",
  tipo_usuario: "Persona natural",
};

test("registro rechaza correos o RUT duplicados", async () => {
  const useCases = createAuthUseCases({
    repository: {
      existsByEmailOrRut: async () => true,
    },
  });

  await assert.rejects(
    () =>
      useCases.registerCitizen({
        correo: usuarioDb.correo,
        rut: usuarioDb.rut,
      }),
    (error) => error.status === 409,
  );
});

test("registro cifra la clave y firma al usuario creado", async () => {
  let datosCreacion;
  const useCases = createAuthUseCases({
    repository: {
      existsByEmailOrRut: async () => false,
      createCitizen: async (data) => {
        datosCreacion = data;
        return usuarioDb;
      },
    },
    hasher: {
      hash: async () => "hash-seguro",
    },
    tokens: {
      sign: () => "jwt-firmado",
    },
  });

  const session = await useCases.registerCitizen({
    nombre: usuarioDb.nombre,
    rut: usuarioDb.rut,
    correo: usuarioDb.correo,
    password: "Password123",
  });

  assert.equal(datosCreacion.passwordHash, "hash-seguro");
  assert.equal(session.token, "jwt-firmado");
  assert.equal(session.user.correo, usuarioDb.correo);
  assert.equal(session.user.password_hash, undefined);
});

test("login no revela si el correo o la clave fueron incorrectos", async () => {
  const sinUsuario = createAuthUseCases({
    repository: {
      findCredentialsByEmail: async () => null,
    },
  });
  const claveInvalida = createAuthUseCases({
    repository: {
      findCredentialsByEmail: async () => usuarioDb,
    },
    hasher: {
      compare: async () => false,
    },
  });

  await assert.rejects(
    () => sinUsuario.login({ correo: "nadie@example.com", password: "x" }),
    /Credenciales invalidas/,
  );
  await assert.rejects(
    () => claveInvalida.login({ correo: usuarioDb.correo, password: "x" }),
    /Credenciales invalidas/,
  );
});

test("mapPublicUser excluye el hash de la respuesta", () => {
  const publicUser = mapPublicUser(usuarioDb);

  assert.equal(publicUser.id, usuarioDb.id);
  assert.equal(publicUser.password_hash, undefined);
});
