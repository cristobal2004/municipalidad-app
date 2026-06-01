const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/connection");
const solicitudesRoutes = require("./routes/solicitudesRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend Municipalidad de Santo Domingo funcionando",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API REST activa",
    servicio: "Municipalidad de Santo Domingo",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW()");

    res.json({
      ok: true,
      mensaje: "Conexión a PostgreSQL exitosa",
      fechaServidor: resultado.rows[0].now,
    });
  } catch (error) {
    console.error("Error conectando a PostgreSQL:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al conectar con PostgreSQL",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/solicitudes", solicitudesRoutes);

module.exports = app;