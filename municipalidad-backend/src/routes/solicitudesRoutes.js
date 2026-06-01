const express = require("express");
const router = express.Router();

const {
  crearSolicitud,
  listarSolicitudes,
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  eliminarSolicitud,
  subirDocumentosSolicitud,
  crearAgendamientoSolicitud,
  obtenerMisAgendamientos,
  obtenerAgendamientosSolicitud,
} = require("../controllers/solicitudesController");

const { verificarToken } = require("../middlewares/authMiddleware");
const { uploadDocumentos } = require("../middlewares/uploadMiddleware");

/*
  Todas las rutas de solicitudes requieren JWT.
*/
router.use(verificarToken);

/*
  Middleware para manejar errores de subida de archivos.
*/
const subirDocumentos = (req, res, next) => {
  uploadDocumentos.array("documentos", 10)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error.message || "Error al subir documentos.",
      });
    }

    next();
  });
};

/*
  Crear solicitud ciudadana con documentos reales
  POST /api/solicitudes
*/
router.post("/", subirDocumentos, crearSolicitud);

/*
  Listar solicitudes
  GET /api/solicitudes
*/
router.get("/", listarSolicitudes);

/*
  Listar mis solicitudes como usuario ciudadano
  GET /api/solicitudes/mis-solicitudes
*/
router.get("/mis-solicitudes", obtenerMisSolicitudes);

/*
  Listar mis agendamientos
  GET /api/solicitudes/mis-agendamientos
*/
router.get("/mis-agendamientos", obtenerMisAgendamientos);

/*
  Subir documentos pendientes a una solicitud existente
  POST /api/solicitudes/:id/documentos
*/
router.post("/:id/documentos", subirDocumentos, subirDocumentosSolicitud);

/*
  Crear agendamiento para una solicitud
  POST /api/solicitudes/:id/agendamientos
*/
router.post("/:id/agendamientos", crearAgendamientoSolicitud);

/*
  Obtener agendamientos de una solicitud
  GET /api/solicitudes/:id/agendamientos
*/
router.get("/:id/agendamientos", obtenerAgendamientosSolicitud);

/*
  Obtener una solicitud por código o ID interno
  GET /api/solicitudes/:id
*/
router.get("/:id", obtenerSolicitudPorId);

/*
  Actualizar estado u observación de solicitud
  PATCH /api/solicitudes/:id
*/
router.patch("/:id", actualizarSolicitud);

/*
  Eliminar solicitud
  DELETE /api/solicitudes/:id
*/
router.delete("/:id", eliminarSolicitud);

module.exports = router;