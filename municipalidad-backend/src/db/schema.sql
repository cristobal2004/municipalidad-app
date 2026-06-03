CREATE TABLE IF NOT EXISTS usuarios (
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
  numero_empleado VARCHAR(50),
  cargo VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitudes (
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
  correo_contacto VARCHAR(120),
  telefono_contacto VARCHAR(30),
  giro VARCHAR(150),
  superficie VARCHAR(50),
  observaciones_solicitante TEXT,
  prioridad VARCHAR(30) DEFAULT 'media',
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_revision', 'observada', 'aprobada', 'rechazada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(200) NOT NULL,
  tipo_documento VARCHAR(100),
  tipo_archivo VARCHAR(100),
  ruta_archivo TEXT,
  size_bytes INTEGER,
  estado VARCHAR(30) DEFAULT 'recibido',
  estado_validacion VARCHAR(30) DEFAULT 'pendiente'
    CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado')),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS observaciones (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  funcionario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  mensaje TEXT NOT NULL,
  estado_resultante VARCHAR(30)
    CHECK (estado_resultante IN ('pendiente', 'en_revision', 'observada', 'aprobada', 'rechazada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamientos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  funcionario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMP NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'agendado'
    CHECK (estado IN ('agendado', 'cancelado', 'realizado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);