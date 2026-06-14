# Documentación de Endpoints — Municipalidad App

## Entrega Parcial 2: Pruebas funcionales de API REST

Este documento describe los endpoints probados manualmente mediante Postman para la aplicación **Municipalidad App**.

La colección de Postman utilizada para las pruebas debe exportarse y guardarse junto con este documento. Las capturas de evidencia deben almacenarse en la carpeta:

```text
otros/ep2/capturas/
```

---

## 1. Configuración general

### URL base

```text
http://localhost:3000/api
```

### Formato de datos

Las solicitudes que incluyen un cuerpo se envían como JSON:

```text
Content-Type: application/json
```

### Autenticación

Las rutas protegidas requieren un token JWT.

El token se obtiene mediante:

```text
POST /api/auth/login
```

En Postman se agrega desde:

```text
Authorization → Bearer Token
```

---

## 2. Resumen de endpoints probados

| N.º | Método | Endpoint | Requiere token | Descripción | Resultado esperado |
|---|---|---|---|---|---|
| 01 | `GET` | `/api/health` | No | Verifica que la API esté activa | `200 OK` |
| 02 | `GET` | `/api/db-test` | No | Verifica la conexión con PostgreSQL | `200 OK` |
| 03 | `POST` | `/api/auth/register` | No | Registra un usuario | `201 Created` |
| 04 | `POST` | `/api/auth/login` | No | Inicia sesión y entrega un JWT | `200 OK` |
| 05 | `POST` | `/api/auth/login` | No | Rechaza credenciales incorrectas | `401 Unauthorized` |
| 06 | `GET` | `/api/auth/me` | No se envía token | Comprueba el rechazo de una ruta protegida | `401 Unauthorized` |
| 07 | `GET` | `/api/auth/me` | Sí | Devuelve el perfil autenticado | `200 OK` |
| 08 | `POST` | `/api/solicitudes` | Sí | Crea una solicitud municipal | `201 Created` |
| 09 | `GET` | `/api/solicitudes/mis-solicitudes` | Sí | Lista las solicitudes del usuario autenticado | `200 OK` |
| 10 | `PATCH` | `/api/solicitudes/:id` | Sí | Verifica restricciones de permisos por rol | `403 Forbidden` |
| 11 | `DELETE` | `/api/solicitudes/:id` | Sí | Elimina una solicitud propia de prueba | `200 OK` |
| 12 | `GET` | `/api/solicitudes/:id/documentos/:documentoId/archivo` | Sí | Descarga protegida del documento | `200 OK` |
| 13 | `PATCH` | `/api/solicitudes/:id/documentos/:documentoId` | Sí, funcionario asignado | Aprueba o rechaza un documento | `200 OK` |
| 14 | `PATCH` | `/api/solicitudes/:id/derivar` | Sí, funcionario asignado | Deriva y reasigna por área | `200 OK` |
| 15 | `GET` | `/api/solicitudes/reportes/datos` | Sí, funcionario | Obtiene hasta 500 solicitudes reales | `200 OK` |
| 16 | `GET` | `/api/solicitudes/:id/disponibilidad?fecha=YYYY-MM-DD` | Sí | Consulta horas libres entre 09:00 y 17:00 | `200 OK` |
| 17 | `POST` | `/api/solicitudes/:id/agendamientos` | Sí, ciudadano propietario | Reserva o reagenda una hora disponible | `200/201` |

Los documentos no están expuestos mediante una carpeta pública. El endpoint de
descarga verifica que el ciudadano sea propietario o que el funcionario tenga
la solicitud asignada. La validación y la derivación generan eventos en
`historial_solicitudes`.

---

# 3. Detalle de endpoints

## 01. Verificar estado de la API

### Solicitud

```http
GET /api/health
```

### Autenticación

No requerida.

### Body

No requiere body.

### Resultado esperado

```text
200 OK
```

### Ejemplo de respuesta

```json
{
  "ok": true,
  "mensaje": "API REST activa",
  "servicio": "Municipalidad de Santo Domingo"
}
```

