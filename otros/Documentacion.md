# Documentacion Tecnica - Entrega Parcial 1

En esta sección se describirán los puntos más importantes que sustentan el proyecto en la Entrega Parcial 1, cuyo objetivo es definir el diseño de la aplicación y construir la estructura del frontend utilizando Ionic + React.


# 🔵 EP 1.1 Requerimientos funcionales y no funcionales
## 🟢 Descripción general
- Esta sección define los requerimientos funcionales y no funcionales del sistema de gestión de solicitudes ciudadanas para una municipalidad.
- Los requerimientos funcionales describen las principales acciones que podrán realizar los usuarios dentro de la plataforma.
- Los requerimientos no funcionales establecen condiciones de calidad relacionadas con seguridad, rendimiento, escalabilidad, trazabilidad y usabilidad.

## 🟢 Roles considerados
### 🟠 Usuario ciudadano
- Persona que ingresa solicitudes a la municipalidad, consulta su estado, adjunta documentos, recibe notificaciones y solicita atención con el área o funcionario responsable.
### 🟠 Funcionario municipal
- Persona encargada de revisar, validar, observar, derivar, actualizar y gestionar las solicitudes ingresadas por los ciudadanos.

## 🟢 Requerimientos funcionales
### 🟠 RF-01: Ingreso de solicitudes ciudadanas
- El sistema debe permitir que los usuarios ciudadanos ingresen solicitudes a la municipalidad mediante un formulario digital.
- El formulario debe considerar datos personales, tipo de solicitud, descripción del caso, área relacionada y antecedentes necesarios para su tramitación.

### 🟠 RF-02: Consulta del estado de una solicitud
- El sistema debe permitir que el usuario ciudadano consulte el estado actual de sus solicitudes.
- Los estados posibles pueden incluir: ingresada, en revisión, observada, derivada, aprobada, rechazada o cerrada.

### 🟠 RF-03: Visualización del área y funcionario responsable
- El sistema debe permitir que el usuario ciudadano visualice el área municipal encargada de su solicitud.
- Cuando corresponda, también debe mostrar el funcionario responsable de la gestión, favoreciendo la transparencia del proceso.

### 🟠 RF-04: Carga y revisión de documentos adjuntos
- El sistema debe permitir que los usuarios adjunten documentos relacionados con sus solicitudes.
- Los funcionarios municipales deben poder revisar, validar u observar dichos documentos según los requisitos del trámite correspondiente.

### 🟠 RF-05: Notificaciones de actualización de solicitudes
- El sistema debe enviar notificaciones al usuario ciudadano cuando exista una actualización relevante en su solicitud.
- Las notificaciones pueden corresponder a cambios de estado, aprobación, rechazo, cierre del caso o solicitud de nuevos antecedentes.
- Estas notificaciones deben estar disponibles mediante la aplicación web y correo electrónico.

### 🟠 RF-06: Registro de observaciones, rechazos o retrasos
- El sistema debe permitir que los funcionarios municipales indiquen claramente el motivo de una observación, rechazo o retraso.
- La explicación debe ser comprensible para el usuario ciudadano.

### 🟠 RF-07: Gestión interna de solicitudes
- El sistema debe permitir que los funcionarios municipales visualicen, filtren, asignen, actualicen y gestionen solicitudes.
- La gestión debe poder realizarse según criterios como área municipal, estado, prioridad, fecha de ingreso o tipo de trámite.

### 🟠 RF-08: Agenda de atención o comunicación con funcionario
- El sistema debe permitir que el usuario ciudadano solicite o agende una instancia de atención con el funcionario o área responsable.
- Esta funcionalidad aplica cuando el ciudadano requiera mayor detalle sobre su solicitud, rechazo u observación.

### 🟠 RF-09: Generación de reportes de gestión municipal
- El sistema debe generar reportes para apoyar la gestión municipal.
- Los reportes deben considerar información como cantidad de solicitudes recibidas, solicitudes pendientes, tiempos de respuesta, motivos frecuentes de rechazo y áreas con mayor carga de trabajo.

## 🟢 Requerimientos no funcionales
### 🟠 RNF-01: Seguridad de la información
- El sistema debe proteger los datos personales y documentos cargados por los usuarios.
- Debe evitar accesos no autorizados, filtraciones, pérdidas de información o modificaciones indebidas.

### 🟠 RNF-02: Control de acceso por roles
- El sistema debe contar con mecanismos de autenticación segura y control de permisos según el rol del usuario.
- Cada persona debe acceder únicamente a la información y funcionalidades que le corresponden.

### 🟠 RNF-03: Rendimiento del sistema
- El sistema debe responder en tiempos razonables al consultar solicitudes, cargar documentos, filtrar información o actualizar estados.
- El rendimiento debe mantenerse incluso cuando existan múltiples usuarios conectados simultáneamente.

