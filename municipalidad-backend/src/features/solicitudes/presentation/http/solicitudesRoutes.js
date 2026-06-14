const express = require("express");
const router = express.Router();

const {
  listarSolicitudes,
  obtenerDatosReporte,
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  eliminarSolicitud,
  subirDocumentosSolicitud,
  descargarDocumentoSolicitud,
  validarDocumentoSolicitud,
  derivarSolicitud,
  crearAgendamientoSolicitud,
  obtenerMisAgendamientos,
  obtenerAgendamientosSolicitud,
} = require("./solicitudesController");
const { crearSolicitud } = require("./crearSolicitudController");
const {
  obtenerDisponibilidadAgendamiento,
} = require("./disponibilidadController");

const {
  verificarToken,
} = require("../../../../core/http/middleware/authMiddleware");
const {
  uploadDocumentos,
} = require("../../../../core/http/middleware/uploadMiddleware");

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
  Datos consolidados para reportes municipales
  GET /api/solicitudes/reportes/datos
*/
router.get("/reportes/datos", obtenerDatosReporte);

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
  Descargar un documento con control de acceso
  GET /api/solicitudes/:id/documentos/:documentoId/archivo
*/
router.get(
  "/:id/documentos/:documentoId/archivo",
  descargarDocumentoSolicitud,
);

/*
  Aprobar, rechazar o dejar pendiente un documento
  PATCH /api/solicitudes/:id/documentos/:documentoId
*/
router.patch(
  "/:id/documentos/:documentoId",
  validarDocumentoSolicitud,
);

/*
  Derivar una solicitud a otra área y funcionario
  PATCH /api/solicitudes/:id/derivar
*/
router.patch("/:id/derivar", derivarSolicitud);

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
  Consultar horas disponibles del funcionario asignado
  GET /api/solicitudes/:id/disponibilidad?fecha=AAAA-MM-DD
*/
router.get("/:id/disponibilidad", obtenerDisponibilidadAgendamiento);

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
