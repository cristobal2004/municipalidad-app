# Checklist de Entrega Final

Fecha de auditoria: 13 de junio de 2026.

## Matriz de cumplimiento

| Requisito | Estado local | Evidencia |
| --- | --- | --- |
| EF1 CRUD | Cumple | Solicitudes con POST, GET, PATCH y DELETE |
| EF1 notificaciones | Cumple | Avisos por rol y correos SMTP para solicitudes, estados y citas |
| EF1 almacenamiento local | Cumple | Sesion, preferencias y lectura de avisos |
| EF2 UI/UX | Cumple en codigo | Ionic responsive y pruebas Cypress en 3 viewports |
| EF2 rendimiento | Cumple | Lazy routes, ES2020 y chunks de proveedores |
| EF3 seguridad | Cumple | JWT, bcrypt, Helmet, CORS, rate limit, XSS y validacion |
| EF4 consultas | Cumple | Pool, paginacion, columnas explicitas e indices |
| EF5 servicio externo | Cumple | Nager.Date con validacion, timeout y cache |
| EF6 Docker | Cumple en configuracion | Frontend, API, PostgreSQL, Nginx y healthchecks |
| Pruebas | Cumple | 10 frontend, 31 backend y 7 escenarios E2E |
| RF-05 correo | Cumple en codigo | Nodemailer, plantillas y SMTP configurable |
| Agenda | Cumple | Bloques 09:00-17:00 y bloqueo por funcionario |
| Tramites | Cumple | Patentes, circulacion y obras con formularios y asignacion por area |
| Documentacion | Cumple | README, arquitectura, endpoints, modelo y Postman |

## Validaciones ejecutadas

- `npm run lint`: correcto, sin advertencias.
- `npm run test.unit`: 10 de 10 pruebas.
- `npm run build`: correcto, sin alertas del empaquetador.
- `municipalidad-backend/npm test`: 31 de 31 pruebas.
- `npm run test.e2e:docker`: 7 de 7 escenarios Cypress.
- Verificacion de sintaxis Node en repositorios y controladores.

Docker fue validado con frontend, API y PostgreSQL activos. El recorrido visual
manual final debe compararse con el prototipo Figma antes de publicar.

## Brechas antes de optar a cumplimiento total

1. El servicio de correo ya esta implementado, pero para demostrar entrega
   real se deben ingresar credenciales SMTP en `.env` y activar
   `EMAIL_ENABLED=true`.
2. Los cambios finales permanecen locales y todavia deben publicarse mediante
   rama, Pull Request revisado y CI verde.
3. GitHub Discussions no esta habilitado y no existe evidencia publica de un
   GitHub Project asociado.
4. Deben adjuntarse capturas finales de Docker, Cypress y los tres viewports.

## Organizacion de referencia

Frontend y backend utilizan la misma idea del proyecto CoffeeEcommerce:

```text
core/
features/
  feature/
    composition/
    data/
    domain/
    presentation/
```

`core` contiene infraestructura compartida. Cada feature contiene sus tipos,
reglas, adaptadores y entrada HTTP o visual. Esto reduce dependencias cruzadas y
permite probar reglas sin levantar toda la aplicacion.

## Acciones externas antes de entregar

Estas tareas no pueden completarse solo modificando archivos locales:

1. Subir la version final al repositorio publico.
2. Crear Issues a partir de `.github/ISSUE_TEMPLATE/`.
3. Asociar los Issues a un GitHub Project con columnas Pendiente, En curso y
   Terminado.
4. Abrir una Discussion de retrospectiva y decisiones tecnicas.
5. Trabajar mediante Pull Request y conservar la revision del equipo.
6. Confirmar que el enlace de Figma sea publico y coincida con las pantallas.
7. Adjuntar capturas finales de Docker, Cypress y los tres viewports.

## Criterio de cierre

La entrega esta lista cuando CI termina en verde, Docker reporta los tres
servicios saludables, Cypress pasa completo y las acciones externas anteriores
quedan visibles en GitHub.
