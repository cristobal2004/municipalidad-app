# Municipalidad App - Entrega Parcial 2

## Integrantes

* Cristóbal Rubilar
* Oscar Ruiz
* Cristian Mejías

## Descripción del proyecto

Municipalidad App es una aplicación web desarrollada con Ionic + React orientada a optimizar la gestión y seguimiento de solicitudes ciudadanas dentro de la Municipalidad de Santo Domingo.

La plataforma permite centralizar trámites municipales, mejorar la comunicación entre ciudadanos y funcionarios, y entregar mayor transparencia durante el proceso de atención y resolución de solicitudes.

## Objetivo de la Entrega Parcial 2

El objetivo de esta entrega es integrar el frontend desarrollado en Ionic + React con un backend funcional, incorporando autenticación, conexión a base de datos relacional y consumo de una API REST.

En esta entrega se incluye:

* Backend desarrollado con Node.js y Express.
* Base de datos relacional en PostgreSQL.
* API REST con endpoints para autenticación, usuarios, solicitudes, documentos, observaciones y agendamientos.
* Autenticación mediante JWT.
* Hash de contraseñas con bcrypt.
* Rutas protegidas en frontend y backend.
* Diferenciación de acceso por roles: ciudadano y funcionario/administrador.
* Consumo de API desde Ionic + React usando Axios.
* Manejo de errores e interceptores para tokens JWT.
* Evidencias de pruebas realizadas en Postman.

## Roles del sistema

### Usuario ciudadano

El usuario ciudadano puede utilizar la plataforma para:

* Registrarse e iniciar sesión.
* Crear solicitudes relacionadas con trámites municipales.
* Adjuntar documentos de respaldo.
* Consultar el estado de sus solicitudes.
* Revisar observaciones o actualizaciones.
* Agendar atención municipal.

### Funcionario municipal / administrador

El funcionario municipal o administrador puede:

* Iniciar sesión con rol autorizado.
* Revisar solicitudes ingresadas por ciudadanos.
* Actualizar estados de atención.
* Registrar observaciones internas.
* Revisar documentación adjunta.
* Gestionar información asociada a solicitudes municipales.

## Tecnologías utilizadas

### Frontend

* Ionic
* React
* TypeScript
* React Router
* Axios
* Capacitor

### Backend

* Node.js
* Express.js
* JWT
* bcrypt
* dotenv
* cors
* pg

### Base de datos

* PostgreSQL

### Herramientas de desarrollo y pruebas

* Git
* GitHub
* Postman
* Visual Studio Code

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
│   │   ├── middlewares/         # Middlewares de autenticación y roles
│   │   └── routes/              # Rutas REST
│   └── package.json
│
├── database/                    # Respaldo de base de datos
├── otros/                       # Documentación, evidencias y pruebas
├── README.md
└── package.json
```

## Requisitos previos

Antes de ejecutar el proyecto se debe tener instalado:

* Node.js
* npm
* Ionic CLI
* PostgreSQL
* Git
* Postman o Insomnia para pruebas de API

## Clonar el repositorio

```bash
git clone https://github.com/cristobal2004/municipalidad-app.git
cd municipalidad-app
```

## Configuración de variables de entorno

### Frontend

Crear un archivo `.env` en la raíz del proyecto frontend con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend

Crear un archivo `.env` dentro de la carpeta `municipalidad-backend` con el siguiente contenido:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=municipalidad_app
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=municipalidad_app

```
----

## Base de datos

El proyecto utiliza PostgreSQL como base de datos relacional para almacenar la información asociada a usuarios, solicitudes municipales, documentos, observaciones y agendamientos.

Durante el desarrollo se trabajó con dos archivos SQL principales:

```text
municipalidad-backend/src/db/schema.sql
database/municipalidad_db_con_datos.sql
```

### Archivo `schema.sql`

El archivo:

```text
municipalidad-backend/src/db/schema.sql
```

corresponde al esquema de la base de datos. Este archivo permite crear la estructura principal de la base de datos, incluyendo tablas, claves primarias, claves foráneas y restricciones de integridad.

Las tablas principales definidas en el modelo relacional son:

- `usuarios`
- `solicitudes`
- `documentos`
- `observaciones`
- `agendamientos`

Este archivo se utiliza como referencia para levantar una base de datos limpia, sin datos de prueba.

Para ejecutar el esquema limpio se puede utilizar el siguiente comando:

