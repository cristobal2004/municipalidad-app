const path = require("path");
const express = require("express");
const cors = require("cors");
const feriadosRoutes = require("./routes/feriadosRoutes");
require("dotenv").config();

const pool = require("./db/connection");
const solicitudesRoutes = require("./routes/solicitudesRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const { sanitizarEntrada } = require("./middlewares/sanitizeMiddleware");

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
  .split(",")
  .map((origin) => origin.trim());


const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("Origen no permitido por CORS.");
    error.status = 403;
    return callback(error);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    mensaje: "Demasiadas solicitudes. Intenta nuevamente más tarde.",
  },
});

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(helmet());
app.use(
  express.json({
    limit: "1mb",
  })
);
app.use(sanitizarEntrada);

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
app.use("/api/solicitudes", apiLimiter);
app.use("/api/feriados", apiLimiter);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/feriados", feriadosRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((error, req, res, next) => {
  if (error.message === "Origen no permitido por CORS.") {
    return res.status(error.status || 403).json({
      ok: false,
      mensaje: error.message,
    });
  }

  return next(error);
});

module.exports = app;
