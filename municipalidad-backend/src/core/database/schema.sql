
DROP TABLE IF EXISTS historial_solicitudes CASCADE;
DROP TABLE IF EXISTS agendamientos CASCADE;
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  correo VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('usuario', 'funcionario')),
  region VARCHAR(80),
  comuna VARCHAR(80),
  tipo_usuario VARCHAR(50),
  area VARCHAR(100),
  numero_empleado VARCHAR(30) UNIQUE,
  cargo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solicitudes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  funcionario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo_tramite VARCHAR(100) NOT NULL,
  razon_social VARCHAR(150),
  rut_empresa VARCHAR(20),
  direccion VARCHAR(200),
  tipo_patente VARCHAR(100),
  rol_avaluo VARCHAR(80),
  pyme BOOLEAN DEFAULT false,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_revision', 'observada', 'derivada', 'aprobada', 'rechazada', 'cerrada')),
  correo_contacto VARCHAR(120),
  telefono_contacto VARCHAR(30),
  giro VARCHAR(150),
  superficie VARCHAR(50),
  observaciones_solicitante TEXT,
  prioridad VARCHAR(30) DEFAULT 'media',
  area_responsable VARCHAR(100),
  datos_tramite JSONB NOT NULL DEFAULT '{}'::jsonb,
  documentos_faltantes JSONB DEFAULT '[]'::jsonb,
  fecha_limite_documentos DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(200) NOT NULL,
  tipo_documento VARCHAR(100),
  ruta_archivo TEXT,
  estado_validacion VARCHAR(30) DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado')),
  tipo_archivo VARCHAR(100),
  size_bytes INTEGER,
  estado VARCHAR(30) DEFAULT 'recibido',
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE observaciones (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  funcionario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  mensaje TEXT NOT NULL,
  estado_resultante VARCHAR(30)
    CHECK (estado_resultante IN ('pendiente', 'en_revision', 'observada', 'derivada', 'aprobada', 'rechazada', 'cerrada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agendamientos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  funcionario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'agendada'
    CHECK (estado IN ('pendiente', 'agendada', 'confirmada', 'reagendada', 'cancelada', 'completada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_solicitudes (
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

CREATE INDEX idx_solicitudes_usuario_created_at
  ON solicitudes (usuario_id, created_at DESC);

CREATE INDEX idx_solicitudes_funcionario_estado_created_at
  ON solicitudes (funcionario_id, estado, created_at DESC);

CREATE INDEX idx_solicitudes_estado_created_at
  ON solicitudes (estado, created_at DESC);

CREATE INDEX idx_solicitudes_area_estado_created_at
  ON solicitudes (area_responsable, estado, created_at DESC);

CREATE INDEX idx_documentos_solicitud_created_at
  ON documentos (solicitud_id, created_at);

CREATE INDEX idx_observaciones_solicitud_created_at
  ON observaciones (solicitud_id, created_at DESC);

CREATE INDEX idx_agendamientos_usuario_fecha
  ON agendamientos (usuario_id, fecha_hora);

CREATE INDEX idx_agendamientos_funcionario_fecha_estado
  ON agendamientos (funcionario_id, fecha_hora, estado);

CREATE INDEX idx_historial_solicitud_created_at
  ON historial_solicitudes (solicitud_id, created_at DESC);

CREATE UNIQUE INDEX uq_agendamientos_funcionario_fecha_activa
  ON agendamientos (funcionario_id, fecha_hora)
  WHERE funcionario_id IS NOT NULL
    AND estado IN ('agendada', 'confirmada');

CREATE UNIQUE INDEX uq_agendamientos_solicitud_activa
  ON agendamientos (solicitud_id, usuario_id)
  WHERE estado IN ('agendada', 'confirmada');