### 🟠 RNF-04: Escalabilidad
- El sistema debe soportar un aumento progresivo en la cantidad de usuarios, solicitudes, documentos y consultas.
- Este crecimiento no debe afectar gravemente su funcionamiento ni comprometer la integridad de la información.

### 🟠 RNF-05: Integridad y consistencia de los datos
- El sistema debe evitar pérdida de información, duplicidad de registros o conflictos en las solicitudes.
- Los datos almacenados deben mantenerse completos, actualizados y coherentes.

### 🟠 RNF-06: Trazabilidad de acciones
- El sistema debe mantener un registro claro de las acciones realizadas sobre cada solicitud.
- Debe ser posible conocer quién realizó un cambio, cuándo lo hizo y qué información fue modificada.

### 🟠 RNF-07: Usabilidad y accesibilidad
- La plataforma debe ser fácil de usar para ciudadanos y funcionarios municipales.
- La interfaz debe ser clara, ordenada y comprensible.
- Debe considerar criterios de accesibilidad como textos legibles, buen contraste visual, navegación sencilla y diseño adaptable a distintos dispositivos.


# 🔵 EP 1.2 Justificación del problema y análisis del usuario objetivo
## 🟢 Descripción general
- Esta sección explica el problema que la aplicación busca resolver y define los principales usuarios objetivo del sistema.
- La propuesta se enfoca en mejorar la gestión, seguimiento, centralización y transparencia de las solicitudes ciudadanas realizadas ante la municipalidad.

## 🟢 Justificación del problema
### 🟠 Problema principal
- La municipalidad presenta dificultades en la gestión, seguimiento y centralización de solicitudes ciudadanas.
- Actualmente, la información puede ingresar por distintos canales, como atención presencial, formularios digitales, correos electrónicos u otros medios internos.
- Esta fragmentación provoca que los datos de cada solicitud no siempre estén consolidados en un único sistema, dificultando su control, actualización y seguimiento oportuno.

### 🟠 Falta de visibilidad para el ciudadano
- Uno de los principales problemas es la ausencia de un método claro, rápido y accesible para consultar el estado de una solicitud.
- El ciudadano puede no saber si su trámite fue recibido, está en revisión, fue derivado, requiere nuevos documentos, fue rechazado o presenta retrasos.
- Esta falta de información genera incertidumbre, aumenta las consultas presenciales o telefónicas y disminuye la percepción de transparencia municipal.

### 🟠 Comunicación insuficiente de rechazos u observaciones
- Los motivos de rechazo, postergación o solicitud de antecedentes adicionales no siempre son comunicados de forma clara y oportuna.
- Esto puede impedir que el ciudadano comprenda por qué su solicitud no avanza, qué información debe corregir o cuáles son los siguientes pasos.
- A nivel interno, esta situación aumenta la carga administrativa de los funcionarios, quienes deben recopilar, revisar y actualizar información proveniente de distintas fuentes.

### 🟠 Descentralización de la información municipal
- La falta de una estructura común para registrar solicitudes dificulta la coordinación entre departamentos.
- También afecta la asignación de responsables, la trazabilidad de cambios y la generación de reportes de gestión.
- Esta situación limita la capacidad de identificar cuellos de botella, tiempos de respuesta, áreas con mayor carga de trabajo y motivos frecuentes de rechazo o demora.

## 🟢 Solución propuesta
### 🟠 Centralización de solicitudes ciudadanas
- La aplicación propone una solución digital para centralizar la información de las solicitudes ciudadanas.
- El sistema permitirá registrar solicitudes mediante formularios específicos según el tipo de trámite.
- Cada solicitud podrá ser organizada, asignada al área correspondiente, actualizada por funcionarios responsables y consultada por el usuario desde una plataforma clara y accesible.

### 🟠 Valor para la municipalidad
- Permite mejorar la organización interna.
- Reduce el trabajo manual asociado a la gestión de solicitudes.
- Facilita la gestión de datos y la coordinación entre áreas.
- Entrega información útil para la toma de decisiones mediante reportes de gestión.

### 🟠 Valor para los ciudadanos
- Permite acceder a mayor transparencia durante el proceso.
- Facilita la consulta del estado de solicitudes.
- Entrega notificaciones relevantes sobre cambios o actualizaciones.
- Ayuda a comprender los motivos asociados a rechazos, observaciones o retrasos.


## 🟢 Análisis del usuario objetivo
### 🟠 Descripción general de usuarios
- La aplicación está dirigida principalmente a dos tipos de usuarios: ciudadanos y funcionarios municipales.
- Ambos perfiles poseen objetivos y necesidades distintas, por lo que la plataforma debe considerar una experiencia diferenciada según el rol.

