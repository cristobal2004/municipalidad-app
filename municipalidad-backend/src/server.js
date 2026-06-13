const app = require("./app");
const pool = require("./core/database/connection");
const {
  environment,
  validateEnvironment,
} = require("./core/config/environment");
const runMigrations = require("./core/database/migrations/runMigrations");

validateEnvironment();

let server;

const startServer = async () => {
  await runMigrations();

  server = app.listen(environment.port, environment.host, () => {
    console.log(
      `Servidor backend corriendo en http://localhost:${environment.port}`,
    );
    console.log(
      `Servidor backend disponible en la red local usando tu IP en el puerto ${environment.port}`,
    );
  });
};

const cerrarServidor = async (signal) => {
  console.log(`${signal} recibido. Cerrando servicios...`);

  if (!server) {
    await pool.end();
    process.exit(0);
  }

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
process.on("SIGINT", () => cerrarServidor("SIGINT"));

startServer().catch(async (error) => {
  console.error("No fue posible iniciar el servidor:", error);
  await pool.end();
  process.exit(1);
});
