const { Pool } = require("pg");
const { environment } = require("../config/environment");

const pool = new Pool({
  host: environment.database.host,
  port: environment.database.port,
  database: environment.database.name,
  user: environment.database.user,
  password: environment.database.password,
  max: environment.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = pool;
