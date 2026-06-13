const bcrypt = require("bcrypt");
const pool = require("../../../core/database/connection");

const usuarioDemo = {
  nombre: "Usuario Prueba",
  rut: "11.111.111-1",
  correo: "usuario@test.cl",
  password: "usuario123",
  region: "Valparaiso",
  comuna: "Santo Domingo",
  tipoUsuario: "ciudadano",
};

const seedUsuarioDemo = async () => {
  try {
    const passwordHash = await bcrypt.hash(usuarioDemo.password, 10);

    await pool.query(
      `
      INSERT INTO usuarios
      (
        nombre,
        rut,
        correo,
        password_hash,
        rol,
        region,
        comuna,
        tipo_usuario
      )
      VALUES ($1, $2, $3, $4, 'usuario', $5, $6, $7)
      ON CONFLICT (correo)
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        rut = EXCLUDED.rut,
        password_hash = EXCLUDED.password_hash,
        rol = 'usuario',
        region = EXCLUDED.region,
        comuna = EXCLUDED.comuna,
        tipo_usuario = EXCLUDED.tipo_usuario
      `,
      [
        usuarioDemo.nombre,
        usuarioDemo.rut,
        usuarioDemo.correo,
        passwordHash,
        usuarioDemo.region,
        usuarioDemo.comuna,
        usuarioDemo.tipoUsuario,
      ],
    );

    console.log(`Usuario demo actualizado: ${usuarioDemo.correo}`);
  } catch (error) {
    console.error("Error ejecutando seed de usuario demo:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedUsuarioDemo();
