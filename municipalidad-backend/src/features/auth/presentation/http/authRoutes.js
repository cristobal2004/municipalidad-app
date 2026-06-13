const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const { register, login, me } = require("./authController");
const {
  verificarToken,
} = require("../../../../core/http/middleware/authMiddleware");
const {
  validarCampos,
} = require("../../../../core/http/middleware/validarCampos");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    mensaje: "Demasiados intentos de acceso. Intenta más tarde.",
  },
});

router.post(
  "/register",
  authLimiter,
  [
    body("nombre")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres."),
    body("rut")
      .trim()
      .isLength({ min: 7, max: 15 })
      .withMessage("El RUT debe tener entre 7 y 15 caracteres."),
    body("correo")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Debe ingresar un correo electrónico válido."),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("La contraseña debe tener entre 8 y 72 caracteres."),
    body("region")
      .optional()
      .trim()
      .isLength({ max: 80 })
      .withMessage("La región no puede superar los 80 caracteres."),
    body("comuna")
      .optional()
      .trim()
      .isLength({ max: 80 })
      .withMessage("La comuna no puede superar los 80 caracteres."),
    validarCampos,
  ],
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("correo")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Debe ingresar un correo electrónico válido."),
    body("password")
      .isLength({ min: 1, max: 72 })
      .withMessage("La contraseña no puede superar los 72 caracteres."),
    validarCampos,
  ],
  login
);

router.get("/me", verificarToken, me);

module.exports = router;
