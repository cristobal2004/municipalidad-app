# Auditoría Final - 13 de junio de 2026

## Alcance

Revisión cruzada de:

- `ProyectoFinal.pdf`, pauta oficial de Ingeniería Web y Móvil;
- `otros/ProyectoWebN9.pdf`, requerimientos RF-01 a RF-09 y RNF-01 a RNF-07;
- implementación frontend, backend, PostgreSQL, Docker y CI;
- estructura del repositorio guía CoffeeEcommerce.

## Resultado técnico

La solución implementa Ionic con React y TypeScript, API REST en Express,
PostgreSQL relacional, autenticación JWT por roles y despliegue con Docker
Compose. El código está organizado por `core` y `features`, con capas
`presentation`, `domain`, `data` y `composition` cuando corresponde.

Las brechas funcionales encontradas durante la auditoría fueron corregidas:

- documentos dejaron de publicarse como archivos estáticos;
- descarga y validación ahora exigen autorización;
- se agregó historial persistente con actor, fecha y detalle del cambio;
- se incorporó derivación real y reasignación por carga;
- se añadieron los estados derivada y cerrada;
- reportes dejaron de usar datos o rangos de fecha ficticios;
- se agregaron filtros de área, trámite y fecha;
- se incluyeron motivos frecuentes de rechazo;
- Docker incluye Mailpit para demostrar entregas SMTP;
- se eliminaron notificaciones y confirmaciones demostrativas silenciosas;
- CI usa Node 22 y prueba la aplicación completa con contenedores.

La revisión final aprobó lint, build de producción, 10 pruebas frontend, 35
pruebas backend y un escenario Cypress contra PostgreSQL y Mailpit reales. La
auditoría npm no detectó vulnerabilidades en dependencias de producción.

## Riesgos residuales

No son defectos de implementación, pero requieren evidencia externa:

- comparación visual final con Figma;
- CI verde del commit publicado;
- revisión del Pull Request por otro integrante;
- uso visible de Issues, Discussions y GitHub Projects.

La integración con ClaveÚnica no se implementó porque el equipo decidió
excluirla de este alcance.

## Conclusión

El código cubre RF-01 a RF-09, RNF-01 a RNF-07 y EF1 a EF6. La calificación
máxima también depende de que la gestión y evidencia en GitHub/Figma queden
públicas y revisables antes de la entrega.
