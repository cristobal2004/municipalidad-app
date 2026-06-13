const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { environment } = require("../config/environment");
const pool = require("../database/connection");
const {
  sanitizarEntrada,
} = require("../http/middleware/sanitizeMiddleware");
const authRoutes = require("../../features/auth/presentation/http/authRoutes");
const solicitudesRoutes = require("../../features/solicitudes/presentation/http/solicitudesRoutes");
const feriadosRoutes = require("../../features/feriados/presentation/http/feriadosRoutes");

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || environment.corsOrigins.includes(origin)) {
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
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
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
    timestamp: new Date().toISOString(),
  });
});

if (environment.nodeEnv !== "production") {
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
      });
    }
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/solicitudes", apiLimiter);
app.use("/api/feriados", apiLimiter);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/feriados", feriadosRoutes);
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada.",
  });
});

app.use((error, req, res, next) => {
  if (!error.status || error.status >= 500) {
    console.error("Error no controlado:", error);
  }

  return res.status(error.status || 500).json({
    ok: false,
    mensaje:
      error.status && error.status < 500
        ? error.message
        : "Error interno del servidor.",
  });
});

module.exports = app;
