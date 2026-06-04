# Municipalidad App - Entrega Parcial 2

## Integrantes

- Cristóbal Rubilar
- Oscar Ruiz
- Cristian Mejías

## Descripción del proyecto

**Municipalidad App** es una aplicación web desarrollada con Ionic + React orientada a optimizar la gestión y seguimiento de solicitudes ciudadanas dentro de la Municipalidad de Santo Domingo.

La plataforma permite centralizar trámites municipales, mejorar la comunicación entre ciudadanos y funcionarios, y entregar mayor transparencia durante el proceso de atención y resolución de solicitudes.

## Objetivo de la Entrega Parcial 2

El objetivo de esta entrega es integrar el frontend desarrollado en Ionic + React con un backend funcional, incorporando autenticación, conexión a base de datos relacional y consumo de una API REST.

En esta entrega se incluye:

- Backend desarrollado con Node.js y Express.
- Base de datos relacional en PostgreSQL.
- API REST con endpoints para autenticación, solicitudes, documentos asociados, observaciones y agendamientos.
- Autenticación mediante JWT.
- Hash de contraseñas con bcrypt.
- Rutas protegidas en frontend y backend.
- Diferenciación de acceso por roles: usuario ciudadano y funcionario municipal.
- Consumo de API desde Ionic + React usando Axios.
- Manejo de errores e interceptores para tokens JWT.
- Evidencias de pruebas realizadas en Postman.

## Roles del sistema

### Usuario ciudadano

El usuario ciudadano puede utilizar la plataforma para:

- Registrarse e iniciar sesión.
- Crear solicitudes relacionadas con trámites municipales.
- Adjuntar documentos de respaldo.
- Consultar el estado de sus solicitudes.
- Revisar observaciones o actualizaciones.
- Agendar atención municipal.

### Funcionario municipal

El funcionario municipal puede:

- Iniciar sesión con rol autorizado.
- Revisar solicitudes asignadas.
- Actualizar estados de atención.
- Registrar observaciones internas.
- Revisar documentación adjunta.
- Gestionar información asociada a solicitudes municipales.

## Tecnologías utilizadas

### Frontend

- Ionic
- React
- TypeScript
- React Router
- Axios
- Capacitor

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- dotenv
- cors
- pg
- multer

### Base de datos

- PostgreSQL

### Herramientas de desarrollo y pruebas

- Git
- GitHub
- Postman
- Visual Studio Code

## Estructura general del repositorio

```text
municipalidad-app/
├── src/                         # Frontend Ionic + React
│   ├── components/              # Componentes reutilizables
│   ├── pages/                   # Páginas principales
│   ├── routes/                  # Rutas públicas y protegidas
│   └── services/                # Servicios de conexión con API
│
├── municipalidad-backend/       # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/         # Controladores de la API
│   │   ├── db/                  # Configuración de base de datos
│   │   ├── middlewares/         # Middlewares de autenticación, roles y archivos
│   │   └── routes/              # Rutas REST
│   └── package.json
│
├── database/                    # Scripts y respaldo de base de datos
├── otros/                       # Documentación, evidencias y pruebas
├── README.md
└── package.json
```

## Requisitos previos

Antes de ejecutar el proyecto se debe tener instalado:

- Node.js
- npm
- Ionic CLI
- PostgreSQL
- Git
- Postman o Insomnia para pruebas de API

## Clonar el repositorio

```bash
git clone https://github.com/cristobal2004/municipalidad-app.git
cd GitHub/municipalidad-app
```

## Configuración de variables de entorno

### Frontend

Crear un archivo `.env` en la raíz del proyecto frontend 
```bash
code .env
```
con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend

Crear un archivo `.env` dentro de la carpeta `municipalidad-backend` 

```bash
cd municipalidad-backend
code .env
```

con el siguiente contenido:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=municipalidad_app
DB_USER=postgres

DB_PASSWORD=tu_password_sql Es importante colocar tu contraseña de postgres!!!!!

