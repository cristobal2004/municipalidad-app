# Checklist de Entrega Final

Fecha de auditoría: 13 de junio de 2026.

## Matriz de cumplimiento

| Requisito | Estado | Evidencia principal |
| --- | --- | --- |
| RF-01 Ingreso | Implementado | Formularios de patente, circulación y obras; API y PostgreSQL |
| RF-02 Seguimiento | Implementado | Estados ingresada, revisión, observada, derivada, aprobada, rechazada y cerrada |
| RF-03 Responsable | Implementado | Área y funcionario asignado visibles para el ciudadano |
| RF-04 Documentos | Implementado | Carga, descarga protegida y aprobación/rechazo individual |
| RF-05 Notificaciones | Implementado | Avisos web y SMTP comprobable mediante Mailpit |
| RF-06 Motivos | Implementado | Observaciones visibles e historial de rechazos y retrasos |
| RF-07 Gestión interna | Implementado | Filtros por estado, prioridad, área, trámite y fecha; derivación |
| RF-08 Agenda | Implementado | Horas 09:00-17:00, reagendamiento y bloqueo de colisiones |
| RF-09 Reportes | Implementado | Volumen, pendientes, tiempos, áreas y motivos de rechazo |
| RNF-01 Seguridad | Implementado | Documentos privados, JWT, bcrypt, Helmet, XSS y límites |
| RNF-02 Roles | Implementado | Rutas y controladores separados para ciudadano/funcionario |
| RNF-03 Rendimiento | Implementado | Paginación, índices, pool, caché y carga diferida |
| RNF-04 Escalabilidad | Implementado | Arquitectura por features, servicios desacoplados y Docker |
| RNF-05 Integridad | Implementado | FK, restricciones, secuencia y citas activas únicas |
| RNF-06 Trazabilidad | Implementado | `historial_solicitudes` con actor, fecha y cambios JSONB |
| RNF-07 Usabilidad | Implementado en código | Ionic responsive y escenarios en tres viewports |
| EP2 API/autenticación | Implementado | REST, JWT, Axios, validación, Postman y modelo relacional |
| EF1 | Implementado | CRUD, notificaciones y almacenamiento local |
| EF2 | Implementado en código | UI responsive, lazy loading y bundles separados |
| EF3 | Implementado | SQL parametrizado, XSS, CORS, bcrypt, JWT y archivos privados |
| EF4 | Implementado | Consultas explícitas, paginación e índices |
| EF5 | Implementado | Nager.Date con timeout y caché |
| EF6 | Implementado | Dockerfiles, Compose, PostgreSQL, Nginx, Mailpit y healthchecks |

## Validaciones de esta revisión

- `npm ci` correcto en frontend y backend.
- `npm run lint` sin errores.
- 10 pruebas unitarias de frontend aprobadas.
- 35 pruebas automáticas de backend aprobadas.
- `npm run build` genera correctamente la versión de producción.
- Auditoría npm de dependencias de producción sin vulnerabilidades conocidas.
- `git diff --check` sin errores de espacios o conflictos.
- `docker compose --env-file .env.example config --quiet` correcto.
- Frontend, backend, PostgreSQL y Mailpit levantados correctamente con Docker.
- El escenario Cypress de integración real registró un ciudadano, creó y
  consultó una solicitud, comprobó su historial y confirmó la entrega SMTP.
- La CI usa Node 22 y repetirá lint, pruebas, build y el recorrido Docker.

## Gestión GitHub

- El repositorio es público.
- Se incluyen plantillas de Issues, Pull Request y workflow de CI.
- La entrega debe publicarse en una rama y revisarse mediante Pull Request.
- GitHub Issues, Discussions y Projects deben quedar visibles en el repositorio
  para cumplir literalmente la pauta de gestión.

## Evidencia externa pendiente

1. Confirmar visualmente que el enlace público de Figma conserva al menos siete
   pantallas diferenciadas en versión web y móvil.
2. Adjuntar o conservar evidencia del CI verde y del despliegue Docker.
3. Solicitar revisión de al menos otro integrante antes de fusionar a `main`.
4. Habilitar Discussions y asociar el trabajo a un GitHub Project público.

## Criterio de cierre

La implementación cubre los requisitos técnicos del proyecto. La entrega queda
cerrada cuando el Pull Request esté publicado, la CI finalice en verde y las
evidencias externas de Figma, Issues, Discussions, Project y revisión de equipo
sean visibles.