## 🟢 Usuario ciudadano
### 🟠 Perfil del usuario
- Corresponde a cualquier persona que necesite realizar un trámite, consulta o solicitud ante la municipalidad.
- Puede incluir usuarios con distintos niveles de experiencia digital, por lo que la plataforma debe ser simple, clara y fácil de utilizar.
- El ciudadano debe poder acceder desde un computador o dispositivo móvil.

### 🟠 Necesidades principales
- Ingresar solicitudes de forma sencilla.
- Adjuntar documentos cuando sea necesario.
- Consultar el estado de sus trámites.
- Confirmar si su solicitud fue recibida correctamente.
- Identificar el área o funcionario responsable.
- Recibir avisos cuando exista una actualización.
- Comprender los motivos de rechazo, demora u observación.

### 🟠 Enfoque de experiencia
- El sistema debe priorizar una experiencia transparente, accesible y centrada en el usuario.
- La interfaz para ciudadanos debe ser clara, directa y fácil de navegar.

## 🟢 Usuario funcionario o administrador municipal
### 🟠 Perfil del usuario

- Corresponde a funcionarios municipales o administradores del sistema encargados de revisar, asignar, actualizar y gestionar solicitudes.
- Este perfil requiere una vista más completa y administrativa para trabajar con grandes volúmenes de información.

### 🟠 Necesidades principales
- Organizar solicitudes de manera eficiente.
- Filtrar solicitudes por estado, prioridad, área o tipo de trámite.
- Revisar documentos adjuntos.
- Registrar observaciones, resoluciones o motivos de rechazo.
- Reducir el trabajo manual.
- Evitar duplicidad de información.
- Mejorar la trazabilidad de cada caso.
- Facilitar la coordinación entre departamentos.

### 🟠 Reportes y análisis de gestión
- Los funcionarios requieren reportes que permitan analizar la gestión municipal.
- Estos reportes deben considerar cantidad de solicitudes recibidas, tiempos de respuesta, motivos de rechazo y áreas con mayor carga de trabajo.

### 🟠 Enfoque de experiencia
- La plataforma debe ofrecer herramientas administrativas ordenadas, seguras y eficientes.
- A diferencia del ciudadano, el funcionario necesita funcionalidades orientadas a control, seguimiento, análisis y gestión interna.


# 🔵 EP 1.3 Bocetos de UI/UX y prototipo en Figma
## 🟢 Descripción general

- En esta etapa se diseñó el prototipo visual de la plataforma municipal en Figma.
- El diseño representa el flujo principal para ciudadanos y funcionarios municipales.
- Se trabajo la version web manteniendo coherencia visual, navegación clara y formularios centrados en el usuario.

## 🟢 Enlace al prototipo
### 🟠 Figma
- Link del prototipo: https://www.figma.com/design/GJqfNMIMlvvIzsJgPM5LM4/Mockups?node-id=26-127&p=f&t=hJLMUM1pBWRJ4lue-0

## 🟢 Pantallas principales
### 🟠 Acceso y registro
- Inicio de sesión.
- Registro de usuario con nombre de usuario, RUT, correo electrónico, región, comuna, contraseña, confirmación de contraseña y aceptación de términos.
- Validaciones visuales para campos obligatorios, errores de formato y coincidencia de contraseñas.

### 🟠 Flujo del ciudadano
- Panel principal del ciudadano.
- Ingreso de solicitud municipal.
- Consulta del estado de una solicitud.
- Visualización de observaciones, rechazos o actualizaciones.
- Agenda de atención con funcionario o área responsable.

### 🟠 Flujo del funcionario municipal
- Panel de gestión interna de solicitudes.
- Revisión de documentos adjuntos.
- Actualización de estado de solicitudes.
- Registro de observaciones, rechazos o retrasos.
- Visualización de reportes de gestión municipal.

## 🟢 Diseño responsive
### 🟠 Versión web

- Distribución orientada a paneles, tablas, filtros y gestión de información.
- Navegación mediante menú lateral o superior.
- Mayor densidad de datos para facilitar el trabajo administrativo.


# 🔵 EP 1.4 Definición de Arquitectura de Navegación y Experiencia del Usuario
## 🟢 Descripción general
- La aplicación define una arquitectura de navegación diferenciada según el rol del usuario.
- Desde una página pública, el sistema permite acceder al flujo del ciudadano y al flujo del funcionario municipal.
- La estructura considera rutas públicas, rutas protegidas, jerarquía de vistas y navegación coherente entre dispositivos.

## 🟢 Arquitectura de navegación general

### 🟠 Flujo público
- Página principal municipal.
- Acceso al inicio de sesión de ciudadanos.
- Acceso al registro de nuevos usuarios.
- Acceso al inicio de sesión de funcionarios municipales.

