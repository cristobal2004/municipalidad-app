import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  alertCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  calendarOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  documentAttachOutline,
  informationCircleOutline,
  logOutOutline,
  notificationsOutline,
  personOutline,
  refreshOutline,
  timeOutline,
} from "ionicons/icons";

import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./NotificacionesFuncionario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rol?: string;
  cargo?: string;
  area?: string;
}

interface NotificacionFuncionario {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: "asignacion" | "documento" | "alerta" | "cita" | "sistema";
  solicitudId?: string;
  accionTexto?: string;
  funcionario?: string;
}

type FiltroActivo =
  | "todas"
  | "no-leidas"
  | "asignaciones"
  | "documentos"
  | "alertas"
  | "citas";

const NotificacionesFuncionario: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
    cargo: "Funcionario municipal",
    area: "Área municipal",
  });

  const [notificaciones, setNotificaciones] = useState<
    NotificacionFuncionario[]
  >([]);

  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>("todas");

  const obtenerValor = (objeto: any, campo: string, respaldo = "") => {
    return objeto?.[campo] || respaldo;
  };

  const normalizarTexto = (texto: string) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const obtenerUsuarioDesdeLocalStorage = (): UsuarioActual => {
    const posiblesKeys = [
      "funcionario_actual",
      "funcionarioActual",
      "funcionario_logueado",
      "funcionarioLogueado",
      "current_funcionario",
      "usuario_funcionario",
      "usuarioFuncionario",
      "usuario_actual",
      "usuarioActual",
      "current_user",
      "usuarioLogueado",
      "sesion_usuario",
    ];

    for (const key of posiblesKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const usuario = JSON.parse(raw);

        const nombre =
          usuario.nombre ||
          usuario.name ||
          usuario.usuario ||
          usuario.nombreCompleto ||
          usuario.fullName ||
          "";

        if (nombre && String(nombre).trim() !== "") {
          return {
            nombre,
            correo: usuario.correo || usuario.email || usuario.mail || "",
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
          };
        }
      } catch {
        if (raw.trim() !== "") {
          return {
            nombre: raw,
            correo: "",
            rol: "funcionario",
            cargo: "Funcionario municipal",
            area: "Área municipal",
          };
        }
      }
    }

    return {
      nombre: "Funcionario",
      correo: "",
      rol: "funcionario",
      cargo: "Funcionario municipal",
      area: "Área municipal",
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
      obtenerValor(solicitud, "id") ||
      obtenerValor(solicitud, "solicitudId") ||
      "SIN-ID"
    );
  };

  const obtenerTramite = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "tramite") ||
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      "Trámite municipal"
    );
  };

  const obtenerEstado = (solicitud: any) => {
    return obtenerValor(solicitud, "estado", "En revisión");
  };

  const obtenerEncargado = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "encargado") ||
      obtenerValor(solicitud, "funcionario") ||
      obtenerValor(solicitud, "asignadoA") ||
      obtenerValor(solicitud, "funcionarioAsignado") ||
      ""
    );
  };

  const obtenerFecha = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fecha") ||
      "Sin fecha"
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob") || texto.includes("resuelt")) return "resuelta";
    if (texto.includes("rechaz")) return "resuelta";

    if (texto.includes("pendiente") || texto.includes("document")) {
      return "pendiente";
    }

    return "revision";
  };

  const obtenerSolicitudesAsignadas = (usuario: UsuarioActual) => {
    let solicitudesServicio: Solicitud[] = [];

    try {
      solicitudesServicio = solicitudesService.obtenerSolicitudes();
    } catch {
      solicitudesServicio = [];
    }

    const nombreFuncionario = normalizarTexto(usuario.nombre || "Funcionario");

    const solicitudesBase =
      Array.isArray(solicitudesServicio) && solicitudesServicio.length > 0
        ? solicitudesServicio
        : [];

    return solicitudesBase.filter((solicitud: any) => {
      const encargado = normalizarTexto(obtenerEncargado(solicitud));

      if (!encargado) return true;

      return encargado.includes(nombreFuncionario);
    });
  };

  const crearNotificacionesDemo = (
    usuario: UsuarioActual
  ): NotificacionFuncionario[] => {
    const nombreFuncionario = usuario.nombre || "Funcionario";
    const solicitudesAsignadas = obtenerSolicitudesAsignadas(usuario);

    if (solicitudesAsignadas.length > 0) {
      return solicitudesAsignadas.slice(0, 4).map((solicitud: any, index) => {
        const estado = normalizarEstado(obtenerEstado(solicitud));

        return {
          id: `NF-${normalizarTexto(nombreFuncionario)}-${obtenerId(
            solicitud
          )}-${index}`,
          titulo:
            estado === "pendiente"
              ? "Solicitud requiere gestión"
              : estado === "resuelta"
              ? "Solicitud resuelta"
              : "Solicitud asignada",
          mensaje: `${obtenerId(solicitud)} · ${obtenerTramite(
            solicitud
          )} requiere seguimiento desde tu panel funcionario.`,
          fecha: obtenerFecha(solicitud),
          leida: index > 1,
          tipo:
            estado === "pendiente"
              ? "alerta"
              : estado === "resuelta"
              ? "sistema"
              : "asignacion",
          solicitudId: obtenerId(solicitud),
          accionTexto: "Ver solicitud",
          funcionario: nombreFuncionario,
        };
      });
    }

    return [
      {
        id: `NF-${normalizarTexto(nombreFuncionario)}-001`,
        titulo: "Nueva solicitud asignada",
        mensaje: "Se asignó una nueva solicitud a tu bandeja de gestión.",
        fecha: "18/04/2026 10:24",
        leida: false,
        tipo: "asignacion",
        solicitudId: "SOL-2026-0001",
        accionTexto: "Ver solicitud",
        funcionario: nombreFuncionario,
      },
      {
        id: `NF-${normalizarTexto(nombreFuncionario)}-002`,
        titulo: "Documentos recibidos",
        mensaje:
          "El ciudadano adjuntó documentación pendiente para una solicitud asignada a ti.",
        fecha: "18/04/2026 09:45",
        leida: false,
        tipo: "documento",
        solicitudId: "SOL-2026-0002",
        accionTexto: "Revisar documentos",
        funcionario: nombreFuncionario,
      },
      {
        id: `NF-${normalizarTexto(nombreFuncionario)}-003`,
        titulo: "Solicitud pendiente por revisar",
        mensaje:
          "Una solicitud asignada a ti lleva varios días sin actualización.",
        fecha: "17/04/2026 16:10",
        leida: true,
        tipo: "alerta",
        solicitudId: "SOL-2026-0003",
        accionTexto: "Ver seguimiento",
        funcionario: nombreFuncionario,
      },
      {
        id: `NF-${normalizarTexto(nombreFuncionario)}-004`,
        titulo: "Cita agendada",
        mensaje: "Se registró una cita ciudadana asociada a una solicitud tuya.",
        fecha: "17/04/2026 11:30",
        leida: true,
        tipo: "cita",
        solicitudId: "SOL-2026-0001",
        accionTexto: "Ver cita",
        funcionario: nombreFuncionario,
      },
    ];
  };

  const cargarDatos = () => {
    const usuario = obtenerUsuarioDesdeLocalStorage();

    localStorage.setItem(
      "funcionario_actual",
      JSON.stringify({
        ...usuario,
        rol: "funcionario",
      })
    );

    setUsuarioActual(usuario);

    const nombreFuncionario = normalizarTexto(usuario.nombre || "Funcionario");

    const raw = localStorage.getItem("notificaciones_funcionario");

    let todasLasNotificaciones: NotificacionFuncionario[] = [];

    if (raw) {
      try {
        const data = JSON.parse(raw);
        todasLasNotificaciones = Array.isArray(data) ? data : [];
      } catch {
        todasLasNotificaciones = [];
      }
    }

    const notificacionesValidas = todasLasNotificaciones.filter(
      (notificacion) =>
        notificacion.funcionario &&
        String(notificacion.funcionario).trim() !== ""
    );

    const existenParaFuncionarioActual = notificacionesValidas.some(
      (notificacion) =>
        normalizarTexto(notificacion.funcionario || "") === nombreFuncionario
    );

    let notificacionesFinales = [...notificacionesValidas];

    if (!existenParaFuncionarioActual) {
      notificacionesFinales = [
        ...notificacionesValidas,
        ...crearNotificacionesDemo(usuario),
      ];
    }

    localStorage.setItem(
      "notificaciones_funcionario",
      JSON.stringify(notificacionesFinales)
    );

    const notificacionesDelFuncionario = notificacionesFinales.filter(
      (notificacion) =>
        normalizarTexto(notificacion.funcionario || "") === nombreFuncionario
    );

    setNotificaciones(notificacionesDelFuncionario);
  };

  useEffect(() => {
    cargarDatos();

    const escucharCambios = () => {
      cargarDatos();
    };

    window.addEventListener("storage", escucharCambios);
    window.addEventListener("focus", escucharCambios);
    window.addEventListener(
      "notificacionesFuncionarioActualizadas",
      escucharCambios
    );

    return () => {
      window.removeEventListener("storage", escucharCambios);
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener(
        "notificacionesFuncionarioActualizadas",
        escucharCambios
      );
    };
  }, []);

  const guardarNotificacionesDelFuncionario = (
    actualizadasFuncionario: NotificacionFuncionario[]
  ) => {
    const nombreFuncionario = normalizarTexto(
      usuarioActual.nombre || "Funcionario"
    );

    const raw = localStorage.getItem("notificaciones_funcionario");

    let todas: NotificacionFuncionario[] = [];

    if (raw) {
      try {
        const data = JSON.parse(raw);
        todas = Array.isArray(data) ? data : [];
      } catch {
        todas = [];
      }
    }

    const otrasNotificaciones = todas.filter(
      (notificacion) =>
        normalizarTexto(notificacion.funcionario || "") !== nombreFuncionario
    );

    const nuevas = [...otrasNotificaciones, ...actualizadasFuncionario];

    localStorage.setItem("notificaciones_funcionario", JSON.stringify(nuevas));
    setNotificaciones(actualizadasFuncionario);

    window.dispatchEvent(new Event("notificacionesFuncionarioActualizadas"));
  };

  const marcarTodasComoLeidas = () => {
    const actualizadas = notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));

    guardarNotificacionesDelFuncionario(actualizadas);
  };

  const abrirNotificacion = (notificacion: NotificacionFuncionario) => {
    const actualizadas = notificaciones.map((item) =>
      item.id === notificacion.id ? { ...item, leida: true } : item
    );

    guardarNotificacionesDelFuncionario(actualizadas);

    localStorage.setItem(
      "funcionario_actual",
      JSON.stringify({
        ...usuarioActual,
        rol: "funcionario",
      })
    );

    if (notificacion.solicitudId) {
      history.push(`/funcionario/solicitud/${notificacion.solicitudId}`);
    }
  };

  const notificacionesFiltradas = useMemo(() => {
    if (filtroActivo === "no-leidas") {
      return notificaciones.filter((notificacion) => !notificacion.leida);
    }

    if (filtroActivo === "asignaciones") {
      return notificaciones.filter(
        (notificacion) => notificacion.tipo === "asignacion"
      );
    }

    if (filtroActivo === "documentos") {
      return notificaciones.filter(
        (notificacion) => notificacion.tipo === "documento"
      );
    }

    if (filtroActivo === "alertas") {
      return notificaciones.filter(
        (notificacion) => notificacion.tipo === "alerta"
      );
    }

    if (filtroActivo === "citas") {
      return notificaciones.filter(
        (notificacion) => notificacion.tipo === "cita"
      );
    }

    return notificaciones;
  }, [notificaciones, filtroActivo]);

  const totalNoLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length;

  const totalAsignaciones = notificaciones.filter(
    (notificacion) => notificacion.tipo === "asignacion"
  ).length;

  const totalDocumentos = notificaciones.filter(
    (notificacion) => notificacion.tipo === "documento"
  ).length;

  const totalAlertas = notificaciones.filter(
    (notificacion) => notificacion.tipo === "alerta"
  ).length;

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const claseTipo = (tipo: NotificacionFuncionario["tipo"]) => {
    if (tipo === "asignacion") return "asignacion";
    if (tipo === "documento") return "documento";
    if (tipo === "alerta") return "alerta";
    if (tipo === "cita") return "cita";

    return "sistema";
  };

  const iconoTipo = (tipo: NotificacionFuncionario["tipo"]) => {
    if (tipo === "asignacion") return clipboardOutline;
    if (tipo === "documento") return documentAttachOutline;
    if (tipo === "alerta") return alertCircleOutline;
    if (tipo === "cita") return calendarOutline;

    return informationCircleOutline;
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="notificaciones-func-content">
        <div className="notificaciones-func-wrapper">
          <header className="notificaciones-func-header">
            <div className="notificaciones-func-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="notificaciones-func-user-area">
              <button
                className="panel-func-button"
                onClick={() => history.push("/funcionario/inicio")}
              >
                <IonIcon icon={personOutline} />
                Panel funcionario
              </button>

              <div className="notificaciones-func-profile">
                <div className="notificaciones-func-avatar">
                  {obtenerIniciales(usuarioActual.nombre || "Funcionario")}
                </div>

                <div>
                  <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                  <small>{usuarioActual.cargo || "Funcionario municipal"}</small>
                </div>
              </div>

              <button
                className="notificaciones-func-logout"
                onClick={cerrarSesion}
              >
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="notificaciones-func-main">
            <section className="notificaciones-func-title-row">
              <div>
                <h2>Notificaciones funcionario</h2>
                <p>
                  Mantente informado sobre asignaciones, documentos recibidos,
                  alertas operativas y citas asociadas a tus solicitudes.
                </p>
              </div>

              <div className="notificaciones-func-actions">
                <button onClick={marcarTodasComoLeidas}>
                  <IonIcon icon={checkmarkCircleOutline} />
                  Marcar todas como leídas
                </button>

                <button onClick={cargarDatos}>
                  <IonIcon icon={refreshOutline} />
                  Actualizar
                </button>
              </div>
            </section>

            <section className="notificaciones-func-kpis">
              <article>
                <div className="kpi-icon purple">
                  <IonIcon icon={notificationsOutline} />
                </div>
                <div>
                  <span>No leídas</span>
                  <strong>{totalNoLeidas}</strong>
                  <p>Requieren revisión</p>
                </div>
              </article>

              <article>
                <div className="kpi-icon blue">
                  <IonIcon icon={clipboardOutline} />
                </div>
                <div>
                  <span>Asignaciones</span>
                  <strong>{totalAsignaciones}</strong>
                  <p>Nuevas o recientes</p>
                </div>
              </article>

              <article>
                <div className="kpi-icon green">
                  <IonIcon icon={documentAttachOutline} />
                </div>
                <div>
                  <span>Documentos</span>
                  <strong>{totalDocumentos}</strong>
                  <p>Recibidos del ciudadano</p>
                </div>
              </article>

              <article>
                <div className="kpi-icon orange">
                  <IonIcon icon={alertCircleOutline} />
                </div>
                <div>
                  <span>Alertas</span>
                  <strong>{totalAlertas}</strong>
                  <p>Pendientes operativas</p>
                </div>
              </article>
            </section>

            <section className="notificaciones-func-tabs">
              <button
                className={filtroActivo === "todas" ? "active" : ""}
                onClick={() => setFiltroActivo("todas")}
              >
                Todas
                <span>{notificaciones.length}</span>
              </button>

              <button
                className={filtroActivo === "no-leidas" ? "active" : ""}
                onClick={() => setFiltroActivo("no-leidas")}
              >
                No leídas
                <span>{totalNoLeidas}</span>
              </button>

              <button
                className={filtroActivo === "asignaciones" ? "active" : ""}
                onClick={() => setFiltroActivo("asignaciones")}
              >
                Asignaciones
                <span>{totalAsignaciones}</span>
              </button>

              <button
                className={filtroActivo === "documentos" ? "active" : ""}
                onClick={() => setFiltroActivo("documentos")}
              >
                Documentos
                <span>{totalDocumentos}</span>
              </button>

              <button
                className={filtroActivo === "alertas" ? "active" : ""}
                onClick={() => setFiltroActivo("alertas")}
              >
                Alertas
                <span>{totalAlertas}</span>
              </button>

              <button
                className={filtroActivo === "citas" ? "active" : ""}
                onClick={() => setFiltroActivo("citas")}
              >
                Citas
              </button>
            </section>

            <section className="notificaciones-func-list-card">
              <div className="notificaciones-func-card-header">
                <div>
                  <h3>Listado de notificaciones</h3>
                  <p>
                    Selecciona una notificación para revisar el detalle de la
                    solicitud asociada.
                  </p>
                </div>

                <div className="live-chip-func">
                  <span></span>
                  Sincronizado en tiempo real
                  <IonIcon icon={refreshOutline} />
                </div>
              </div>

              <div className="notificaciones-func-list">
                {notificacionesFiltradas.length > 0 ? (
                  notificacionesFiltradas.map((notificacion) => (
                    <article
                      key={notificacion.id}
                      className={`notificacion-func-row ${
                        !notificacion.leida ? "unread" : ""
                      }`}
                      onClick={() => abrirNotificacion(notificacion)}
                    >
                      <div
                        className={`notificacion-func-icon ${claseTipo(
                          notificacion.tipo
                        )}`}
                      >
                        <IonIcon icon={iconoTipo(notificacion.tipo)} />
                      </div>

                      <div className="notificacion-func-text">
                        <div>
                          <h4>{notificacion.titulo}</h4>
                          {!notificacion.leida && <span>No leída</span>}
                        </div>

                        <p>{notificacion.mensaje}</p>

                        <small>
                          <IonIcon icon={timeOutline} />
                          {notificacion.fecha}
                        </small>
                      </div>

                      <button type="button">
                        {notificacion.accionTexto || "Ver detalle"}
                        <IonIcon icon={arrowForwardOutline} />
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="notificaciones-func-empty">
                    <IonIcon icon={notificationsOutline} />
                    <h3>No hay notificaciones para mostrar</h3>
                    <p>
                      Cambia el filtro o espera nuevas actualizaciones de tus
                      solicitudes asignadas.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="notificaciones-func-bottom-actions">
              <button onClick={() => history.push("/funcionario/inicio")}>
                <IonIcon icon={arrowBackOutline} />
                Volver al panel
              </button>
            </section>
          </main>

          <footer className="notificaciones-func-footer">
            <span>© 2026 Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificacionesFuncionario;