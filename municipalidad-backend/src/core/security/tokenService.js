const jwt = require("jsonwebtoken");
const { environment } = require("../config/environment");

const tokenService = {
  sign(user) {
    return jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        correo: user.correo,
      },
      environment.jwtSecret,
      { expiresIn: "2h" },
    );
  },

  verify(token) {
    return jwt.verify(token, environment.jwtSecret);
  },
};

module.exports = {
  tokenService,
};