### 🟠 Flujo del usuario ciudadano
- El ciudadano accede a funcionalidades orientadas al ingreso, seguimiento y consulta de solicitudes municipales.
- Su navegación está diseñada para ser simple, guiada y directa.
- Incluye acceso a solicitudes, notificaciones, estado de trámites, documentos y agendamiento con funcionarios.

### 🟠 Flujo del funcionario municipal
- El funcionario accede a funcionalidades administrativas para gestionar solicitudes ciudadanas.
- Su navegación considera mayor cantidad de información, filtros, tablas y acciones internas.
- Incluye revisión de solicitudes, actualización de estados, gestión de documentos y reportes municipales.

## 🟢 Rutas principales y secundarias
### 🟠 Rutas públicas

| Ruta | Vista asociada | Rol |
|---|---|---|
| `/` | Página principal municipal | Público |
| `/login-usuario` | Inicio de sesión ciudadano | Usuario ciudadano |
| `/registro` | Crear cuenta usuario | Usuario ciudadano |
| `/login-funcionario` | Inicio de sesión funcionario | Funcionario municipal |

### 🟠 Rutas protegidas del usuario ciudadano
| Ruta | Vista asociada |
|---|---|
| `/usuario/inicio` | Página principal usuario |
| `/usuario/notificaciones` | Notificaciones del usuario |
| `/usuario/seleccionar-tramite` | Seleccionar trámite |
| `/usuario/nueva-solicitud/patente` | Solicitar patente |
| `/usuario/confirmacion` | Confirmación de solicitud |
| `/usuario/mis-tramites` | Trámites realizados |
| `/usuario/solicitud/:id` | Ver detalle de solicitud |
| `/usuario/agendar/:id` | Agendamiento con funcionario |

### 🟠 Rutas protegidas del funcionario municipal
| Ruta | Vista asociada |
|---|---|
| `/funcionario/inicio` | Página principal funcionario |
| `/funcionario/solicitudes` | Lista de solicitudes |
| `/funcionario/solicitud/:id` | Ver detalle de solicitud |
| `/funcionario/reportes` | Reportes de gestión municipal |

## 🟢 Jerarquía de vistas
### 🟠 Usuario ciudadano
- Inicio usuario.
- Notificaciones.
- Selección de trámite.
- Nueva solicitud.
- Confirmación de solicitud.
- Mis trámites.
- Detalle de solicitud.
- Agendamiento con funcionario.

### 🟠 Funcionario municipal
- Inicio funcionario.
- Lista de solicitudes.
- Detalle de solicitud.
- Revisión y actualización de estado.
- Reportes municipales.

## 🟢 Diferenciación de acceso según roles
### 🟠 Usuario ciudadano
- Puede ingresar solicitudes municipales.
- Puede adjuntar documentos.
- Puede revisar el estado de sus trámites.
- Puede visualizar observaciones y notificaciones.
- Puede agendar atención con un funcionario responsable.

### 🟠 Funcionario municipal
- Puede revisar solicitudes asignadas.
- Puede filtrar y organizar información.
- Puede actualizar estados de solicitudes.
- Puede registrar observaciones, rechazos o retrasos.
- Puede revisar documentos adjuntos.
- Puede consultar reportes de gestión municipal.

## 🟢 Flujo de navegación entre funcionalidades
### 🟠 Flujo principal del ciudadano

- El ciudadano inicia sesión o crea una cuenta.
- Accede a su panel principal.
- Selecciona un trámite disponible.
- Completa una nueva solicitud.
- Adjunta antecedentes si corresponde.
- Recibe confirmación del ingreso.
- Consulta el estado desde “Mis trámites”.
- Revisa observaciones, notificaciones o agenda atención si es necesario.

### 🟠 Flujo principal del funcionario

- El funcionario inicia sesión.
- Accede a su panel principal.
- Revisa la lista de solicitudes.
- Filtra solicitudes por estado, área, prioridad o fecha.
- Ingresa al detalle de una solicitud.
- Revisa documentos y antecedentes.
- Actualiza el estado o registra observaciones.
- Consulta reportes de gestión municipal.


## 🟢 Justificación técnica
### 🟠 Decisiones de arquitectura
- La separación de rutas públicas y protegidas permite controlar el acceso según el rol del usuario.
- La división entre flujo ciudadano y flujo funcionario mejora la claridad estructural de la aplicación.
- El uso de rutas específicas por funcionalidad facilita la escalabilidad del frontend.
- La arquitectura permite agregar nuevos trámites, vistas administrativas o reportes sin modificar el flujo principal.
- La navegación diferenciada mejora la usabilidad, reduce confusión y optimiza la interacción según las necesidades de cada perfil.