```bash
psql -U postgres -d municipalidad_app -f municipalidad-backend/src/db/schema.sql
```

### Archivo `municipalidad_db_con_datos.sql`

El archivo:

```text
database/municipalidad_db_con_datos.sql
```

corresponde a un respaldo/exportación de la base de datos utilizada durante el desarrollo y las pruebas funcionales.

Este archivo contiene:

- Estructura de las tablas.
- Restricciones de integridad.
- Relaciones entre entidades.
- Datos de prueba utilizados para validar el funcionamiento del sistema.

Para importar la base de datos con datos de prueba se puede utilizar el siguiente comando:

```bash
psql -U postgres -d municipalidad_app -f database/municipalidad_db_con_datos.sql
```

### Modelo relacional

El modelo relacional considera las siguientes relaciones principales:

- Un usuario puede crear muchas solicitudes municipales.
- Una solicitud pertenece a un usuario.
- Una solicitud puede tener documentos asociados.
- Una solicitud puede tener observaciones.
- Una solicitud puede tener agendamientos.
- Los roles de usuario permiten diferenciar los permisos entre ciudadanos y funcionarios/administradores.

### Consideraciones

El archivo `schema.sql` representa la estructura limpia de la base de datos, mientras que `municipalidad_db_con_datos.sql` representa una versión exportada de la base de datos con datos utilizados durante el desarrollo.

Para efectos de pruebas y revisión de la Entrega Parcial 2, se recomienda utilizar el archivo:

```text
database/municipalidad_db_con_datos.sql
```

ya que contiene la estructura completa junto con datos de prueba que permiten validar más fácilmente la integración entre frontend, backend y base de datos.


## Instalación y ejecución del backend

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

## Instalación y ejecución del frontend

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

* Hash de contraseñas con bcrypt.
* Validación básica de campos.
* Uso de JWT para sesiones.
* Rutas protegidas.
* Diferenciación por roles.
* Consultas parametrizadas para protección básica contra inyección SQL.
* Respuestas JSON estructuradas.
* Manejo de códigos HTTP.

## Endpoints principales de la API

| Método | Endpoint               | Descripción                                 | Autenticación |
| ------ | ---------------------- | ------------------------------------------- | ------------- |
| GET    | `/api/health`          | Verifica que el backend esté funcionando    | No            |
| GET    | `/api/db-test`         | Verifica conexión con la base de datos      | No            |
| POST   | `/api/auth/register`   | Registra un nuevo usuario                   | No            |
| POST   | `/api/auth/login`      | Inicia sesión y genera JWT                  | No            |
| GET    | `/api/auth/me`         | Obtiene información del usuario autenticado | Sí            |
| GET    | `/api/solicitudes`     | Lista solicitudes                           | Sí            |
| GET    | `/api/solicitudes/:id` | Obtiene una solicitud específica            | Sí            |
| POST   | `/api/solicitudes`     | Crea una nueva solicitud                    | Sí            |
| PATCH  | `/api/solicitudes/:id` | Actualiza una solicitud                     | Sí            |
| DELETE | `/api/solicitudes/:id` | Elimina una solicitud                       | Sí            |
| GET    | `/api/documentos`      | Lista documentos asociados                  | Sí            |
| POST   | `/api/documentos`      | Registra documentos asociados a solicitudes | Sí            |
| GET    | `/api/observaciones`   | Lista observaciones                         | Sí            |
| POST   | `/api/observaciones`   | Crea observaciones para solicitudes         | Sí            |
| GET    | `/api/agendamientos`   | Lista agendamientos                         | Sí            |
| POST   | `/api/agendamientos`   | Crea un agendamiento                        | Sí            |

## Modelo relacional

La base de datos utiliza PostgreSQL y considera entidades principales como:

* `usuarios`
* `solicitudes`
* `documentos`
* `observaciones`
* `agendamientos`

Relaciones principales:

* Un usuario puede crear muchas solicitudes.
* Una solicitud pertenece a un usuario.
* Una solicitud puede tener documentos asociados.
* Una solicitud puede tener observaciones.
* Una solicitud puede tener agendamientos.
* Los roles permiten diferenciar permisos entre ciudadanos y funcionarios/administradores.

El script o respaldo de la base de datos se encuentra en la carpeta:

```text
database/
```

## Pruebas funcionales

Las pruebas funcionales fueron realizadas utilizando Postman.

Se incluyen evidencias de:

