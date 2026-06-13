const pool = require("../../../core/database/connection");

const userRepository = {
  async existsByEmailOrRut(email, rut) {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE correo = $1 OR rut = $2",
      [email, rut],
    );

    return result.rows.length > 0;
  },

  async createCitizen(data) {
    const result = await pool.query(
      `
      INSERT INTO usuarios
      (nombre, rut, correo, password_hash, rol, region, comuna, tipo_usuario)
      VALUES ($1, $2, $3, $4, 'usuario', $5, $6, $7)
      RETURNING id, nombre, rut, correo, rol, region, comuna, tipo_usuario, created_at
      `,
      [
        data.nombre,
        data.rut,
        data.correo,
        data.passwordHash,
        data.region || null,
        data.comuna || null,
        data.tipoUsuario || null,
      ],
    );

    return result.rows[0];
  },

  async findCredentialsByEmail(email) {
    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        rut,
        correo,
        password_hash,
        rol,
        region,
        comuna,
        tipo_usuario,
        area,
        cargo,
        numero_empleado
      FROM usuarios
      WHERE correo = $1
      `,
      [email],
    );

    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        rut,
        correo,
        rol,
        region,
        comuna,
        tipo_usuario,
        area,
        cargo,
        numero_empleado
      FROM usuarios
      WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] || null;
  },
};

module.exports = {
  userRepository,
};
