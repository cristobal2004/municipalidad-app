import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  alertCircleOutline,
  arrowForwardOutline,
  barChartOutline,
  calendarOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  documentTextOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from "ionicons/icons";

import api from "../../../../core/data/http/apiClient";
import { useLatestCallback } from "../../../../core/presentation/hooks/useLatestCallback";
import { authService } from "../../../auth/composition/authService";
import "./InicioFuncionario.css";

interface UsuarioActual {
  id?: number | string;
  nombre?: string;
  correo?: string;
  rol?: string;
  cargo?: string;
  area?: string;
  numeroEmpleado?: string;
}

const InicioFuncionario: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
    cargo: "Funcionario municipal",
    area: "Área municipal",
    numeroEmpleado: "No informado",
  });

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [mensajeSistema, setMensajeSistema] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  const obtenerValor = (objeto: any, campo: string, respaldo: any = ""): any => {
    const valor = objeto?.[campo];

    if (valor === undefined || valor === null || valor === "") {
      return respaldo;
    }

    return valor;
  };

  const normalizarTexto = (texto: string) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha || fecha === "Sin fecha") return "Sin fecha";

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getTime())) {
      return fecha;
    }

    return fechaDate.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const obtenerUsuarioFuncionarioActual = (): UsuarioActual | null => {
    const usuario = authService.getUsuarioActual() as any;

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre || "Funcionario",
      correo: usuario.correo || usuario.email || "",
      rol: usuario.rol || usuario.role || "funcionario",
      cargo:
        usuario.cargo ||
        usuario.puesto ||
        usuario.descripcionCargo ||
        "Funcionario municipal",
      area:
        usuario.area ||
        usuario.departamento ||
        usuario.unidad ||
        "Área municipal",
      numeroEmpleado:
        usuario.numeroEmpleado ||
        usuario.numero_empleado ||
        usuario.nEmpleado ||
        usuario.codigoEmpleado ||
        "No informado",
    };
  };

  const obtenerIniciales = (nombre: string) => {
    const partes = nombre.trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "FN";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  const obtenerId = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "codigo") ||
      obtenerValor(solicitud, "solicitudId") ||
      obtenerValor(solicitud, "id") ||
      "SIN-ID"
    );
  };

  const obtenerEstado = (solicitud: any) => {
    return obtenerValor(solicitud, "estado", "En revisión");
  };

  const obtenerObservacion = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "comentarioFuncionario") ||
      obtenerValor(solicitud, "observacionFuncionario") ||
      obtenerValor(solicitud, "observacionesSolicitante") ||
      obtenerValor(solicitud, "observacion") ||
      obtenerValor(solicitud, "observaciones") ||
      "Sin observaciones recientes"
    );
  };

  const obtenerFechaActualizacion = (solicitud: any) => {
    return formatearFecha(
      obtenerValor(solicitud, "ultimaActualizacion") ||
        obtenerValor(solicitud, "fechaActualizacion") ||
        obtenerValor(solicitud, "fechaIngreso") ||
        obtenerValor(solicitud, "fecha") ||
        "Sin fecha"
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (
      texto.includes("aprob") ||
      texto.includes("resuelt") ||
      texto.includes("cerrad")
    ) {
      return "resuelta";
    }
    if (texto.includes("rechaz")) return "resuelta";

    if (
      texto.includes("pendiente") ||
      texto.includes("document") ||
      texto.includes("falta")
    ) {
      return "pendiente";
    }

    return "revision";
  };

  const actualizarContadorNotificaciones = (usuario: UsuarioActual) => {
    const raw = localStorage.getItem("notificaciones_funcionario");

    if (!raw) {
      setNotificacionesNoLeidas(0);
      return;
    }

    try {
      const data = JSON.parse(raw);

      if (!Array.isArray(data)) {
        setNotificacionesNoLeidas(0);
        return;
      }

      const nombreFuncionario = normalizarTexto(usuario.nombre || "Funcionario");

      const totalNoLeidas = data.filter((notificacion: any) => {
        return (
          normalizarTexto(notificacion.funcionario || "") ===
            nombreFuncionario && notificacion.leida === false
        );
      }).length;

      setNotificacionesNoLeidas(totalNoLeidas);
    } catch {
      setNotificacionesNoLeidas(0);
    }
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = obtenerUsuarioFuncionarioActual();

      if (!usuario || usuario.rol !== "funcionario") {
        history.push("/login-funcionario");
        return;
      }

      setUsuarioActual(usuario);
      actualizarContadorNotificaciones(usuario);

      const respuesta = await api.get("/solicitudes");
      const solicitudesBackend = respuesta.data?.solicitudes || [];

      setSolicitudes(Array.isArray(solicitudesBackend) ? solicitudesBackend : []);
    } catch (error: any) {
      console.error("Error al cargar inicio funcionario:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron cargar las solicitudes asignadas.";

      setMensajeError(mensajeBackend);
      setSolicitudes([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosEstable = useLatestCallback(cargarDatos);

  useEffect(() => {
    void cargarDatosEstable();

    const escucharCambios = () => {
      void cargarDatosEstable();
    };

    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);
    window.addEventListener(
      "notificacionesFuncionarioActualizadas",
      escucharCambios
    );

    return () => {
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
      window.removeEventListener(
        "notificacionesFuncionarioActualizadas",
        escucharCambios
      );
    };
  }, [cargarDatosEstable]);

  const solicitudesAsignadas = useMemo(() => {
    return solicitudes;
  }, [solicitudes]);

  const totalAsignadas = solicitudesAsignadas.length;

  const totalRevision = solicitudesAsignadas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "revision"
  ).length;

  const totalPendientes = solicitudesAsignadas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "pendiente"
  ).length;

  const totalResueltas = solicitudesAsignadas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "resuelta"
  ).length;

  const actividadReciente = solicitudesAsignadas.slice(0, 3);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const irSolicitudes = () => {
    history.push("/funcionario/solicitudes");
  };

  const irAgenda = () => {
    history.push("/funcionario/agenda");
  };

  const irReportes = () => {
    history.push("/funcionario/reportes");
  };

  const actualizarDatos = () => {
    setMensajeSistema(
      "La edición de datos del funcionario quedará conectada en una siguiente iteración."
    );

    setTimeout(() => {
      setMensajeSistema("");
    }, 3500);
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="inicio-funcionario-content">
        <div className="inicio-funcionario-wrapper">
          <header className="inicio-funcionario-header">
            <div className="inicio-funcionario-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="inicio-funcionario-user-area">
              <button className="panel-funcionario-button" type="button">
                <IonIcon icon={shieldCheckmarkOutline} />
                Panel funcionario
              </button>

              <button
                type="button"
                className="inicio-notification-button"
                onClick={() => history.push("/funcionario/notificaciones")}
                title="Notificaciones funcionario"
              >
                <IonIcon icon={notificationsOutline} />
                {notificacionesNoLeidas > 0 && (
                  <span>{notificacionesNoLeidas}</span>
                )}
              </button>

              <div className="inicio-funcionario-profile-mini">
                <div className="inicio-avatar">
                  {obtenerIniciales(usuarioActual.nombre || "Funcionario")}
                </div>

                <div>
                  <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                  <small>{usuarioActual.cargo || "Funcionario municipal"}</small>
                </div>
              </div>

              <button className="inicio-logout-button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="inicio-funcionario-main">
            <section className="inicio-hero-grid">
              <article className="inicio-hero-banner">
                <span>Oficina virtual municipal</span>

                <h2>Bienvenido/a, {usuarioActual.nombre || "Funcionario"}</h2>

                <p>
                  Gestiona tus solicitudes asignadas, revisa tu agenda y mantén
                  actualizado el seguimiento de los trámites ciudadanos desde un
                  solo panel.
                </p>

                <div className="inicio-hero-actions">
                  <button onClick={irSolicitudes}>
                    Ver solicitudes
                    <IonIcon icon={arrowForwardOutline} />
                  </button>

                  <button onClick={irAgenda}>
                    Ver agenda
                    <IonIcon icon={calendarOutline} />
                  </button>

                  <button onClick={irReportes}>
                    Ver reportes
                    <IonIcon icon={barChartOutline} />
                  </button>
                </div>
              </article>

              <aside className="inicio-profile-card">
                <div className="inicio-profile-title">
                  <div className="inicio-avatar large">
                    {obtenerIniciales(usuarioActual.nombre || "Funcionario")}
                  </div>

                  <div>
                    <h3>Perfil funcionario</h3>
                    <p>Datos de sesión actual</p>
                  </div>
                </div>

                <div className="inicio-profile-data">
                  <div>
                    <span>Nombre</span>
                    <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                  </div>

                  <div>
                    <span>Cargo</span>
                    <strong>
                      {usuarioActual.cargo || "Funcionario municipal"}
                    </strong>
                  </div>

                  <div>
                    <span>Área</span>
                    <strong>{usuarioActual.area || "Área municipal"}</strong>
                  </div>

                  <div>
                    <span>N° empleado</span>
                    <strong>
                      {usuarioActual.numeroEmpleado || "No informado"}
                    </strong>
                  </div>
                </div>

                <div className="inicio-profile-notice">
                  Solo visualizarás y gestionarás solicitudes asignadas a tu
                  usuario.
                </div>
              </aside>
            </section>

            {mensajeSistema && (
              <section className="inicio-system-message">
                <IonIcon icon={alertCircleOutline} />
                <span>{mensajeSistema}</span>
              </section>
            )}

            {mensajeError && (
              <section className="inicio-system-message">
                <IonIcon icon={alertCircleOutline} />
                <span>{mensajeError}</span>
              </section>
            )}

            <section className="inicio-kpi-grid">
              <article>
                <div className="inicio-kpi-icon">
                  <IonIcon icon={clipboardOutline} />
                </div>
                <div>
                  <span>Asignadas a mí</span>
                  <strong>{cargando ? "..." : totalAsignadas}</strong>
                  <p>Total activas</p>
                </div>
              </article>

              <article>
                <div className="inicio-kpi-icon orange">
                  <IonIcon icon={timeOutline} />
                </div>
                <div>
                  <span>En revisión</span>
                  <strong>{cargando ? "..." : totalRevision}</strong>
                  <p>En proceso</p>
                </div>
              </article>

              <article>
                <div className="inicio-kpi-icon purple">
                  <IonIcon icon={alertCircleOutline} />
                </div>
                <div>
                  <span>Pendientes</span>
                  <strong>{cargando ? "..." : totalPendientes}</strong>
                  <p>Requieren acción</p>
                </div>
              </article>

              <article>
                <div className="inicio-kpi-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <div>
                  <span>Resueltas</span>
                  <strong>{cargando ? "..." : totalResueltas}</strong>
                  <p>Completadas</p>
                </div>
              </article>
            </section>

            <section className="inicio-access-grid">
              <article className="primary-access" onClick={irSolicitudes}>
                <div>
                  <IonIcon icon={clipboardOutline} />
                </div>

                <h3>Solicitudes asignadas</h3>
                <p>
                  Revisa y gestiona los trámites asociados directamente a tu
                  usuario.
                </p>

                <button type="button">
                  Ingresar
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article onClick={irAgenda}>
                <div>
                  <IonIcon icon={calendarOutline} />
                </div>

                <h3>Mi agenda</h3>
                <p>
                  Revisa las citas agendadas por los ciudadanos para las
                  solicitudes asignadas a tu cuenta.
                </p>

                <button type="button">
                  Ingresar
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article onClick={irReportes}>
                <div>
                  <IonIcon icon={barChartOutline} />
                </div>

                <h3>Reporte de solicitudes</h3>
                <p>
                  Consulta indicadores, métricas y desempeño operativo municipal.
                </p>

                <button type="button">
                  Ingresar
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article onClick={actualizarDatos}>
                <div>
                  <IonIcon icon={personCircleOutline} />
                </div>

                <h3>Actualizar datos</h3>
                <p>Revisa la información asociada a tu perfil funcionario.</p>

                <button type="button">
                  Revisar
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>
            </section>

            <section className="inicio-lower-grid">
              <article className="inicio-activity-card">
                <div className="inicio-section-header">
                  <div>
                    <h3>Actividad reciente</h3>
                    <p>Últimos movimientos de solicitudes asignadas.</p>
                  </div>

                  <div className="inicio-live-chip">
                    <span></span>
                    Backend conectado
                    <IonIcon icon={refreshOutline} />
                  </div>
                </div>

                <div className="inicio-activity-list">
                  {actividadReciente.length > 0 ? (
                    actividadReciente.map((solicitud) => (
                      <div
                        className="inicio-activity-row"
                        key={obtenerId(solicitud)}
                      >
                        <div className="inicio-activity-icon">
                          <IonIcon icon={documentTextOutline} />
                        </div>

                        <div>
                          <strong>
                            {obtenerId(solicitud)} · {obtenerEstado(solicitud)}
                          </strong>
                          <p>{obtenerObservacion(solicitud)}</p>
                        </div>

                        <span>{obtenerFechaActualizacion(solicitud)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="inicio-empty-activity">
                      <IonIcon icon={documentTextOutline} />
                      <strong>No hay actividad reciente</strong>
                      <p>Aún no existen solicitudes asignadas a tu usuario.</p>
                    </div>
                  )}
                </div>
              </article>

              <aside className="inicio-agenda-card">
                <h3>Agenda rápida</h3>
                <p>Accede a las citas creadas por ciudadanos.</p>

                <div className="inicio-agenda-list">
                  <div>
                    <IonIcon icon={calendarOutline} />
                    <div>
                      <strong>Agenda funcionario</strong>
                      <span>
                        Revisa fecha, hora, ciudadano y solicitud asociada.
                      </span>
                    </div>
                  </div>

                  <div>
                    <IonIcon icon={alertCircleOutline} />
                    <div>
                      <strong>{totalPendientes} pendientes</strong>
                      <span>Requieren acción o documentación.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="inicio-agenda-button"
                  onClick={irAgenda}
                >
                  Ver agenda completa
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </aside>
            </section>
          </main>

          <footer className="inicio-funcionario-footer">
            <span>© 2026 Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicioFuncionario;
