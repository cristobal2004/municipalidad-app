ALTER TABLE solicitudes
  DROP CONSTRAINT IF EXISTS solicitudes_estado_check;

ALTER TABLE solicitudes
  ADD CONSTRAINT solicitudes_estado_check
  CHECK (
    estado IN (
      'pendiente', 'en_revision', 'observada', 'derivada',
      'aprobada', 'rechazada', 'cerrada'
    )
  );

ALTER TABLE observaciones
  DROP CONSTRAINT IF EXISTS observaciones_estado_resultante_check;

ALTER TABLE observaciones
  ADD CONSTRAINT observaciones_estado_resultante_check
  CHECK (
    estado_resultante IS NULL OR estado_resultante IN (
      'pendiente', 'en_revision', 'observada', 'derivada',
      'aprobada', 'rechazada', 'cerrada'
    )
  );

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario_created_at
  ON solicitudes (usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solicitudes_funcionario_estado_created_at
  ON solicitudes (funcionario_id, estado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado_created_at
  ON solicitudes (estado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solicitudes_area_estado_created_at
  ON solicitudes (area_responsable, estado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documentos_solicitud_created_at
  ON documentos (solicitud_id, created_at);

CREATE INDEX IF NOT EXISTS idx_observaciones_solicitud_created_at
  ON observaciones (solicitud_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agendamientos_usuario_fecha
  ON agendamientos (usuario_id, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_agendamientos_funcionario_fecha_estado
  ON agendamientos (funcionario_id, fecha_hora, estado);

CREATE UNIQUE INDEX IF NOT EXISTS uq_agendamientos_funcionario_fecha_activa
  ON agendamientos (funcionario_id, fecha_hora)
  WHERE funcionario_id IS NOT NULL
    AND estado IN ('agendada', 'confirmada');

CREATE UNIQUE INDEX IF NOT EXISTS uq_agendamientos_solicitud_activa
  ON agendamientos (solicitud_id, usuario_id)
  WHERE estado IN ('agendada', 'confirmada');

CREATE TABLE IF NOT EXISTS historial_solicitudes (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
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
