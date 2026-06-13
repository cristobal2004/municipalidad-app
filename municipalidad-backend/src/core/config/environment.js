require("dotenv").config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
};

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 3000),
  host: process.env.HOST || "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST,
    port: parseNumber(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    poolMax: parseNumber(process.env.DB_POOL_MAX, 10),
  },
  email: {
    enabled: parseBoolean(process.env.EMAIL_ENABLED),
    host: process.env.SMTP_HOST || "",
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASS || "",
    from:
      process.env.SMTP_FROM ||
      "Municipalidad de Santo Domingo <no-responder@santodomingo.cl>",
    replyTo:
      process.env.SMTP_REPLY_TO || "atencionciudadana@santodomingo.cl",
  },
};

const validateEnvironment = () => {
  if (!environment.jwtSecret) {
    throw new Error("JWT_SECRET es obligatorio para iniciar el backend.");
  }

  if (
    environment.nodeEnv === "production" &&
    environment.jwtSecret.length < 32
  ) {
    throw new Error(
      "JWT_SECRET debe tener al menos 32 caracteres en produccion.",
    );
  }
};

module.exports = {
  environment,
  validateEnvironment,
};
