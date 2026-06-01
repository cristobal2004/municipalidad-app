const pool = require("./connection");

const agregarCamposDocumentos = async () => {
  try {
    await pool.query(`
      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS nombre_archivo VARCHAR(200);

      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS tipo_archivo VARCHAR(100);

      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS size_bytes INTEGER;

      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS estado VARCHAR(30) DEFAULT 'recibido';

      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS descripcion TEXT;

      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log("Campos de documentos preparados correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error preparando tabla documentos:", error);
    process.exit(1);
  }
};

agregarCamposDocumentos();