* Verificación del backend.
* Verificación de conexión con base de datos.
* Registro de usuario.
* Inicio de sesión.
* Manejo de error en login.
* Acceso a ruta protegida sin token.
* Acceso a ruta protegida con token.
* Creación de solicitudes.
* Listado de solicitudes.
* Validación de permisos según rol.

Las evidencias se encuentran en:

```text
otros/EP2-Postman-Pruebas/
```

## Repositorio

Repositorio público del proyecto:

```text
https://github.com/cristobal2004/municipalidad-app
```

## Estado de la entrega

Esta Entrega Parcial 2 incluye la integración entre frontend y backend, autenticación mediante JWT, conexión con base de datos relacional PostgreSQL, API REST funcional y evidencias de pruebas mediante Postman.

## Cumplimiento de requerimientos de la Entrega Parcial 2

### EP 2.1: Creación del servidor backend

El backend fue desarrollado utilizando Node.js con Express.js.

El servidor se encuentra ubicado en:

```text
municipalidad-backend/
```

La estructura del backend separa responsabilidades mediante rutas, controladores, middlewares y configuración de base de datos.

Elementos principales:

```text
municipalidad-backend/src/routes/
municipalidad-backend/src/controllers/
municipalidad-backend/src/middlewares/
municipalidad-backend/src/db/
```

El servidor expone una API REST disponible localmente en:

```text
http://localhost:3000/api
```

---

### EP 2.2: Configuración y modelado de base de datos relacional

El proyecto utiliza PostgreSQL como base de datos relacional.

La base de datos considera tablas para:

- usuarios
- solicitudes
- documentos
- observaciones
- agendamientos

El modelo contempla relaciones entre usuarios y solicitudes, solicitudes y documentos, solicitudes y observaciones, y solicitudes y agendamientos.

Los archivos SQL principales son:

```text
municipalidad-backend/src/db/schema.sql
database/municipalidad_db_con_datos.sql
```

El archivo `schema.sql` corresponde al esquema limpio de la base de datos, mientras que `municipalidad_db_con_datos.sql` corresponde a una exportación con datos de prueba utilizados durante el desarrollo.

---

### EP 2.3: Desarrollo de API REST

El backend implementa una API REST con endpoints para las principales entidades del sistema.

Se utilizan métodos HTTP como:

- GET
- POST
- PATCH
- DELETE

La API responde en formato JSON estructurado y utiliza códigos HTTP adecuados para representar resultados exitosos y errores.

Algunos códigos utilizados son:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

---

### EP 2.4: Consumo de API REST desde Ionic + React

El frontend consume la API REST utilizando Axios.

La configuración principal de conexión se encuentra en:

```text
src/services/api.ts
```

En este archivo se define la URL base del backend mediante variable de entorno:

```env
VITE_API_URL=http://localhost:3000/api
```

También se implementa un interceptor para adjuntar automáticamente el token JWT en las peticiones protegidas mediante el encabezado:

```text
Authorization: Bearer <token>
```

Además, se maneja el error 401 para cerrar sesión o redirigir al usuario cuando el token no es válido o ha expirado.

---

### EP 2.5: Implementación de autenticación con JWT

El sistema implementa autenticación mediante JSON Web Token.

El flujo de autenticación considera:

- Formulario de registro.
- Formulario de inicio de sesión.
- Generación de JWT desde el backend.
- Almacenamiento del token en el frontend.
- Validación del token mediante middleware.
- Protección de rutas privadas.
- Diferenciación de acceso según rol.

Los roles utilizados por el sistema permiten diferenciar entre usuarios ciudadanos y funcionarios/administradores.

La lógica principal de autenticación se encuentra en:

```text
municipalidad-backend/src/controllers/authController.js
municipalidad-backend/src/middlewares/authMiddleware.js
src/services/authService.ts
src/routes/
```

---

### EP 2.6: Validación de usuarios y manejo de sesiones

El sistema implementa medidas básicas de validación y seguridad para el manejo de usuarios y sesiones.

Entre las medidas implementadas se encuentran:

- Validación de campos requeridos.
- Validación de formato de correo electrónico.
- Hash de contraseñas mediante bcrypt.
- Comparación segura de contraseñas en el inicio de sesión.
- Manejo de sesiones mediante JWT.
- Protección de rutas privadas.
- Uso de consultas parametrizadas para reducir el riesgo de inyección SQL.
- Manejo de errores con respuestas JSON.

El backend no almacena contraseñas en texto plano, sino que guarda el hash generado mediante bcrypt.
