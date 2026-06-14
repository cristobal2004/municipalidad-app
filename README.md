# Municipalidad App - Entrega Final

Aplicación fullstack para digitalizar la solicitud y seguimiento de trámites de
la Municipalidad de Santo Domingo.

## Integrantes

- Cristóbal Rubilar
- Oscar Ruiz
- Cristian Mejías

## Funcionalidades

### Ciudadanía

- Registro e inicio de sesión.
- Creación de solicitudes de patente comercial, permiso de circulación y
  obras municipales.
- Carga de documentos PDF, JPG y PNG.
- Seguimiento del estado y observaciones de una solicitud.
- Entrega de documentos pendientes.
- Agenda de atención de lunes a viernes, con horas entre 09:00 y 17:00 y
  bloqueo automático de horarios ocupados.
- Confirmaciones por correo para nuevas solicitudes, cambios de estado y
  agendamientos mediante SMTP configurable.
- Consulta ciudadana mediante correo dirigido a
  `atencionciudadana@santodomingo.cl`.
- Notificaciones y almacenamiento local de preferencias de interfaz.

### Funcionariado

- Inicio de sesión con rol municipal.
- Bandeja de solicitudes asignadas.
- Descarga protegida y validación individual de documentos.
- Cambio de estado, observaciones y solicitud de documentos faltantes.
- Derivación a otra área con reasignación automática por carga.
- Agenda de atenciones.
- Reportes reales, motivos frecuentes de rechazo y exportación CSV/PDF.

## Tecnologías

- Frontend: Ionic 8, React 19, TypeScript, React Router, Axios y Capacitor.
- Backend: Node.js, Express 5 y API REST.
- Base de datos: PostgreSQL 16 y consultas parametrizadas con `pg`.
- Seguridad: JWT, bcrypt, Helmet, CORS por lista permitida, rate limiting,
  validación con express-validator y sanitización XSS.
- Servicio externo: Nager.Date para feriados de Chile.
- Pruebas: Vitest, Testing Library, Cypress y `node:test`.
- Despliegue: Docker, Docker Compose y Nginx.

## Arquitectura

El repositorio es un monorepo con frontend y backend:

```text
municipalidad-app/
|-- src/
|   |-- core/                      # Configuracion, HTTP, rutas y tema
|   `-- features/
|       |-- auth/
|       |-- solicitudes/
|       |-- agenda/
|       |-- dashboard/
|       |-- notificaciones/
|       |-- reportes/
|       `-- landing/
|-- municipalidad-backend/
|   |-- src/
|   |   |-- core/                  # Configuracion, DB, seguridad y servidor
|   |   `-- features/
|   |       |-- auth/
|   |       |-- solicitudes/
|   |       `-- feriados/
|   `-- tests/                     # Dominio, repositorios, HTTP y API
|-- database/                      # Respaldo e indices PostgreSQL
|-- cypress/                       # Flujos E2E y responsive
|-- otros/                         # Evidencia tecnica y de la rubrica
|-- .github/                       # CI y plantillas de gestion
|-- docker-compose.yml
`-- README.md
```

Cada funcionalidad separa `presentation`, `domain`, `data` y, cuando
corresponde, `composition`. La organización sigue el criterio del repositorio
CoffeeEcommerce indicado como referencia por el curso. El detalle se encuentra
en `otros/Arquitectura.md`.

## Requisitos

- Node.js 22 o superior para desarrollo del frontend.
- npm 10 o superior.
- PostgreSQL 16 para ejecución manual.
- Docker Desktop para ejecución con contenedores.

## Ejecución con Docker

1. Crear el archivo local de variables:

```powershell
Copy-Item .env.example .env
```

2. Cambiar `POSTGRES_PASSWORD` y `JWT_SECRET` por valores seguros.

3. Docker activa Mailpit como servidor SMTP local. Los mensajes se entregan de
   verdad al buzón de pruebas, sin enviarse a direcciones externas. Para
   producción se reemplazan las variables SMTP por las credenciales
   institucionales.

4. Construir y levantar los servicios:

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- Salud de API: `http://localhost:3000/api/health`
- Buzón de correos Mailpit: `http://localhost:8025`
- PostgreSQL: `localhost:5432`

Docker Compose espera a que PostgreSQL y la API estén saludables antes de
iniciar los servicios dependientes. Los datos y archivos cargados se conservan
en volúmenes.

Para detener:

```bash
docker compose down
```

Para eliminar también los datos locales:

```bash
docker compose down -v
```

## Ejecución manual

### Base de datos

Crear una base llamada `municipalidad_app` e importar:

```bash
psql -U postgres -d municipalidad_app -f database/municipalidad_db_con_datos.sql
psql -U postgres -d municipalidad_app -f database/02_indexes.sql
```

El respaldo contiene únicamente información demostrativa. No se deben publicar
datos personales ni archivos reales de ciudadanos.

### Backend

```powershell
Set-Location municipalidad-backend
Copy-Item .env.example .env
npm ci
npm run dev
```

