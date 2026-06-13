const pool = require("../connection");

const agregarCamposSolicitud = async () => {
  try {
    await pool.query(`
      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS correo_contacto VARCHAR(120);

      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(30);

      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS giro VARCHAR(150);

      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS superficie VARCHAR(50);

      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS observaciones_solicitante TEXT;

      ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS prioridad VARCHAR(30) DEFAULT 'media';
    `);

    console.log("Campos adicionales de solicitudes agregados correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error agregando campos a solicitudes:", error);
    process.exit(1);
  }
};

agregarCamposSolicitud();
