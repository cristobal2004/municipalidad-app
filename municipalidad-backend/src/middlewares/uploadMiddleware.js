const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaDocumentos = path.join(__dirname, "../../uploads/documentos");

if (!fs.existsSync(carpetaDocumentos)) {
  fs.mkdirSync(carpetaDocumentos, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaDocumentos);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreBase = path
      .basename(file.originalname, extension)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const nombreFinal = `${Date.now()}-${nombreBase}${extension}`;

    cb(null, nombreFinal);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no permitido. Solo PDF, JPG o PNG."));
  }
};

const uploadDocumentos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  uploadDocumentos,
};