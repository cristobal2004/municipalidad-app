const { authUseCases } = require("../../domain/authUseCases");

const handleAuthError = (error, res, context) => {
  if (!error.status || error.status >= 500) {
    console.error(`Error en ${context}:`, error);
  }

  return res.status(error.status || 500).json({
    ok: false,
    mensaje:
      error.status && error.status < 500
        ? error.message
        : "Error interno de autenticacion.",
  });
};

const register = async (req, res) => {
  try {
    const session = await authUseCases.registerCitizen(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Usuario registrado correctamente.",
      token: session.token,
      usuario: session.user,
    });
  } catch (error) {
    return handleAuthError(error, res, "register");
  }
};

const login = async (req, res) => {
  try {
    const session = await authUseCases.login(req.body);

    return res.json({
      ok: true,
      mensaje: "Inicio de sesion correcto.",
      token: session.token,
      usuario: session.user,
    });
  } catch (error) {
    return handleAuthError(error, res, "login");
  }
};

const me = async (req, res) => {
  try {
    const user = await authUseCases.getAuthenticatedUser(req.usuario.id);

    return res.json({
      ok: true,
      usuario: user,
    });
  } catch (error) {
    return handleAuthError(error, res, "me");
  }
};

module.exports = {
  register,
  login,
  me,
};
