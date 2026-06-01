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

import api from "../../services/api";
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

const STORAGE_ESTADO_NOTIFICACIONES = "notificaciones_usuario_estado";
const STORAGE_NOTIFICACIONES_COMPAT = "notificaciones_usuario";

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
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

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
    if (!fecha || fecha === "Sin fecha") {
      return "Sin fecha";
    }

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getTime())) {
      return fecha;
    }

    return fechaDate.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerUsuarioActual = (): UsuarioActual | null => {
    const usuario = authService.getUsuarioActual();

    if (!usuario) {
      return null;
    }

    return {
      nombre: usuario.nombre || "Usuario",
      correo: usuario.correo || "",
      rut: usuario.rut || "",
    };
  };

  const obtenerIdSolicitud = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "codigo") ||
      obtenerValor(solicitud, "solicitudId") ||
      obtenerValor(solicitud, "id") ||
      "SIN-ID"
    );
  };

  const obtenerTramiteSolicitud = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      "Trámite municipal"
    );
  };

  const obtenerEstadoSolicitud = (solicitud: any) => {
    return obtenerValor(solicitud, "estado", "Ingresada");
  };

  const obtenerFechaSolicitud = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      "Sin fecha"
    );
  };

  const obtenerFechaIngreso = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fecha") ||
      "Sin fecha"
    );
  };

  const obtenerDocumentosFaltantes = (solicitud: any): string[] => {
    const documentos = obtenerValor(solicitud, "documentosFaltantes", []);

    if (Array.isArray(documentos)) {
      return documentos
        .map((documento) => String(documento).trim())
        .filter((documento) => documento !== "");
    }

    if (typeof documentos === "string" && documentos.trim() !== "") {
      try {
        const parseado = JSON.parse(documentos);

        if (Array.isArray(parseado)) {
          return parseado
            .map((documento) => String(documento).trim())
            .filter((documento) => documento !== "");
        }
      } catch {
        return documentos
          .split(",")
          .map((documento) => documento.trim())
          .filter((documento) => documento !== "");
      }
    }

    return [];
  };

  const obtenerFechaLimiteDocumentos = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "fechaLimiteDocumentos") ||
      obtenerValor(solicitud, "fecha_limite_documentos") ||
      ""
    );
  };

  const obtenerComentarioFuncionario = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "comentarioFuncionario") ||
      obtenerValor(solicitud, "observacionFuncionario") ||
      obtenerValor(solicitud, "respuestaFuncionario") ||
      ""
    );
  };

  const obtenerFechaComentario = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "fechaComentario") ||
      obtenerValor(solicitud, "fechaObservacion") ||
      obtenerFechaSolicitud(solicitud)
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob")) return "aprobada";
    if (texto.includes("rechaz")) return "rechazada";

    if (
      texto.includes("pendiente") ||
      texto.includes("document") ||
      texto.includes("falta")
    ) {
      return "documentos";
    }

    if (
      texto.includes("revision") ||
      texto.includes("revisión") ||
      texto.includes("proceso")
    ) {
      return "revision";
    }

    return "ingresada";
  };

  const cargarEstadoLectura = (): Record<string, boolean> => {
    const raw = localStorage.getItem(STORAGE_ESTADO_NOTIFICACIONES);

    if (!raw) {
      return {};
    }

    try {
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  };

  const guardarEstadoLectura = (estadoLectura: Record<string, boolean>) => {
    localStorage.setItem(
      STORAGE_ESTADO_NOTIFICACIONES,
      JSON.stringify(estadoLectura)
    );
  };

  const crearNotificacionesDesdeSolicitudes = (
    solicitudes: any[],
    estadoLectura: Record<string, boolean>
  ): NotificacionUsuario[] => {
    const generadas: NotificacionUsuario[] = [];

    solicitudes.forEach((solicitud) => {
      const idSolicitud = obtenerIdSolicitud(solicitud);
      const tramite = obtenerTramiteSolicitud(solicitud);
      const estado = obtenerEstadoSolicitud(solicitud);
      const estadoNormalizado = normalizarEstado(estado);
      const fechaActualizacion = obtenerFechaSolicitud(solicitud);
      const fechaIngreso = obtenerFechaIngreso(solicitud);
      const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);
      const fechaLimite = obtenerFechaLimiteDocumentos(solicitud);
      const comentarioFuncionario = obtenerComentarioFuncionario(solicitud);

      if (documentosFaltantes.length > 0 || estadoNormalizado === "documentos") {
        const id = `DOC-${idSolicitud}-${fechaActualizacion}`;
        const listaDocumentos =
          documentosFaltantes.length > 0
            ? documentosFaltantes.join(", ")
            : "documentos adicionales";

        const fechaLimiteTexto = fechaLimite
          ? ` Fecha límite: ${formatearFecha(fechaLimite)}.`
          : "";

        generadas.push({
          id,
          titulo: "Documentos solicitados",
          mensaje: `Para continuar con tu trámite ${tramite} (${idSolicitud}), debes adjuntar: ${listaDocumentos}.${fechaLimiteTexto}`,
          fecha: formatearFecha(fechaActualizacion),
          leida: estadoLectura[id] === true,
          tipo: "documento",
          solicitudId: idSolicitud,
          accionTexto: "Ver seguimiento",
        });
      }

      if (comentarioFuncionario.trim() !== "") {
        const id = `MSG-${idSolicitud}-${obtenerFechaComentario(solicitud)}`;

        generadas.push({
          id,
          titulo: "Comentario del funcionario",
          mensaje: `${comentarioFuncionario} (${idSolicitud})`,
          fecha: formatearFecha(obtenerFechaComentario(solicitud)),
          leida: estadoLectura[id] === true,
          tipo: "mensaje",
          solicitudId: idSolicitud,
          accionTexto: "Ver seguimiento",
        });
      }

      const idEstado = `EST-${idSolicitud}-${fechaActualizacion}`;

      generadas.push({
        id: idEstado,
        titulo: `Estado actualizado: ${estado}`,
        mensaje: `Tu trámite ${tramite} (${idSolicitud}) se encuentra en estado "${estado}".`,
        fecha: formatearFecha(fechaActualizacion),
        leida: estadoLectura[idEstado] === true,
        tipo: "tramite",
        solicitudId: idSolicitud,
        accionTexto: "Ver seguimiento",
      });

      const idIngreso = `ING-${idSolicitud}-${fechaIngreso}`;

      generadas.push({
        id: idIngreso,
        titulo: "Solicitud ingresada correctamente",
        mensaje: `Tu solicitud ${idSolicitud} fue registrada en el sistema municipal.`,
        fecha: formatearFecha(fechaIngreso),
        leida: estadoLectura[idIngreso] === true,
        tipo: "tramite",
        solicitudId: idSolicitud,
        accionTexto: "Ver seguimiento",
      });
    });

    const unicas = generadas.filter(
      (notificacion, index, arreglo) =>
        index === arreglo.findIndex((item) => item.id === notificacion.id)
    );

    return unicas.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();

      if (Number.isNaN(fechaA) || Number.isNaN(fechaB)) {
        return 0;
      }

      return fechaB - fechaA;
    });
  };

  const sincronizarCompatibilidadLocalStorage = (
    nuevasNotificaciones: NotificacionUsuario[]
  ) => {
    localStorage.setItem(
      STORAGE_NOTIFICACIONES_COMPAT,
      JSON.stringify(nuevasNotificaciones)
    );

    window.dispatchEvent(new Event("notificacionesActualizadas"));
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = obtenerUsuarioActual();

      if (!usuario) {
        history.push("/login-usuario");
        return;
      }

      setUsuarioActual(usuario);

      const respuesta = await api.get("/solicitudes/mis-solicitudes");
      const solicitudesBackend = respuesta.data?.solicitudes || [];

      const estadoLectura = cargarEstadoLectura();

      const nuevasNotificaciones = crearNotificacionesDesdeSolicitudes(
        Array.isArray(solicitudesBackend) ? solicitudesBackend : [],
        estadoLectura
      );

      setNotificaciones(nuevasNotificaciones);
      sincronizarCompatibilidadLocalStorage(nuevasNotificaciones);
    } catch (error: any) {
      console.error("Error al cargar notificaciones del usuario:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron cargar las notificaciones desde el backend.";

      setMensajeError(mensajeBackend);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const escucharActualizaciones = () => {
      cargarDatos();
    };

    window.addEventListener("focus", escucharActualizaciones);
    window.addEventListener(
      "notificacionesActualizadas",
      escucharActualizaciones
    );
    window.addEventListener("solicitudesActualizadas", escucharActualizaciones);

    return () => {
      window.removeEventListener("focus", escucharActualizaciones);
      window.removeEventListener(
        "notificacionesActualizadas",
        escucharActualizaciones
      );
      window.removeEventListener(
        "solicitudesActualizadas",
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
    const partes = nombre.trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "US";

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
    sincronizarCompatibilidadLocalStorage(nuevasNotificaciones);
  };

  const marcarTodasComoLeidas = () => {
    const estadoLectura = cargarEstadoLectura();

    notificaciones.forEach((notificacion) => {
      estadoLectura[notificacion.id] = true;
    });

    guardarEstadoLectura(estadoLectura);

    const actualizadas = notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));

    guardarNotificaciones(actualizadas);
  };

  const marcarComoLeida = (id: string) => {
    const estadoLectura = cargarEstadoLectura();
    estadoLectura[id] = true;
    guardarEstadoLectura(estadoLectura);

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
                    Estas opciones permitirán configurar qué alertas desea
                    recibir el ciudadano.
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

            {mensajeError && (
              <section className="notificaciones-config-card">
                <div>
                  <h3>No se pudieron cargar las notificaciones</h3>
                  <p>{mensajeError}</p>
                </div>
              </section>
            )}

            <section className="notificaciones-stats-grid">
              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon purple">
                  <IonIcon icon={mailUnreadOutline} />
                </div>

                <div>
                  <span>Nuevas</span>
                  <strong>{cargando ? "..." : totalNoLeidas}</strong>
                  <p>No leídas</p>
                </div>
              </article>

              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>

                <div>
                  <span>Leídas</span>
                  <strong>{cargando ? "..." : totalLeidas}</strong>
                  <p>Notificaciones vistas</p>
                </div>
              </article>

              <article className="notificaciones-stat-card">
                <div className="notificaciones-stat-icon orange">
                  <IonIcon icon={timeOutline} />
                </div>

                <div>
                  <span>Acciones pendientes</span>
                  <strong>{cargando ? "..." : accionesPendientes}</strong>
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
                  <p>Sincronizado con backend</p>
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