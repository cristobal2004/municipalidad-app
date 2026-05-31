import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  arrowBackOutline,
  arrowForwardOutline,
  calendarOutline,
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  chatboxEllipsesOutline,
  chevronDownOutline,
  documentTextOutline,
  folderOpenOutline,
  headsetOutline,
  logOutOutline,
  mailUnreadOutline,
  notificationsOutline,
  refreshOutline,
  settingsOutline,
  timeOutline,
  warningOutline,
} from "ionicons/icons";

import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./NotificacionesUsuario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rut?: string;
}

type TipoNotificacion =
  | "tramite"
  | "documento"
  | "cita"
  | "mensaje"
  | "sistema";

type FiltroNotificacion =
  | "todas"
  | "no_leidas"
  | "tramite"
  | "documento"
  | "cita"
  | "mensaje";

interface NotificacionUsuario {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: TipoNotificacion;
  solicitudId?: string;
  accionTexto: string;
}

const NotificacionesUsuario: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "",
  });

  const [notificaciones, setNotificaciones] = useState<NotificacionUsuario[]>(
    []
  );

  const [filtroActivo, setFiltroActivo] =
    useState<FiltroNotificacion>("todas");

  const [cantidadVisible, setCantidadVisible] = useState(6);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  const obtenerValor = (objeto: any, campo: string, respaldo = "") => {
    return objeto?.[campo] || respaldo;
  };

  const obtenerIdSolicitud = (solicitud: Solicitud | null) => {
    if (!solicitud) return "SOL-2026-0001";

    return (
      obtenerValor(solicitud, "id") ||
      obtenerValor(solicitud, "codigo") ||
      "SOL-2026-0001"
    );
  };

  const obtenerTramiteSolicitud = (solicitud: Solicitud | null) => {
    if (!solicitud) return "Patente Comercial";

    return (
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      obtenerValor(solicitud, "tramite") ||
      "Trámite municipal"
    );
  };

  const obtenerEstadoSolicitud = (solicitud: Solicitud | null) => {
    if (!solicitud) return "En revisión";
    return obtenerValor(solicitud, "estado", "En revisión");
  };

  const obtenerFechaSolicitud = (solicitud: Solicitud | null) => {
    if (!solicitud) return "18/04/2026 10:24";

    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      "18/04/2026 10:24"
    );
  };

  const normalizarTipo = (tipo: string): TipoNotificacion => {
    const tipoLower = String(tipo || "").toLowerCase();

    if (tipoLower.includes("document")) return "documento";
    if (tipoLower.includes("cita")) return "cita";
    if (tipoLower.includes("mensaje")) return "mensaje";
    if (tipoLower.includes("sistema")) return "sistema";
    if (tipoLower.includes("estado")) return "tramite";
    if (tipoLower.includes("tramite")) return "tramite";

    return "tramite";
  };

  const normalizarNotificacionGuardada = (
    notificacion: any,
    index: number
  ): NotificacionUsuario => {
    const tipo = normalizarTipo(notificacion.tipo);

    return {
      id: notificacion.id || `LOCAL-${index}-${Date.now()}`,
      titulo: notificacion.titulo || "Nueva notificación",
      mensaje:
        notificacion.mensaje ||
        "Se registró una nueva actualización en tu solicitud.",
      fecha: notificacion.fecha || new Date().toLocaleString("es-CL"),
      leida: Boolean(notificacion.leida),
      tipo,
      solicitudId: notificacion.solicitudId,
      accionTexto:
        notificacion.accionTexto ||
        (tipo === "documento"
          ? "Ver detalle"
          : tipo === "cita"
          ? "Ver cita"
          : tipo === "mensaje"
          ? "Ver mensaje"
          : "Ver solicitud"),
    };
  };

  const generarNotificacionesBase = (
    solicitudes: Solicitud[]
  ): NotificacionUsuario[] => {
    const solicitudPrincipal = solicitudes[0] || null;
    const segundaSolicitud = solicitudes[1] || solicitudPrincipal;
    const terceraSolicitud = solicitudes[2] || solicitudPrincipal;

    const idPrincipal = obtenerIdSolicitud(solicitudPrincipal);
    const idSegunda = obtenerIdSolicitud(segundaSolicitud);
    const idTercera = obtenerIdSolicitud(terceraSolicitud);

    const tramitePrincipal = obtenerTramiteSolicitud(solicitudPrincipal);
    const tramiteSegunda = obtenerTramiteSolicitud(segundaSolicitud);
    const tramiteTercera = obtenerTramiteSolicitud(terceraSolicitud);

    return [
      {
        id: "BASE-ESTADO-001",
        titulo: `Estado actualizado a ${obtenerEstadoSolicitud(
          solicitudPrincipal
        )}`,
        mensaje: `Tu trámite ${tramitePrincipal} (${idPrincipal}) cambió de estado.`,
        fecha: obtenerFechaSolicitud(solicitudPrincipal),
        leida: false,
        tipo: "tramite",
        solicitudId: idPrincipal,
        accionTexto: "Ver solicitud",
      },
      {
        id: "BASE-APROBADA-002",
        titulo: "Solicitud aprobada",
        mensaje: `Tu solicitud de ${tramiteSegunda} (${idSegunda}) fue aprobada.`,
        fecha: "17/04/2026 16:45",
        leida: true,
        tipo: "tramite",
        solicitudId: idSegunda,
        accionTexto: "Ver solicitud",
      },
      {
        id: "BASE-DOCUMENTOS-003",
        titulo: "Documentos solicitados",
        mensaje: `Se requieren documentos adicionales para tu trámite ${tramiteTercera}.`,
        fecha: "17/04/2026 11:03",
        leida: false,
        tipo: "documento",
        solicitudId: idTercera,
        accionTexto: "Ver detalle",
      },
      {
        id: "BASE-CITA-004",
        titulo: "Cita programada",
        mensaje: "Tienes una cita agendada para el 24/04/2026 a las 09:30.",
        fecha: "16/04/2026 09:15",
        leida: false,
        tipo: "cita",
        accionTexto: "Ver cita",
      },
      {
        id: "BASE-RECORDATORIO-005",
        titulo: "Recordatorio: revisa tu solicitud",
        mensaje: `Tu trámite ${tramitePrincipal} (${idPrincipal}) lleva más de 5 días en revisión.`,
        fecha: "15/04/2026 14:20",
        leida: true,
        tipo: "tramite",
        solicitudId: idPrincipal,
        accionTexto: "Ver solicitud",
      },
      {
        id: "BASE-MENSAJE-006",
        titulo: "Nuevo mensaje de la Municipalidad",
        mensaje: `Tienes un nuevo mensaje relacionado con tu trámite ${idPrincipal}.`,
        fecha: "14/04/2026 10:05",
        leida: true,
        tipo: "mensaje",
        solicitudId: idPrincipal,
        accionTexto: "Ver mensaje",
      },
    ];
  };

  const cargarDatos = () => {
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
      } catch {
        usuario = {
          nombre: "Usuario",
          correo: "",
        };
      }
    }

    setUsuarioActual(usuario);

    const correo = usuario.correo || "";

    const solicitudes = correo
      ? solicitudesService.obtenerSolicitudesPorUsuario(correo)
      : solicitudesService.obtenerSolicitudes();

    const notificacionesGuardadas = localStorage.getItem(
      "notificaciones_usuario"
    );

    let notificacionesLocales: NotificacionUsuario[] = [];

    if (notificacionesGuardadas) {
      try {
        const parseadas = JSON.parse(notificacionesGuardadas);
        notificacionesLocales = Array.isArray(parseadas)
          ? parseadas.map(normalizarNotificacionGuardada)
          : [];
      } catch {
        notificacionesLocales = [];
      }
    }

    const notificacionesBase = generarNotificacionesBase(solicitudes);
    const todas = [...notificacionesLocales, ...notificacionesBase];

    const unicas = todas.filter(
      (notificacion, index, arreglo) =>
        index === arreglo.findIndex((item) => item.id === notificacion.id)
    );

    setNotificaciones(unicas);
  };

  useEffect(() => {
    cargarDatos();

    const escucharActualizaciones = () => {
      cargarDatos();
    };

    window.addEventListener("storage", escucharActualizaciones);
    window.addEventListener("focus", escucharActualizaciones);
    window.addEventListener(
      "notificacionesActualizadas",
      escucharActualizaciones
    );

    return () => {
      window.removeEventListener("storage", escucharActualizaciones);
      window.removeEventListener("focus", escucharActualizaciones);
      window.removeEventListener(
        "notificacionesActualizadas",
        escucharActualizaciones
      );
    };
  }, []);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const obtenerIniciales = () => {
    const nombre = usuarioActual.nombre || "Usuario";
    const partes = nombre.trim().split(" ");

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  const claseTipo = (tipo: TipoNotificacion) => {
    if (tipo === "documento") return "tipo-documento";
    if (tipo === "cita") return "tipo-cita";
    if (tipo === "mensaje") return "tipo-mensaje";
    if (tipo === "sistema") return "tipo-sistema";
    return "tipo-tramite";
  };

  const textoTipo = (tipo: TipoNotificacion) => {
    if (tipo === "documento") return "Documentos";
    if (tipo === "cita") return "Citas";
    if (tipo === "mensaje") return "Mensajes";
    if (tipo === "sistema") return "Sistema";
    return "Trámites";
  };

  const iconoTipo = (tipo: TipoNotificacion) => {
    if (tipo === "documento") return folderOpenOutline;
    if (tipo === "cita") return calendarOutline;
    if (tipo === "mensaje") return chatboxEllipsesOutline;
    if (tipo === "sistema") return warningOutline;
    return documentTextOutline;
  };

  const notificacionesFiltradas = useMemo(() => {
    if (filtroActivo === "todas") return notificaciones;

    if (filtroActivo === "no_leidas") {
      return notificaciones.filter((notificacion) => !notificacion.leida);
    }

    return notificaciones.filter(
      (notificacion) => notificacion.tipo === filtroActivo
    );
  }, [notificaciones, filtroActivo]);

  const notificacionesVisibles = notificacionesFiltradas.slice(
    0,
    cantidadVisible
  );

  const totalNotificaciones = notificaciones.length;

  const totalNoLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length;

  const totalLeidas = notificaciones.filter(
    (notificacion) => notificacion.leida
  ).length;

  const totalTramites = notificaciones.filter(
    (notificacion) => notificacion.tipo === "tramite"
  ).length;

  const totalDocumentos = notificaciones.filter(
    (notificacion) => notificacion.tipo === "documento"
  ).length;

  const totalCitas = notificaciones.filter(
    (notificacion) => notificacion.tipo === "cita"
  ).length;

  const totalMensajes = notificaciones.filter(
    (notificacion) => notificacion.tipo === "mensaje"
  ).length;

  const accionesPendientes = notificaciones.filter(
    (notificacion) =>
      !notificacion.leida &&
      ["tramite", "documento", "cita"].includes(notificacion.tipo)
  ).length;

  const guardarNotificaciones = (
    nuevasNotificaciones: NotificacionUsuario[]
  ) => {
    setNotificaciones(nuevasNotificaciones);

    localStorage.setItem(
      "notificaciones_usuario",
      JSON.stringify(nuevasNotificaciones)
    );

    window.dispatchEvent(new Event("notificacionesActualizadas"));
  };

  const marcarTodasComoLeidas = () => {
    const actualizadas = notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));

    guardarNotificaciones(actualizadas);
  };

  const marcarComoLeida = (id: string) => {
    const actualizadas = notificaciones.map((notificacion) =>
      notificacion.id === id ? { ...notificacion, leida: true } : notificacion
    );

    guardarNotificaciones(actualizadas);
  };

  const ejecutarAccion = (notificacion: NotificacionUsuario) => {
    marcarComoLeida(notificacion.id);

    if (notificacion.solicitudId) {
      history.push(`/usuario/solicitud/${notificacion.solicitudId}`);
      return;
    }

    history.push("/usuario/inicio");
  };

  const tabs = [
    {
      id: "todas" as FiltroNotificacion,
      texto: "Todas",
      cantidad: totalNotificaciones,
    },
    {
      id: "no_leidas" as FiltroNotificacion,
      texto: "No leídas",
      cantidad: totalNoLeidas,
    },
    {
      id: "tramite" as FiltroNotificacion,
      texto: "Trámites",
      cantidad: totalTramites,
    },
    {
      id: "documento" as FiltroNotificacion,
      texto: "Documentos",
      cantidad: totalDocumentos,
    },
    {
      id: "cita" as FiltroNotificacion,
      texto: "Citas",
      cantidad: totalCitas,
    },
    {
      id: "mensaje" as FiltroNotificacion,
      texto: "Mensajes",
      cantidad: totalMensajes,
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="notificaciones-content">
        <div className="notificaciones-wrapper">
          <header className="notificaciones-header">
            <div className="notificaciones-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <h1>Municipalidad de Santo Domingo</h1>
            </div>

            <div className="notificaciones-user-area">
              <button
                className="notificaciones-top-button"
                onClick={() => history.push("/usuario/notificaciones")}
                title="Notificaciones pendientes"
              >
                <IonIcon icon={notificationsOutline} />
                {totalNoLeidas > 0 && <span>{totalNoLeidas}</span>}
              </button>

              <div className="notificaciones-user-chip">
                <div className="user-avatar">{obtenerIniciales()}</div>
                <div>
                  <strong>{usuarioActual.nombre || "Usuario"}</strong>
                  <small>Usuario ciudadano</small>
                </div>
              </div>

              <button className="notificaciones-logout" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="notificaciones-main">
            <section className="notificaciones-title-row">
              <div>
                <h2>Notificaciones</h2>
                <p>
                  Mantente informado sobre el estado de tus trámites,
                  documentos y citas.
                </p>
              </div>

              <div className="notificaciones-title-actions">
                <button onClick={marcarTodasComoLeidas}>
                  <IonIcon icon={checkmarkDoneOutline} />
                  Marcar todas como leídas
                </button>

                <button
                  onClick={() =>
                    setMostrarConfiguracion(!mostrarConfiguracion)
                  }
                >
                  <IonIcon icon={settingsOutline} />
                  Configurar notificaciones
                </button>
              </div>
            </section>

            <section className="notificaciones-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={filtroActivo === tab.id ? "active" : ""}
                  onClick={() => {
                    setFiltroActivo(tab.id);
                    setCantidadVisible(6);
                  }}
                >
                  {tab.texto}
                  <span>{tab.cantidad}</span>
                </button>
              ))}
            </section>

            {mostrarConfiguracion && (
              <section className="notificaciones-config-card">
                <div>
                  <h3>Preferencias de notificación</h3>
                  <p>
                    En la entrega 2 estas opciones se conectarán al backend para
                    administrar alertas reales por usuario.
                  </p>
                </div>

                <label>
                  <input type="checkbox" defaultChecked />
                  Cambios de estado
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Documentos solicitados
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Citas municipales
                </label>
              </section>
            )}

            <section className="notificaciones-stats-grid">
              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon purple">
                  <IonIcon icon={mailUnreadOutline} />
                </div>

                <div>
                  <span>Nuevas</span>
                  <strong>{totalNoLeidas}</strong>
                  <p>No leídas</p>
                </div>
              </article>

              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>

                <div>
                  <span>Leídas</span>
                  <strong>{totalLeidas}</strong>
                  <p>Notificaciones vistas</p>
                </div>
              </article>

              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon orange">
                  <IonIcon icon={timeOutline} />
                </div>

                <div>
                  <span>Acciones pendientes</span>
                  <strong>{accionesPendientes}</strong>
                  <p>Requieren tu atención</p>
                </div>
              </article>

              <article className="notificaciones-stat-card ayuda-card">
                <div className="notificaciones-stat-icon blue">
                  <IonIcon icon={headsetOutline} />
                </div>

                <div>
                  <span>¿Necesitas ayuda?</span>
                  <strong>Contacto</strong>
                  <p>Ir a contacto</p>
                </div>
              </article>
            </section>

            <section className="notificaciones-list-card">
              <div className="notificaciones-list-title">
                <h3>Notificaciones</h3>

                <div className="notificaciones-sync-status">
                  <span></span>
                  <p>Sincronizado en tiempo real</p>
                  <IonIcon icon={refreshOutline} />
                </div>
              </div>

              <div className="notificaciones-list">
                {notificacionesVisibles.length > 0 ? (
                  notificacionesVisibles.map((notificacion) => (
                    <article
                      key={notificacion.id}
                      className={`notificaciones-row ${
                        !notificacion.leida ? "unread" : ""
                      }`}
                    >
                      <span className="notificaciones-dot"></span>

                      <div
                        className={`notificaciones-icon ${claseTipo(
                          notificacion.tipo
                        )}`}
                      >
                        <IonIcon icon={iconoTipo(notificacion.tipo)} />
                      </div>

                      <div className="notificaciones-text">
                        <h4>
                          {notificacion.titulo}
                          {!notificacion.leida && <span>Nueva</span>}
                        </h4>

                        <p>{notificacion.mensaje}</p>
                        <small>{notificacion.fecha}</small>
                      </div>

                      <span
                        className={`notificaciones-tag ${claseTipo(
                          notificacion.tipo
                        )}`}
                      >
                        {textoTipo(notificacion.tipo)}
                      </span>

                      <button
                        className="notificaciones-action"
                        onClick={() => ejecutarAccion(notificacion)}
                      >
                        {notificacion.accionTexto}
                        <IonIcon icon={arrowForwardOutline} />
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="notificaciones-empty">
                    <IonIcon icon={notificationsOutline} />
                    <h4>No hay notificaciones para este filtro</h4>
                    <p>
                      Cambia el filtro o vuelve a revisar cuando exista una
                      nueva actualización.
                    </p>
                  </div>
                )}
              </div>

              {cantidadVisible < notificacionesFiltradas.length && (
                <button
                  className="notificaciones-load-more"
                  onClick={() => setCantidadVisible(cantidadVisible + 4)}
                >
                  Cargar más
                  <IonIcon icon={chevronDownOutline} />
                </button>
              )}
            </section>

            <section className="notificaciones-bottom-actions">
              <button
                className="notificaciones-secondary-button"
                onClick={() => history.push("/usuario/inicio")}
              >
                <IonIcon icon={arrowBackOutline} />
                Volver al inicio
              </button>

              <button
                className="notificaciones-primary-button"
                onClick={() => history.push("/usuario/mis-tramites")}
              >
                Ver mis trámites
                <IonIcon icon={arrowForwardOutline} />
              </button>
            </section>
          </main>

          <footer className="notificaciones-footer">
            <span>© 2026 I. Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificacionesUsuario;