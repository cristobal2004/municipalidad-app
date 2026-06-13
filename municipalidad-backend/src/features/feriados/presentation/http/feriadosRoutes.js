const express = require("express");
const { param, query } = require("express-validator");

const {
  obtenerFeriadosPorAnio,
  verificarFechaFeriado,
} = require("./feriadosController");
const {
  verificarToken,
} = require("../../../../core/http/middleware/authMiddleware");
const {
  validarCampos,
} = require("../../../../core/http/middleware/validarCampos");

const router = express.Router();

router.use(verificarToken);

router.get(
  "/verificar/fecha",
  [
    query("fecha")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("La fecha debe usar el formato YYYY-MM-DD."),
    validarCampos,
  ],
  verificarFechaFeriado
);

router.get(
  "/:anio",
  [
    param("anio")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("El año debe estar entre 2000 y 2100."),
    validarCampos,
  ],
  obtenerFeriadosPorAnio
);

module.exports = router;
