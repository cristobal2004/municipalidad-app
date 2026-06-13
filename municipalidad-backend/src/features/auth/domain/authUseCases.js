const { passwordHasher } = require("../../../core/security/passwordHasher");
const { tokenService } = require("../../../core/security/tokenService");
const { userRepository } = require("../data/userRepository");

const mapPublicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  rut: user.rut,
  correo: user.correo,
  rol: user.rol,
  region: user.region,
  comuna: user.comuna,
  tipoUsuario: user.tipo_usuario,
  area: user.area,
  cargo: user.cargo,
  numeroEmpleado: user.numero_empleado,
});

const createConflictError = (message) => {
  const error = new Error(message);
  error.status = 409;
  return error;
};

const createUnauthorizedError = () => {
  const error = new Error("Credenciales invalidas.");
  error.status = 401;
  return error;
};

const createAuthUseCases = ({
  repository = userRepository,
  hasher = passwordHasher,
  tokens = tokenService,
} = {}) => ({
  async registerCitizen(data) {
    const userExists = await repository.existsByEmailOrRut(
      data.correo,
      data.rut,
    );

    if (userExists) {
      throw createConflictError(
        "Ya existe un usuario registrado con ese correo o RUT.",
      );
    }

    const passwordHash = await hasher.hash(data.password);
    const user = await repository.createCitizen({
      ...data,
      passwordHash,
    });

    return {
      token: tokens.sign(user),
      user: mapPublicUser(user),
    };
  },

  async login(credentials) {
    const user = await repository.findCredentialsByEmail(
      credentials.correo,
    );

    if (!user) {
      throw createUnauthorizedError();
    }

    const validPassword = await hasher.compare(
      credentials.password,
      user.password_hash,
    );

    if (!validPassword) {
      throw createUnauthorizedError();
    }

    return {
      token: tokens.sign(user),
      user: mapPublicUser(user),
    };
  },

  async getAuthenticatedUser(id) {
    const user = await repository.findById(id);

    if (!user) {
      const error = new Error("Usuario no encontrado.");
      error.status = 404;
      throw error;
    }

    return mapPublicUser(user);
  },
});

const authUseCases = createAuthUseCases();

module.exports = {
  authUseCases,
  createAuthUseCases,
  mapPublicUser,
};
