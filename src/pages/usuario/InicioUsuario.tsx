import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  alertCircleOutline,
  arrowForwardOutline,
  businessOutline,
  calendarOutline,
  carOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  folderOpenOutline,
  logOutOutline,
  mailUnreadOutline,
  notificationsOutline,
  personCircleOutline,
  storefrontOutline,
  timeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./InicioUsuario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rut?: string;
}

const InicioUsuario: React.FC = () => {
  const history = useHistory();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "",
  });

  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("usuario_actual") ||
      localStorage.getItem("usuarioActual") ||
      localStorage.getItem("current_user");

    let usuario: UsuarioActual = {
      nombre: "Usuario",
      correo: "",
    };

    if (usuarioGuardado) {
      try {
        usuario = JSON.parse(usuarioGuardado);
      } catch (error) {
        usuario = {
          nombre: "Usuario",
          correo: "",
        };
      }
    }

    setUsuarioActual(usuario);

    const correo = usuario.correo || "";

    if (correo) {
      setSolicitudes(solicitudesService.obtenerSolicitudesPorUsuario(correo));
    } else {
      setSolicitudes(solicitudesService.obtenerSolicitudes());
    }
  }, []);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const solicitudesActivas = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "En Proceso" ||
      solicitud.estado === "Falta Documentación"
  );

  const pendientesDocumentos = solicitudes.filter(
    (solicitud) => solicitud.estado === "Falta Documentación"
  );

  const solicitudesAprobadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Aprobado"
  );

  const avisosNuevos = pendientesDocumentos.length + solicitudesActivas.length;

  const ultimaSolicitud = useMemo(() => {
    if (solicitudes.length === 0) return undefined;
    return solicitudes[solicitudes.length - 1];
  }, [solicitudes]);

  const obtenerClaseEstado = (estado: string) => {
    if (estado === "Aprobado") return "estado-mini estado-aprobado";
    if (estado === "Falta Documentación") return "estado-mini estado-falta";
    return "estado-mini estado-proceso";
  };

  const obtenerTextoEstado = (estado: string) => {
    if (estado === "Aprobado") return "Aprobada";
    if (estado === "Falta Documentación") return "Documentos pendientes";
    return "En revisión";
  };

  const obtenerEtapaActual = (estado: string) => {
    if (estado === "Aprobado") return 4;
    if (estado === "Falta Documentación") return 3;
    return 2;
  };

  const renderSeguimiento = (estado: string) => {
    const etapa = obtenerEtapaActual(estado);

    const pasos = [
      {
        numero: 1,
        titulo: "Ingresada",
        fecha: ultimaSolicitud?.fechaRecibo || "Pendiente",
      },
      {
        numero: 2,
        titulo: "En revisión",
        fecha:
          etapa >= 2
            ? ultimaSolicitud?.fechaRecibo || "Pendiente"
            : "Pendiente",
      },
      {
        numero: 3,
        titulo: "Documentos pendientes",
        fecha: etapa >= 3 ? "Actual" : "Pendiente",
      },
      {
        numero: 4,
        titulo: "Finalizada",
        fecha: etapa >= 4 ? "Completada" : "Pendiente",
      },
    ];

    return (
      <div className="timeline-horizontal">
        {pasos.map((paso, index) => (
          <div
            key={paso.numero}
            className={`timeline-step ${
              etapa >= paso.numero ? "step-active" : ""
            }`}
          >
            <div className="step-circle">
              {etapa > paso.numero ? (
                <IonIcon icon={checkmarkCircleOutline} />
              ) : (
                paso.numero
              )}
            </div>

            {index < pasos.length - 1 && (
              <div
                className={`step-line ${
                  etapa > paso.numero ? "line-active" : ""
                }`}
              />
            )}

            <p>{paso.titulo}</p>
            <span>{paso.fecha}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="inicio-usuario-content">
        <div className="inicio-usuario-wrapper">
          <header className="inicio-header">
            <div className="inicio-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <h1>Municipalidad de Santo Domingo</h1>
            </div>

            <div className="inicio-user-area">
              <button
                className="notification-top-button"
                onClick={() => history.push("/usuario/notificaciones")}
                title="Notificaciones pendientes"
              >
                <IonIcon icon={notificationsOutline} />
                {avisosNuevos > 0 && <span>{avisosNuevos}</span>}
              </button>

              <div className="user-chip">
                <IonIcon icon={personCircleOutline} />
                <div>
                  <strong>
                    Bienvenido, {usuarioActual.nombre || "Usuario"}
                  </strong>
                  <small>Usuario ciudadano</small>
                </div>
              </div>

              <button className="logout-button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="inicio-main">
            <section className="inicio-hero">
              <div className="inicio-hero-overlay">
                <span className="hero-badge">Oficina Virtual Municipal</span>

                <h2>Bienvenido a tu oficina virtual</h2>

                <p>
                  Gestiona, revisa y da seguimiento a tus trámites municipales
                  de forma rápida y segura.
                </p>

                <div className="hero-actions">
                  <button
                    onClick={() =>
                      history.push("/usuario/seleccionar-tramite")
                    }
                  >
                    <IonIcon icon={documentTextOutline} />
                    Realizar trámite
                  </button>

                  <button onClick={() => history.push("/usuario/mis-tramites")}>
                    <IonIcon icon={folderOpenOutline} />
                    Mis trámites
                  </button>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-icon blue">
                  <IonIcon icon={documentTextOutline} />
                </div>

                <div>
                  <span>Trámites activos</span>
                  <strong>{solicitudesActivas.length}</strong>
                  <p>En proceso actualmente</p>
                </div>

                <button onClick={() => history.push("/usuario/mis-tramites")}>
                  Ver detalles <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="stat-card">
                <div className="stat-icon orange">
                  <IonIcon icon={folderOpenOutline} />
                </div>

                <div>
                  <span>Pendientes de documentos</span>
                  <strong>{pendientesDocumentos.length}</strong>
                  <p>Requieren tu atención</p>
                </div>

                <button onClick={() => history.push("/usuario/mis-tramites")}>
                  Ver detalles <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="stat-card">
                <div className="stat-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>

                <div>
                  <span>Aprobados</span>
                  <strong>{solicitudesAprobadas.length}</strong>
                  <p>Últimos 12 meses</p>
                </div>

                <button onClick={() => history.push("/usuario/mis-tramites")}>
                  Ver historial <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="stat-card">
                <div className="stat-icon purple">
                  <IonIcon icon={mailUnreadOutline} />
                </div>

                <div>
                  <span>Avisos nuevos</span>
                  <strong>{avisosNuevos}</strong>
                  <p>No leídos</p>
                </div>

                <button
                  onClick={() => history.push("/usuario/notificaciones")}
                >
                  Ver avisos <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>
            </section>

            <section className="inicio-content-grid">
              <div className="inicio-left-column">
                <section className="panel-card seguimiento-card">
                  <div className="panel-title-row">
                    <h3>Seguimiento rápido</h3>

                    <button
                      onClick={() => history.push("/usuario/mis-tramites")}
                    >
                      Ver todos mis trámites{" "}
                      <IonIcon icon={arrowForwardOutline} />
                    </button>
                  </div>

                  {ultimaSolicitud ? (
                    <div className="seguimiento-box">
                      <div className="seguimiento-header">
                        <div className="seguimiento-icon">
                          <IonIcon icon={storefrontOutline} />
                        </div>

                        <div>
                          <h4>{ultimaSolicitud.id}</h4>
                          <p>{ultimaSolicitud.tipoPatente}</p>
                          <span>
                            Última actualización:{" "}
                            {ultimaSolicitud.fechaRecibo}
                          </span>
                        </div>

                        <span
                          className={obtenerClaseEstado(
                            ultimaSolicitud.estado
                          )}
                        >
                          {obtenerTextoEstado(ultimaSolicitud.estado)}
                        </span>

                        <button
                          className="detalle-button"
                          onClick={() =>
                            history.push(
                              `/usuario/solicitud/${ultimaSolicitud.id}`
                            )
                          }
                        >
                          Ver detalle <IonIcon icon={arrowForwardOutline} />
                        </button>
                      </div>

                      {renderSeguimiento(ultimaSolicitud.estado)}

                      <div className="info-alert">
                        <IonIcon icon={alertCircleOutline} />
                        <span>
                          {ultimaSolicitud.observacion ||
                            "Tu solicitud se encuentra registrada y será revisada por el equipo municipal correspondiente."}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <IonIcon icon={documentTextOutline} />
                      <h4>Aún no tienes solicitudes registradas</h4>
                      <p>
                        Cuando ingreses tu primer trámite podrás visualizar aquí
                        su seguimiento.
                      </p>
                      <button
                        onClick={() =>
                          history.push("/usuario/seleccionar-tramite")
                        }
                      >
                        Crear primera solicitud
                      </button>
                    </div>
                  )}
                </section>

                <section className="panel-card accesos-card">
                  <h3>Accesos frecuentes</h3>

                  <div className="quick-actions-grid">
                    <button
                      onClick={() => history.push("/usuario/solicitar-patente")}
                    >
                      <IonIcon icon={storefrontOutline} />
                      <strong>Patente comercial</strong>
                      <span>Solicita, renueva o consulta tu patente.</span>
                      <p>
                        Ir al trámite <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>

                    <button type="button">
                      <IonIcon icon={carOutline} />
                      <strong>Permiso de circulación</strong>
                      <span>Solicita o renueva tu permiso.</span>
                      <p>
                        Ir al trámite <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>

                    <button type="button">
                      <IonIcon icon={businessOutline} />
                      <strong>Obras municipales</strong>
                      <span>Consulta y solicitudes de obras.</span>
                      <p>
                        Ir al trámite <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => history.push("/usuario/mis-tramites")}
                    >
                      <IonIcon icon={timeOutline} />
                      <strong>Ver historial</strong>
                      <span>Revisa el historial completo.</span>
                      <p>
                        Ver historial <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>
                  </div>
                </section>

                <section className="panel-card notificaciones-recientes">
                  <div className="panel-title-row">
                    <h3>Notificaciones recientes</h3>

                    <button
                      onClick={() => history.push("/usuario/notificaciones")}
                    >
                      Ver todas <IonIcon icon={arrowForwardOutline} />
                    </button>
                  </div>

                  <div className="notification-list">
                    <div className="notification-row">
                      <span className="notification-dot blue"></span>
                      <IonIcon icon={documentTextOutline} />
                      <strong>Actualización de trámite</strong>
                      <p>
                        Tu trámite {ultimaSolicitud?.id || "SOL-2026-0001"}{" "}
                        cambió de estado.
                      </p>
                      <small>{ultimaSolicitud?.fechaRecibo || "Hoy"}</small>
                    </div>

                    <div className="notification-row">
                      <span className="notification-dot orange"></span>
                      <IonIcon icon={folderOpenOutline} />
                      <strong>Documentos requeridos</strong>
                      <p>Se podrían solicitar antecedentes adicionales.</p>
                      <small>Revisión municipal</small>
                    </div>

                    <div className="notification-row">
                      <span className="notification-dot green"></span>
                      <IonIcon icon={checkmarkCircleOutline} />
                      <strong>Trámite registrado</strong>
                      <p>Tu solicitud fue registrada correctamente.</p>
                      <small>Proceso iniciado</small>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="inicio-right-column">
                <section className="side-card">
                  <h3>
                    <IonIcon icon={timeOutline} />
                    Última actualización
                  </h3>

                  <strong>
                    {ultimaSolicitud?.fechaRecibo || "Sin registros"}
                  </strong>

                  <p>
                    {ultimaSolicitud
                      ? `${ultimaSolicitud.tipoPatente} (${ultimaSolicitud.id})`
                      : "No existen solicitudes registradas."}
                  </p>

                  <span>
                    Estado actual:{" "}
                    {ultimaSolicitud
                      ? obtenerTextoEstado(ultimaSolicitud.estado)
                      : "Sin estado"}
                  </span>

                  <button
                    onClick={() => history.push("/usuario/mis-tramites")}
                  >
                    Ver todo el historial{" "}
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </section>

                <section className="side-card">
                  <h3>
                    <IonIcon icon={calendarOutline} />
                    Próximas acciones
                  </h3>

                  <button className="action-row" type="button">
                    <div className="action-icon orange">
                      <IonIcon icon={folderOpenOutline} />
                    </div>

                    <div>
                      <strong>Subir documentos</strong>
                      <span>
                        {pendientesDocumentos.length} trámites requieren
                        documentos
                      </span>
                    </div>

                    <IonIcon icon={arrowForwardOutline} />
                  </button>

                  <button className="action-row" type="button">
                    <div className="action-icon blue">
                      <IonIcon icon={calendarOutline} />
                    </div>

                    <div>
                      <strong>Citas programadas</strong>
                      <span>1 cita próxima esta semana</span>
                    </div>

                    <IonIcon icon={arrowForwardOutline} />
                  </button>

                  <button
                    className="action-row"
                    type="button"
                    onClick={() => history.push("/usuario/notificaciones")}
                  >
                    <div className="action-icon purple">
                      <IonIcon icon={mailUnreadOutline} />
                    </div>

                    <div>
                      <strong>Revisar avisos</strong>
                      <span>{avisosNuevos} avisos sin leer</span>
                    </div>

                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </section>

                <section className="side-card reminder-card">
                  <h3>
                    <IonIcon icon={notificationsOutline} />
                    Recordatorios
                  </h3>

                  <p>
                    Mantente atento a las actualizaciones de tus trámites.
                    Recibirás avisos cuando el municipio solicite documentos o
                    actualice el estado.
                  </p>
                </section>
              </aside>
            </section>
          </main>

          <footer className="inicio-footer">
            <div className="footer-column footer-brand">
              <div>
                <img
                  src="/assets/Estandar-Muni.png"
                  alt="Municipalidad de Santo Domingo"
                />
                <h4>Municipalidad de Santo Domingo</h4>
              </div>

              <p>Comprometidos con nuestra comuna y sus habitantes.</p>
            </div>

            <div className="footer-column">
              <h4>Contacto</h4>
              <p>San Antonio 452, Santo Domingo</p>
              <p>+56 9 1234 5678</p>
              <p>contacto@munisantodomingo.cl</p>
            </div>

            <div className="footer-column">
              <h4>Enlaces rápidos</h4>
              <button type="button">Preguntas frecuentes</button>
              <button type="button">Guía de trámites</button>
              <button type="button">Transparencia municipal</button>
              <button type="button">Atención ciudadana</button>
            </div>

            <div className="footer-column">
              <h4>Síguenos</h4>

              <div className="social-row">
                <span>f</span>
                <span>ig</span>
                <span>x</span>
                <span>yt</span>
              </div>
            </div>

            <div className="footer-bottom">
              © 2026 I. Municipalidad de Santo Domingo. Todos los derechos
              reservados.
            </div>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicioUsuario;