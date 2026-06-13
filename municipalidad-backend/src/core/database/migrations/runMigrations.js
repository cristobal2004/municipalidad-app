const pool = require("../connection");

const runMigrations = async () => {
  await pool.query(`
    ALTER TABLE solicitudes
      ADD COLUMN IF NOT EXISTS area_responsable VARCHAR(100),
      ADD COLUMN IF NOT EXISTS datos_tramite JSONB NOT NULL DEFAULT '{}'::jsonb;

    UPDATE solicitudes
    SET area_responsable = CASE
      WHEN lower(tipo_tramite) LIKE '%circulacion%' THEN 'Finanzas'
      WHEN lower(tipo_tramite) LIKE '%obra%' OR lower(tipo_tramite) LIKE '%construccion%'
        THEN 'Obras Municipales'
      ELSE 'Patentes Comerciales'
    END
    WHERE area_responsable IS NULL;

    CREATE INDEX IF NOT EXISTS idx_solicitudes_area_estado_created_at
      ON solicitudes (area_responsable, estado, created_at DESC);
  `);

  const columnResult = await pool.query(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'agendamientos'
      AND column_name = 'fecha_hora'
  `);

  if (columnResult.rows[0]?.data_type === "timestamp without time zone") {
    await pool.query(`
      ALTER TABLE agendamientos
      ALTER COLUMN fecha_hora TYPE TIMESTAMPTZ
      USING fecha_hora AT TIME ZONE 'America/Santiago'
    `);
  }

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_agendamientos_funcionario_fecha_estado
      ON agendamientos (funcionario_id, fecha_hora, estado);

    CREATE UNIQUE INDEX IF NOT EXISTS uq_agendamientos_funcionario_fecha_activa
      ON agendamientos (funcionario_id, fecha_hora)
      WHERE funcionario_id IS NOT NULL
        AND estado IN ('agendada', 'confirmada');

    CREATE UNIQUE INDEX IF NOT EXISTS uq_agendamientos_solicitud_activa
      ON agendamientos (solicitud_id, usuario_id)
      WHERE estado IN ('agendada', 'confirmada');
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS historial_solicitudes (
      id SERIAL PRIMARY KEY,
      solicitud_id INTEGER NOT NULL
        REFERENCES solicitudes(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      actor_rol VARCHAR(30) NOT NULL
        CHECK (actor_rol IN ('usuario', 'funcionario', 'sistema')),
      accion VARCHAR(50) NOT NULL,
      titulo VARCHAR(150) NOT NULL,
      descripcion TEXT NOT NULL,
      cambios JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_historial_solicitud_created_at
      ON historial_solicitudes (solicitud_id, created_at DESC);

    INSERT INTO historial_solicitudes
    (
      solicitud_id,
      actor_id,
      actor_rol,
      accion,
      titulo,
      descripcion,
      cambios,
      created_at
    )
    SELECT
      s.id,
      s.usuario_id,
      'usuario',
      'creacion',
      'Solicitud ingresada',
      'La solicitud fue registrada correctamente.',
      jsonb_build_object('estado', s.estado),
      s.created_at
    FROM solicitudes s
    WHERE NOT EXISTS (
      SELECT 1
      FROM historial_solicitudes h
      WHERE h.solicitud_id = s.id
        AND h.accion = 'creacion'
    );
  `);
};

module.exports = runMigrations;
