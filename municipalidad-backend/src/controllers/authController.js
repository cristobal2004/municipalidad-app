const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      correo: usuario.correo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

const register = async (req, res) => {
  try {
    const {
      nombre,
      rut,
      correo,
      password,
      region,
      comuna,
      tipoUsuario,
      rol,
    } = req.body;

    if (!nombre || !rut || !correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, RUT, correo y contraseña son obligatorios.",
      });
    }

    if (!correo.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe ingresar un correo electrónico válido.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const rolFinal = rol === "funcionario" ? "funcionario" : "usuario";

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE correo = $1 OR rut = $2",
      [correo, rut]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe un usuario registrado con ese correo o RUT.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `
      INSERT INTO usuarios 
      (nombre, rut, correo, password_hash, rol, region, comuna, tipo_usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nombre, rut, correo, rol, region, comuna, tipo_usuario, created_at
      `,
      [
        nombre,
        rut,
        correo,
        passwordHash,
        rolFinal,
        region || null,
        comuna || null,
        tipoUsuario || null,
      ]
    );

    const usuario = resultado.rows[0];
    const token = generarToken(usuario);

    return res.status(201).json({
      ok: true,
      mensaje: "Usuario registrado correctamente.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: usuario.rut,
        correo: usuario.correo,
        rol: usuario.rol,
        region: usuario.region,
        comuna: usuario.comuna,
        tipoUsuario: usuario.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al registrar usuario.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Correo y contraseña son obligatorios.",
      });
    }

    const resultado = await pool.query(
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
      [correo]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales inválidas.",
      });
    }

    const usuario = resultado.rows[0];

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: "Credenciales inválidas.",
      });
    }

    const token = generarToken(usuario);

    return res.json({
      ok: true,
      mensaje: "Inicio de sesión correcto.",
      token,
      usuario: {
        usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: usuario.rut,
        correo: usuario.correo,
        rol: usuario.rol,
        region: usuario.region,
        comuna: usuario.comuna,
        tipoUsuario: usuario.tipo_usuario,
        area: usuario.area,
        cargo: usuario.cargo,
        numeroEmpleado: usuario.numero_empleado,
        },
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al iniciar sesión.",
    });
  }
};

const me = async (req, res) => {
  try {
    const resultado = await pool.query(
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
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado.",
      });
    }

    const usuario = resultado.rows[0];

    return res.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: usuario.rut,
        correo: usuario.correo,
        rol: usuario.rol,
        region: usuario.region,
        comuna: usuario.comuna,
        tipoUsuario: usuario.tipo_usuario,
        area: usuario.area,
        },
    });
  } catch (error) {
    console.error("Error en me:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener usuario autenticado.",
    });
  }
};

module.exports = {
  register,
  login,
  me,
};