Variables obligatorias:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=municipalidad_app
DB_USER=postgres
DB_PASSWORD=clave_local
JWT_SECRET=secreto_aleatorio_de_al_menos_32_caracteres
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=correo_municipal@gmail.com
SMTP_PASS=clave_de_aplicacion
SMTP_FROM="Municipalidad de Santo Domingo <correo_municipal@gmail.com>"
SMTP_REPLY_TO=atencionciudadana@santodomingo.cl
```

### Frontend

Desde la raíz:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

La variable principal es:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

## API REST

### Autenticación

| Método | Ruta | Descripción | JWT |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Registro ciudadano | No |
| `POST` | `/api/auth/login` | Inicio de sesión | No |
| `GET` | `/api/auth/me` | Perfil autenticado | Sí |

El registro público fuerza el rol `usuario`. Las cuentas de funcionarios deben
ser creadas mediante un proceso administrativo o seed controlado.

### Solicitudes

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/solicitudes` | Crear solicitud y adjuntar documentos |
| `GET` | `/api/solicitudes` | Listar solicitudes según rol |
| `GET` | `/api/solicitudes/mis-solicitudes` | Solicitudes del ciudadano |
| `GET` | `/api/solicitudes/:id` | Ver detalle autorizado |
| `PATCH` | `/api/solicitudes/:id` | Actualizar gestión municipal |
| `DELETE` | `/api/solicitudes/:id` | Eliminar solicitud autorizada |
| `POST` | `/api/solicitudes/:id/documentos` | Adjuntar pendientes |
| `GET` | `/api/solicitudes/:id/documentos/:documentoId/archivo` | Descargar documento autorizado |
| `PATCH` | `/api/solicitudes/:id/documentos/:documentoId` | Validar documento asignado |
| `PATCH` | `/api/solicitudes/:id/derivar` | Derivar a otra área municipal |
| `POST` | `/api/solicitudes/:id/agendamientos` | Crear o reagendar cita |
| `GET` | `/api/solicitudes/:id/disponibilidad?fecha=YYYY-MM-DD` | Horas libres del funcionario |
| `GET` | `/api/solicitudes/mis-agendamientos` | Consultar agenda |
| `GET` | `/api/solicitudes/reportes/datos` | Datos reales para reportes de funcionarios |

### Servicio externo

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/feriados/:anio` | Feriados de Chile |
| `GET` | `/api/feriados/verificar/fecha?fecha=YYYY-MM-DD` | Validar fecha |

La integración usa timeout y caché en memoria para reducir latencia y
dependencia del proveedor.

## Seguridad

- Contraseñas cifradas con bcrypt.
- JWT con expiración de dos horas.
- Rutas protegidas por autenticación y rol.
- Registro público sin posibilidad de elevar privilegios.
- Consultas SQL parametrizadas.
- Validación y normalización de entradas.
- Sanitización contra XSS sin modificar contraseñas.
- CORS limitado a orígenes configurados.
- Helmet y ocultamiento de `X-Powered-By`.
- Límites de solicitudes generales y de autenticación.
- Límite de 10 MB y tipos permitidos en documentos.
- Archivos sin publicación estática: la descarga exige JWT y pertenencia o
  asignación de la solicitud.
- Historial persistente de creación, cambios, documentos y derivaciones.
- Errores internos sin detalles técnicos en respuestas de producción.
- Secretos excluidos de Git y Docker.

## Rendimiento

- Pool PostgreSQL con límites y timeouts.
- Paginación de solicitudes.
- Índices para usuario, funcionario, estado, fechas y relaciones.
- Índices únicos parciales para evitar citas activas duplicadas.
- Caché temporal para feriados.
- Carga diferida de las pantallas del frontend.
- Bundles separados para React, Ionic, router, Axios e iconos.
- Objetivo ES2020 sin generar un segundo bundle heredado.
- Compilación minificada y servicio estático mediante Nginx.

## Pruebas

Frontend:

```bash
npm run lint
npm run test.unit
npm run test.e2e
npm run test.e2e:docker
npm run build
```

`test.e2e` usa el servidor de desarrollo en `http://localhost:5173`.
`test.e2e:docker` valida la aplicación, PostgreSQL, la API real y la entrega de
correo a Mailpit con los contenedores levantados.

Backend:

```bash
cd municipalidad-backend
npm test
```

La suite definida al 13 de junio de 2026 contiene:

- 10 pruebas unitarias de frontend.
- 35 pruebas automáticas de backend.
- 7 escenarios Cypress de interfaz.
- 1 escenario Cypress de integración real con API, PostgreSQL y Mailpit.
- CI con lint, pruebas, build y despliegue completo mediante Docker Compose.

El resultado del ciclo ejecutado para la publicación debe revisarse en la
pestaña Actions del Pull Request.

La colección y las capturas de Postman están en
`otros/EP2-Postman-Pruebas/`.

## Credenciales demostrativas

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Usuario | `usuario@test.cl` | `usuario123` |
| Funcionario | `cristian.mejias@santodomingo.cl` | `admin123` |
| Funcionario | `benjamin.gomez@santodomingo.cl` | `funcionario123` |
| Funcionario | `oscar.ruiz@santodomingo.cl` | `finanzas123` |
| Funcionario | `pablo.aguilera@santodomingo.cl` | `obras123` |
| Funcionario | `martina.ponce@santodomingo.cl` | `patentes123` |

Estas credenciales son solo para desarrollo y deben cambiarse antes de un
despliegue real.

Si la base ya existía antes de esta versión, las credenciales demostrativas se
pueden restablecer sin eliminar solicitudes:

```bash
docker compose exec backend npm run seed:usuario-demo
docker compose exec backend npm run seed:funcionarios
```

## Cumplimiento de entrega final

| Requisito | Implementación |
| --- | --- |
| EF1 | CRUD, documentos, agenda, notificaciones y almacenamiento local |
| EF2 | Diseño responsive, navegación por rol y carga diferida |
| EF3 | JWT, bcrypt, Helmet, CORS, rate limit, XSS y SQL parametrizado |
| EF4 | Pool, paginación, consultas explícitas, secuencias, índices y caché |
| EF5 | Integración con Nager.Date |
| EF6 | Dockerfiles, Docker Compose, PostgreSQL, Nginx y healthchecks |

La evidencia detallada, los pasos de entrega y las acciones externas de GitHub
están documentados en `otros/Checklist-entrega-final.md`.
