const { validationResult } = require("express-validator");

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: "Datos de entrada inválidos.",
      errores: errores.array().map((error) => ({
        campo: error.path,
        mensaje: error.msg,
      })),
    });
  }

  next();
};

module.exports = {
  validarCampos,
};