### Evidencia

```text
otros/ep2/capturas/01-health-api.png
```

---

## 02. Verificar conexión con PostgreSQL

### Solicitud

```http
GET /api/db-test
```

### Autenticación

No requerida.

### Body

No requiere body.

### Resultado esperado

```text
200 OK
```

### Descripción

Comprueba que el backend puede conectarse correctamente a la base de datos PostgreSQL.

### Evidencia

```text
otros/ep2/capturas/02-db-test.png
```

---

## 03. Registrar usuario

### Solicitud

```http
POST /api/auth/register
```

### Autenticación

No requerida.

### Body de ejemplo

> Reemplazar los datos por los valores ficticios utilizados durante la prueba si fueron diferentes.

```json
{
  "nombre": "Usuario de Prueba",
  "rut": "12345678-5",
  "correo": "usuario.prueba@example.com",
  "password": "ClaveSegura123",
  "region": "Valparaíso",
  "comuna": "Santo Domingo",
  "tipoUsuario": "vecino"
}
```

### Resultado esperado

```text
201 Created
```

### Descripción

Registra un usuario en la base de datos. La contraseña se almacena mediante hash y no como texto plano.

### Evidencia

```text
otros/ep2/capturas/03-registro-usuario.png
```

---

## 04. Iniciar sesión correctamente

### Solicitud

```http
POST /api/auth/login
```

### Autenticación

No requerida.

### Body de ejemplo

```json
{
  "correo": "usuario.prueba@example.com",
  "password": "ClaveSegura123"
}
```

### Resultado esperado

```text
200 OK
```

### Descripción

Comprueba que un usuario registrado puede iniciar sesión. La respuesta entrega un token JWT que debe utilizarse en las rutas protegidas.

### Evidencia

```text
otros/ep2/capturas/04-login-exitoso.png
```

---

## 05. Rechazar inicio de sesión incorrecto

### Solicitud

```http
POST /api/auth/login
```

### Autenticación

No requerida.

### Body de ejemplo

```json
{
  "correo": "usuario.prueba@example.com",
  "password": "clave_incorrecta"
}
```

### Resultado esperado

```text
401 Unauthorized
```

### Descripción

Comprueba que el sistema rechaza credenciales inválidas.

### Evidencia

```text
otros/ep2/capturas/05-login-error.png
```

---

## 06. Rechazar acceso a ruta protegida sin token

### Solicitud

```http
GET /api/auth/me
```

### Autenticación

No se envía token.

### Body

No requiere body.

### Resultado esperado

```text
401 Unauthorized
```

### Descripción

Comprueba que una ruta protegida no puede utilizarse sin autenticación.

### Evidencia

```text
otros/ep2/capturas/06-ruta-protegida-sin-token.png
```

---

## 07. Consultar perfil autenticado

### Solicitud

```http
GET /api/auth/me
```

### Autenticación

Requerida:

```text
Authorization → Bearer Token
```

Usar el JWT obtenido en la prueba `04-login-exitoso`.

### Body

No requiere body.

### Resultado esperado

```text
200 OK
```

### Descripción

Devuelve los datos del usuario asociado al token JWT.

### Evidencia

```text
otros/ep2/capturas/07-ruta-protegida-con-token.png
```

---

## 08. Crear solicitud municipal

### Solicitud

```http
POST /api/solicitudes
```

### Autenticación

Requerida:

```text
Authorization → Bearer Token
```

### Body de ejemplo

> Reemplazar los valores por los datos ficticios utilizados realmente en Postman si fueron diferentes.

```json
{
  "tipoTramite": "Patente comercial",
  "razonSocial": "Almacén de Prueba",
  "rut": "76543210-1",
  "direccion": "Avenida Principal 123",
  "tipoPatente": "Comercial",
  "rolAvaluo": "123-45",
  "pyme": true,
  "correoContacto": "usuario.prueba@example.com",
  "telefonoContacto": "+56912345678",
  "giro": "Venta de alimentos",
  "superficie": "45",
  "observacionesSolicitante": "Solicitud creada desde Postman"
}
```