JWT_SECRET=municipalidad_app
```

## Base de datos

El proyecto utiliza PostgreSQL como base de datos relacional para almacenar la información asociada a usuarios, solicitudes municipales, documentos, observaciones y agendamientos.

Durante el desarrollo se trabajó con dos archivos SQL principales:

- `municipalidad-backend/src/db/schema.sql`
- `database/municipalidad_db_con_datos.sql`


### Crear base de datos

Antes de importar los scripts, crear la base de datos desde la ruta del proyecto:

```bash
createdb -U postgres municipalidad_app
```

### Archivo `schema.sql`

El archivo `municipalidad-backend/src/db/schema.sql` corresponde al esquema limpio de la base de datos. Permite crear la estructura principal, incluyendo tablas, claves primarias, claves foráneas y restricciones de integridad.

Las tablas principales definidas en el modelo relacional son:

- `usuarios`
- `solicitudes`
- `documentos`
- `observaciones`
- `agendamientos`

Para ejecutar el esquema limpio se puede utilizar el siguiente comando:

```bash
psql -U postgres -d municipalidad_app -f municipalidad-backend/src/db/schema.sql
```

### Archivo `municipalidad_db_con_datos.sql`

El archivo `database/municipalidad_db_con_datos.sql` corresponde a un respaldo/exportación de la base de datos utilizada durante el desarrollo y las pruebas funcionales.

Este archivo contiene:

- Estructura de las tablas.
- Restricciones de integridad.
- Relaciones entre entidades.
- Datos de prueba utilizados para validar el funcionamiento del sistema.

Para importar la base de datos con datos de prueba se puede utilizar el siguiente comando:

```bash
psql -U postgres -d municipalidad_app -f database/municipalidad_db_con_datos.sql
```

Para efectos de pruebas y revisión de la Entrega Parcial 2, se recomienda utilizar el archivo:

```text
database/municipalidad_db_con_datos.sql
```

Este respaldo contiene estructura completa y datos de prueba que permiten validar más fácilmente la integración entre frontend, backend y base de datos.

### Credenciales de prueba

Las siguientes credenciales corresponden a usuarios de prueba incluidos en la base de datos de desarrollo:

| Funcionario | Correo | Contraseña |
| --- | --- | --- |
| Oscar Ruiz | oscar.ruiz@santodomingo.cl | finanzas123 |
| Pablo Aguilera | pablo.aguilera@santodomingo.cl | obras123 |
| Martina Ponce | martina.ponce@santodomingo.cl | patentes123 |
| Cristian Mejías | cristian.mejias@santodomingo.cl | admin123 |
| Benjamin Gomez | benjamin.gomez@santodomingo.cl | funcionario123 |

## Instalación y ejecución

### Backend

```bash
cd municipalidad-backend
npm install
npm run dev
```

El servidor backend debería quedar disponible en:

```text
http://localhost:3000
```

La API debería quedar disponible en:

```text
http://localhost:3000/api
```

### Frontend

Desde la raíz del proyecto:

```bash
npm install
npm run dev
```

El frontend debería quedar disponible en la URL indicada por Vite, normalmente:

```text
http://localhost:5173
```

## Autenticación y seguridad

La aplicación implementa autenticación mediante JWT.

El flujo principal es:

1. El usuario se registra o inicia sesión.
2. El backend valida las credenciales.
3. La contraseña se compara utilizando bcrypt.
4. Si las credenciales son correctas, el backend genera un token JWT.
5. El frontend almacena el token y lo envía en las peticiones protegidas.
6. El backend valida el token mediante middleware.
7. Algunas rutas se restringen según el rol del usuario.

Medidas implementadas:

- Hash de contraseñas con bcrypt.
- Validación básica de campos.
- Uso de JWT para sesiones.
- Rutas protegidas.
- Diferenciación por roles.
- Consultas parametrizadas para protección básica contra inyección SQL.
- Respuestas JSON estructuradas.
- Manejo de códigos HTTP.

## Endpoints principales de la API

| Método | Endpoint | Descripción | Autenticación |
| --- | --- | --- | --- |
| `GET` | `/` | Verifica que el backend esté funcionando | No |
| `GET` | `/api/health` | Verifica que la API REST esté activa | No |
| `GET` | `/api/db-test` | Verifica conexión con PostgreSQL | No |
| `POST` | `/api/auth/register` | Registra un nuevo usuario | No |
| `POST` | `/api/auth/login` | Inicia sesión y genera JWT | No |
| `GET` | `/api/auth/me` | Obtiene información del usuario autenticado | Sí |
| `GET` | `/api/solicitudes` | Lista solicitudes según el rol del usuario | Sí |
| `POST` | `/api/solicitudes` | Crea una nueva solicitud ciudadana con documentos | Sí |
| `GET` | `/api/solicitudes/mis-solicitudes` | Lista solicitudes del usuario ciudadano autenticado | Sí |
| `GET` | `/api/solicitudes/mis-agendamientos` | Lista agendamientos del usuario autenticado | Sí |
| `GET` | `/api/solicitudes/:id` | Obtiene una solicitud por código o ID interno | Sí |
| `PATCH` | `/api/solicitudes/:id` | Actualiza estado, observación y documentos faltantes | Sí |
| `DELETE` | `/api/solicitudes/:id` | Elimina una solicitud según permisos | Sí |
| `POST` | `/api/solicitudes/:id/documentos` | Sube documentos pendientes a una solicitud | Sí |
| `POST` | `/api/solicitudes/:id/agendamientos` | Crea o actualiza un agendamiento para una solicitud | Sí |
| `GET` | `/api/solicitudes/:id/agendamientos` | Obtiene agendamientos asociados a una solicitud | Sí |

## Documentación y evidencias

La documentación complementaria de la entrega se encuentra en la carpeta `otros/`.

Archivos principales:

```text
otros/Documentacion-modelo-relacional.md
otros/Documentacion-endpoints.md
otros/EP2-POSTMAN-Pruebas/PruebasPostman.postman_collection.json
otros/EP2-POSTMAN-Pruebas/CapturasPostman/
```

## Repositorio

Repositorio público del proyecto:

```text
https://github.com/cristobal2004/municipalidad-app
```

## Estado de la entrega

Esta Entrega Parcial 2 incluye la integración entre frontend y backend, autenticación mediante JWT, conexión con base de datos relacional PostgreSQL, API REST funcional y evidencias de pruebas mediante Postman.

# Cumplimiento de requerimientos de la Entrega Parcial 2

## EP 2.1: Creación del servidor backend

El backend fue desarrollado con Node.js y Express.js, ubicado en la carpeta `municipalidad-backend`.

El servidor se organiza separando la configuración principal de Express en `src/app.js` y el levantamiento del servidor en `src/server.js`.

El backend utiliza las siguientes dependencias principales:

- express
- cors
- dotenv
- pg
- bcrypt
- jsonwebtoken
- multer

Los scripts disponibles para ejecutar el backend son:

```bash
npm run dev
npm start
```

El servidor expone endpoints base para verificar su funcionamiento:

- `GET /`
- `GET /api/health`
- `GET /api/db-test`

Además, monta rutas principales bajo:

- `/api/auth`
- `/api/solicitudes`

## EP 2.2: Configuración y modelado de base de datos relacional

El proyecto utiliza PostgreSQL como base de datos relacional. La conexión desde el backend se realiza mediante la librería `pg`, utilizando un `Pool` configurado con variables de entorno en el archivo `municipalidad-backend/src/db/connection.js`.

El modelo relacional considera las siguientes entidades principales:

- `usuarios`
- `solicitudes`
- `documentos`
- `observaciones`
- `agendamientos`

El diseño del modelo se encuentra documentado en:

```text
otros/Documentacion-modelo-relacional.md
```

Este documento incluye el diagrama entidad-relación, descripción de tablas, relaciones, claves primarias, claves foráneas, restricciones `UNIQUE`, restricciones `CHECK` y reglas de integridad referencial.

La implementación de la base de datos se encuentra en los archivos:

```text
municipalidad-backend/src/db/schema.sql
database/municipalidad_db_con_datos.sql
```

El archivo `schema.sql` corresponde al esquema limpio de la base de datos, mientras que `municipalidad_db_con_datos.sql` corresponde a una exportación con datos de prueba utilizados durante el desarrollo.

La base de datos implementa integridad referencial mediante claves foráneas y reglas como `ON DELETE CASCADE` y `ON DELETE SET NULL`, además de restricciones `CHECK` para controlar valores permitidos en campos como roles, estados de solicitudes, validación de documentos y estados de agendamientos.

## EP 2.3: Desarrollo de API REST

El backend implementa una API REST con endpoints para las principales entidades del sistema.

Se utilizan métodos HTTP como:

- `GET`
- `POST`
- `PATCH`
- `DELETE`

La API responde en formato JSON estructurado y utiliza códigos HTTP adecuados para representar resultados exitosos y errores.

Algunos códigos utilizados son:

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

La documentación detallada de endpoints se encuentra en:

```text
otros/Documentacion-endpoints.md
```

## EP 2.4: Consumo de API REST desde Ionic + React

El frontend consume la API REST utilizando Axios mediante una instancia centralizada ubicada en:

```text
src/services/api.ts
```

En este archivo se configura la URL base del backend usando la variable de entorno:

```text
VITE_API_URL=http://localhost:3000/api
```

También se implementa un interceptor de request para adjuntar automáticamente el token JWT en las peticiones protegidas:

```text
Authorization: Bearer <token>
```

Además, se implementa un interceptor de response para manejar errores `401 Unauthorized`, cerrar la sesión local y redirigir al usuario cuando el token no es válido o ha expirado.

La lógica de autenticación se consume desde:

```text
src/services/authService.ts
```

Este servicio implementa login, registro, cierre de sesión, obtención de token, rol y usuario autenticado.

El consumo de solicitudes municipales se realiza desde:

```text
src/services/solicitudesApiService.ts
```

Este servicio utiliza endpoints REST para crear, listar, obtener, actualizar y eliminar solicitudes, además de permitir el envío de documentos mediante `FormData`.

## EP 2.5: Implementación de autenticación con JWT

El sistema implementa autenticación mediante JSON Web Token.

El backend genera un JWT cuando un usuario se registra o inicia sesión correctamente. Este token incluye información básica del usuario autenticado, como su identificador, correo electrónico y rol dentro del sistema.

La generación del token se encuentra implementada en:

```text
municipalidad-backend/src/controllers/authController.js
```

El token se firma utilizando la variable de entorno:

```text
JWT_SECRET
```

Además, el token tiene un tiempo de expiración definido, lo que permite manejar sesiones temporales y reducir riesgos asociados a sesiones indefinidas.

La validación del token se realiza mediante el middleware:

```text
municipalidad-backend/src/middlewares/authMiddleware.js
```

Este middleware revisa que las peticiones protegidas incluyan el encabezado de autorización con el siguiente formato:

```text
Authorization: Bearer <token>
```

Si el token no es proporcionado, es inválido o ha expirado, el backend responde con un código HTTP `401 Unauthorized` y no permite acceder al recurso solicitado.

Las rutas protegidas del backend incluyen:

- `GET /api/auth/me`
- Todas las rutas bajo `/api/solicitudes`

En el backend, las rutas de solicitudes se protegen aplicando el middleware de autenticación a nivel de router. Esto asegura que para crear, listar, obtener, actualizar o eliminar solicitudes municipales, el usuario deba estar autenticado previamente.

El sistema también implementa diferenciación de acceso según rol. Los roles principales utilizados son:

- `usuario`
- `funcionario`

Los usuarios ciudadanos pueden:

- Crear solicitudes municipales.
- Consultar sus propias solicitudes.
- Subir documentos asociados a sus solicitudes.
- Crear agendamientos asociados a sus solicitudes.

Los funcionarios municipales pueden:

- Revisar solicitudes asignadas.
- Actualizar el estado de una solicitud.
- Registrar observaciones.
- Revisar agendamientos asociados.

En el frontend, la autenticación se gestiona desde:

```text
src/services/authService.ts
```

Este servicio permite iniciar sesión, registrar usuarios, cerrar sesión, obtener el token almacenado, obtener el rol del usuario autenticado y recuperar los datos del usuario actual.

El token JWT se almacena localmente en el navegador y luego es utilizado por la instancia centralizada de Axios definida en:

```text
src/services/api.ts
```

En este archivo se implementa un interceptor de request que adjunta automáticamente el token JWT en las peticiones protegidas mediante el encabezado:

```text
Authorization: Bearer <token>
```

También se implementa un interceptor de response para manejar errores `401 Unauthorized`. Cuando el backend responde que el token no es válido o ha expirado, el frontend cierra la sesión local y redirige al usuario.

Las rutas privadas del frontend se encuentran centralizadas en:

```text
src/routes/AppRoutes.tsx
```

La aplicación utiliza `IonReactRouter` desde:

```text
src/App.tsx
```

y define rutas privadas mediante el componente:

```text
src/components/ProtectedRoute.tsx
```

El componente `ProtectedRoute` obtiene el token y el rol desde `authService`. Si no existe token, redirige al formulario de inicio de sesión correspondiente según el tipo de ruta solicitada:

- `/login-usuario`
- `/login-funcionario`

Si el usuario autenticado intenta acceder a una ruta de otro rol, el sistema lo redirige a su panel correspondiente:

- `/usuario/inicio`
- `/funcionario/inicio`

Las rutas de usuario ciudadano se declaran utilizando:

```text
allowedRole="usuario"
```

Las rutas de funcionario municipal se declaran utilizando:

```text
allowedRole="funcionario"
```

De esta forma, el sistema protege rutas privadas tanto en frontend como en backend, valida tokens JWT, maneja sesiones de usuario y diferencia el acceso según el rol autenticado.

## EP 2.6: Validación de usuarios y manejo de sesiones

El sistema implementa validaciones básicas para el registro, inicio de sesión y operaciones principales de la plataforma.

En el registro de usuarios se validan campos obligatorios como nombre, RUT, correo y contraseña. También se valida el formato básico del correo electrónico y un largo mínimo para la contraseña.

En el inicio de sesión se valida que el usuario ingrese correo y contraseña antes de procesar la autenticación.

Las contraseñas no se almacenan en texto plano. Antes de guardar un nuevo usuario, el backend genera un hash utilizando bcrypt:

```text
bcrypt.hash(password, 10)
```

Durante el inicio de sesión, la contraseña ingresada se compara de forma segura con el hash almacenado en la base de datos mediante:

```text
bcrypt.compare(password, usuario.password_hash)
```

El backend no devuelve el hash de la contraseña en las respuestas enviadas al frontend.

El manejo de sesiones se realiza mediante JWT. Cuando el usuario inicia sesión o se registra correctamente, el backend genera un token firmado con la variable de entorno:

```text
JWT_SECRET
```

El token contiene información básica del usuario autenticado, como su identificador, correo electrónico y rol.

La validación del token se realiza mediante el middleware:

```text
municipalidad-backend/src/middlewares/authMiddleware.js
```

Este middleware verifica que las rutas protegidas incluyan el encabezado:

```text
Authorization: Bearer <token>
```

Si el token no existe, es inválido o ha expirado, el backend responde con `401 Unauthorized`.

En el frontend, el token se almacena localmente y se utiliza en las peticiones protegidas mediante la instancia centralizada de Axios definida en:

```text
src/services/api.ts
```

Esta instancia incluye un interceptor que adjunta automáticamente el token JWT a las solicitudes protegidas.

Además, el frontend maneja errores `401 Unauthorized`, cerrando la sesión local y redirigiendo al usuario cuando el token no es válido o ha expirado.

El sistema también implementa protección básica contra inyección SQL mediante el uso de consultas parametrizadas con PostgreSQL. Las consultas utilizan parámetros como `$1`, `$2`, etc., separando los datos ingresados por el usuario de la estructura de la consulta SQL.

Adicionalmente, para la subida de documentos, el backend valida el tipo y tamaño de los archivos mediante `multer`, permitiendo solo archivos PDF, JPG y PNG, con un tamaño máximo de 10 MB.

Con estas medidas, el sistema cumple con validación de inputs, hash de contraseñas, manejo seguro de credenciales, sesiones mediante JWT y protección básica contra inyección SQL.

## EP 2.7: Pruebas funcionales

Las pruebas funcionales de la API REST fueron realizadas utilizando Postman.

Se creó una colección de pruebas para validar el funcionamiento del backend, la conexión con la base de datos, la autenticación mediante JWT, las rutas protegidas, las operaciones principales sobre solicitudes municipales y las restricciones de acceso según rol.

La colección exportada desde Postman se encuentra en:

```text
otros/EP2-POSTMAN-Pruebas/PruebasPostman.postman_collection.json
```

La documentación detallada de endpoints se encuentra en:

```text
otros/Documentacion-endpoints.md
```

Las evidencias de las pruebas se encuentran en:

```text
otros/EP2-POSTMAN-Pruebas/CapturasPostman/
```

Las pruebas realizadas incluyen:

- Verificación del estado de la API mediante `GET /api/health`.
- Verificación de conexión con PostgreSQL mediante `GET /api/db-test`.
- Registro de usuario mediante `POST /api/auth/register`.
- Inicio de sesión exitoso mediante `POST /api/auth/login`.
- Validación de error en login con credenciales incorrectas.
- Validación de rechazo en ruta protegida sin token.
- Validación de acceso a ruta protegida con token JWT.
- Creación de una solicitud municipal mediante `POST /api/solicitudes`.
- Listado de solicitudes del usuario autenticado mediante `GET /api/solicitudes/mis-solicitudes`.
- Validación de permisos por rol al intentar actualizar una solicitud con un usuario no autorizado.
- Eliminación de una solicitud propia de prueba mediante `DELETE /api/solicitudes/:id`.

Los endpoints probados fueron:

| N.º | Método | Endpoint | Resultado esperado | Evidencia |
| --- | --- | --- | --- | --- |
| 01 | `GET` | `/api/health` | `200 OK` | `01-health-api.png` |
| 02 | `GET` | `/api/db-test` | `200 OK` | `02-db-test.png` |
| 03 | `POST` | `/api/auth/register` | `201 Created` | `03-registro-usuario.png` |
| 04 | `POST` | `/api/auth/login` | `200 OK` | `04-login-exitoso.png` |
| 05 | `POST` | `/api/auth/login` | `401 Unauthorized` | `05-login-error.png` |
| 06 | `GET` | `/api/auth/me` | `401 Unauthorized` | `06-ruta-protegida-sin-token.png` |
| 07 | `GET` | `/api/auth/me` | `200 OK` | `07-ruta-protegida-con-token.png` |
| 08 | `POST` | `/api/solicitudes` | `201 Created` | `08-crear-solicitud.png` |
| 09 | `GET` | `/api/solicitudes/mis-solicitudes` | `200 OK` | `09-listar-solicitudes.png` |
| 10 | `PATCH` | `/api/solicitudes/:id` | `403 Forbidden` | `10-permisos-rol.png` |
| 11 | `DELETE` | `/api/solicitudes/:id` | `200 OK` | `11-eliminar-solicitud.png` |

Los resultados obtenidos en Postman evidencian respuestas HTTP correctas, incluyendo:

- `200 OK`
- `201 Created`
- `401 Unauthorized`
- `403 Forbidden`

Además, las respuestas de la API se entregan en formato JSON estructurado, utilizando campos como:

- `ok`
- `mensaje`
- `token`
- `usuario`
- `solicitud`

La prueba de eliminación de solicitud se realizó sobre una solicitud propia creada para pruebas, utilizando el endpoint:

```text
DELETE /api/solicitudes/SOL-2026-0011
```

El resultado obtenido fue `200 OK` con la respuesta:

```text
Solicitud eliminada correctamente.
```