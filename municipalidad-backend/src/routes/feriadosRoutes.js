const express = require("express");
const router = express.Router();

const {
  obtenerFeriadosPorAnio,
  verificarFechaFeriado,
} = require("../controllers/feriadosController");

const { verificarToken } = require("../middlewares/authMiddleware");

router.use(verificarToken);

router.get("/:anio", obtenerFeriadosPorAnio);
router.get("/verificar/fecha", verificarFechaFeriado);

module.exports = router;