### Resultado esperado

```text
201 Created
```

### Descripción

Crea una nueva solicitud municipal asociada al usuario autenticado.

### Evidencia

```text
otros/ep2/capturas/08-crear-solicitud.png
```

---

## 09. Listar solicitudes propias

### Solicitud

```http
GET /api/solicitudes/mis-solicitudes
```

### Autenticación

Requerida:

```text
Authorization → Bearer Token
```

### Body

No requiere body.

### Resultado esperado

```text
200 OK
```

### Descripción

Devuelve las solicitudes creadas por el usuario autenticado. Esta prueba permite obtener el identificador de una solicitud para las pruebas `PATCH` y `DELETE`.

### Evidencia

```text
otros/ep2/capturas/09-listar-solicitudes.png
```

---

## 10. Verificar permisos por rol

### Solicitud

```http
PATCH /api/solicitudes/:id
```

### Ejemplo de URL

```text
http://localhost:3000/api/solicitudes/ID_DE_LA_SOLICITUD
```

Reemplazar:

```text
ID_DE_LA_SOLICITUD
```

por el identificador obtenido en la prueba `09-listar-solicitudes`.

### Autenticación

Requerida:

```text
Authorization → Bearer Token
```

En esta prueba se utiliza el token de un usuario normal.

### Body de ejemplo

```json
{
  "estado": "en_revision",
  "observaciones": "Intento de actualización realizado desde Postman"
}
```

### Resultado esperado

```text
403 Forbidden
```

### Descripción

Comprueba que un usuario normal no puede ejecutar una acción restringida a funcionarios autorizados.

### Evidencia

```text
otros/ep2/capturas/10-permisos-rol.png
```

---

## 11. Eliminar solicitud propia

### Solicitud

```http
DELETE /api/solicitudes/:id
```

### Ejemplo de URL

```text
http://localhost:3000/api/solicitudes/ID_DE_LA_SOLICITUD
```

Reemplazar:

```text
ID_DE_LA_SOLICITUD
```

por el identificador de una solicitud creada específicamente para pruebas.

### Autenticación

Requerida:

```text
Authorization → Bearer Token
```

Usar el token del usuario propietario de la solicitud.

### Body

No requiere body.

### Resultado esperado

```text
200 OK
```

### Descripción

Elimina una solicitud perteneciente al usuario autenticado. Se recomienda utilizar una solicitud creada únicamente para esta prueba.

### Evidencia

```text
otros/ep2/capturas/11-eliminar-solicitud.png
```

---

# 4. Evidencias y colección de Postman

La colección exportada desde Postman debe guardarse en:

```text
otros/ep2/Municipalidad-App-EP2.postman_collection.json
```

Las capturas deben guardarse en:

```text
otros/ep2/capturas/
```

Estructura recomendada:

```text
otros/
└── ep2/
    ├── documentacion-endpoints.md
    ├── Municipalidad-App-EP2.postman_collection.json
    └── capturas/
        ├── 01-health-api.png
        ├── 02-db-test.png
        ├── 03-registro-usuario.png
        ├── 04-login-exitoso.png
        ├── 05-login-error.png
        ├── 06-ruta-protegida-sin-token.png
        ├── 07-ruta-protegida-con-token.png
        ├── 08-crear-solicitud.png
        ├── 09-listar-solicitudes.png
        ├── 10-permisos-rol.png
        └── 11-eliminar-solicitud.png
```

---

# 5. Consideraciones de seguridad

Antes de subir los archivos al repositorio:

- No incluir contraseñas reales.
- No incluir tokens JWT completos en capturas públicas.
- No incluir credenciales de PostgreSQL.
- Utilizar exclusivamente datos ficticios.
- Ocultar parcialmente los tokens visibles en las capturas.

Ejemplo de token oculto:

```text
eyJhbGciOiJIUzI1NiIs... [oculto]
```
