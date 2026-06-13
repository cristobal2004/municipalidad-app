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

import { useLatestCallback } from "../../../../core/presentation/hooks/useLatestCallback";
import type { Solicitud } from "../../../solicitudes/domain/entities/Solicitud";
import { authService } from "../../../auth/composition/authService";
import { solicitudesApiService } from "../../../solicitudes/composition/solicitudesService";
import "./InicioUsuario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rut?: string;
}

type TipoNotificacionReal = "tramite" | "documento" | "mensaje";

interface NotificacionInicio {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: TipoNotificacionReal;
  solicitudId?: string;
}

const STORAGE_ESTADO_NOTIFICACIONES = "notificaciones_usuario_estado";

const InicioUsuario: React.FC = () => {
  const history = useHistory();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "",
  });
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = authService.getUsuarioActual();

      if (!usuario) {
        history.push("/login-usuario");
        return;
      }

      setUsuarioActual({
        nombre: usuario.nombre,
        correo: usuario.correo,
        rut: usuario.rut,
      });

      const solicitudesBackend =
        await solicitudesApiService.obtenerMisSolicitudes();

      const solicitudesOrdenadas = [...(solicitudesBackend as Solicitud[])].sort(
        (a: any, b: any) => {
          const fechaA = new Date(
            a.ultimaActualizacion || a.fechaIngreso || a.fechaRecibo || ""
          ).getTime();

          const fechaB = new Date(
            b.ultimaActualizacion || b.fechaIngreso || b.fechaRecibo || ""
          ).getTime();

          if (Number.isNaN(fechaA) || Number.isNaN(fechaB)) {
            return 0;
          }

          return fechaB - fechaA;
        }
      );

      setSolicitudes(solicitudesOrdenadas);
    } catch (error: any) {
      console.error("Error al cargar inicio usuario:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron cargar tus solicitudes. Intenta nuevamente.";

      setMensajeError(mensajeBackend);
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
    window.addEventListener("notificacionesActualizadas", escucharCambios);

    return () => {
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
      window.removeEventListener("notificacionesActualizadas", escucharCambios);
    };
  }, [cargarDatosEstable]);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const obtenerValor = (
    solicitud: Solicitud | any,
    campo: string,
    respaldo: any = ""
  ): any => {
    const valor = solicitud?.[campo];

    if (valor === undefined || valor === null || valor === "") {
      return respaldo;
    }

    return valor;
  };

  const obtenerId = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "codigo") ||
      obtenerValor(solicitud, "solicitudId") ||
      obtenerValor(solicitud, "id") ||
      "SIN-ID"
    );
  };

  const obtenerTipoPatente = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "tipoPatente") ||
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tramite") ||
      "Trámite municipal"
    );
  };

  const obtenerEstado = (solicitud: Solicitud) => {
    return obtenerValor(solicitud, "estado", "Ingresada");
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

  const formatearFechaHora = (fecha: string) => {
    if (!fecha || fecha === "Sin fecha") return "Sin fecha";

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

  const obtenerFechaRecibo = (solicitud: Solicitud) => {
    const fecha =
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "createdAt") ||
      "Sin fecha";

    return formatearFecha(fecha);
  };

  const obtenerFechaIngresoRaw = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "createdAt") ||
      "Sin fecha"
    );
  };

  const obtenerUltimaActualizacionRaw = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      "Sin fecha"
    );
  };

  const obtenerFechaComentarioRaw = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "fechaComentario") ||
      obtenerValor(solicitud, "fechaObservacion") ||
      obtenerUltimaActualizacionRaw(solicitud)
    );
  };

  const normalizarTexto = (texto: string) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const normalizarEstado = (estado: string) => {
    const estadoLower = normalizarTexto(estado);

    if (estadoLower.includes("aprob")) return "aprobada";
    if (estadoLower.includes("rechaz")) return "rechazada";

    if (
      estadoLower.includes("falta") ||
      estadoLower.includes("document") ||
      estadoLower.includes("pendiente")
    ) {
      return "pendiente_documentos";
    }

    if (
      estadoLower.includes("revision") ||
      estadoLower.includes("revisión") ||
      estadoLower.includes("proceso")
    ) {
      return "en_revision";
    }

    return "ingresada";
  };

  const obtenerDocumentosFaltantes = (solicitud: Solicitud): string[] => {
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

  const obtenerComentarioFuncionario = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "comentarioFuncionario") ||
      obtenerValor(solicitud, "observacionFuncionario") ||
      obtenerValor(solicitud, "respuestaFuncionario") ||
      ""
    );
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

  const crearNotificacionesDesdeSolicitudes = (
    solicitudesActuales: Solicitud[]
  ): NotificacionInicio[] => {
    const estadoLectura = cargarEstadoLectura();
    const notificacionesGeneradas: NotificacionInicio[] = [];

    solicitudesActuales.forEach((solicitud) => {
      const idSolicitud = obtenerId(solicitud);
      const tramite = obtenerTipoPatente(solicitud);
      const estado = obtenerEstado(solicitud);
      const fechaActualizacion = obtenerUltimaActualizacionRaw(solicitud);
      const fechaIngreso = obtenerFechaIngresoRaw(solicitud);
      const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);
      const comentarioFuncionario = obtenerComentarioFuncionario(solicitud);

      if (
        documentosFaltantes.length > 0 ||
        normalizarEstado(estado) === "pendiente_documentos"
      ) {
        const id = `DOC-${idSolicitud}-${fechaActualizacion}`;
        const listaDocumentos =
          documentosFaltantes.length > 0
            ? documentosFaltantes.join(", ")
            : "documentos adicionales";

        notificacionesGeneradas.push({
          id,
          titulo: "Documentos solicitados",
          mensaje: `Debes adjuntar: ${listaDocumentos}.`,
          fecha: formatearFechaHora(fechaActualizacion),
          leida: estadoLectura[id] === true,
          tipo: "documento",
          solicitudId: idSolicitud,
        });
      }

      if (comentarioFuncionario.trim() !== "") {
        const id = `MSG-${idSolicitud}-${obtenerFechaComentarioRaw(
          solicitud
        )}`;

        notificacionesGeneradas.push({
          id,
          titulo: "Comentario del funcionario",
          mensaje: comentarioFuncionario,
          fecha: formatearFechaHora(obtenerFechaComentarioRaw(solicitud)),
          leida: estadoLectura[id] === true,
          tipo: "mensaje",
          solicitudId: idSolicitud,
        });
      }

      const idEstado = `EST-${idSolicitud}-${fechaActualizacion}`;

      notificacionesGeneradas.push({
        id: idEstado,
        titulo: `Estado actualizado: ${obtenerTextoEstado(estado)}`,
        mensaje: `Tu trámite ${tramite} se encuentra en estado "${obtenerTextoEstado(
          estado
        )}".`,
        fecha: formatearFechaHora(fechaActualizacion),
        leida: estadoLectura[idEstado] === true,
        tipo: "tramite",
        solicitudId: idSolicitud,
      });

      const idIngreso = `ING-${idSolicitud}-${fechaIngreso}`;

      notificacionesGeneradas.push({
        id: idIngreso,
        titulo: "Solicitud ingresada correctamente",
        mensaje: `Tu solicitud ${idSolicitud} fue registrada en el sistema municipal.`,
        fecha: formatearFechaHora(fechaIngreso),
        leida: estadoLectura[idIngreso] === true,
        tipo: "tramite",
        solicitudId: idSolicitud,
      });
    });

    const unicas = notificacionesGeneradas.filter(
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

  const notificacionesInicio =
    crearNotificacionesDesdeSolicitudes(solicitudes);

  const avisosNoLeidos = notificacionesInicio.filter(
    (notificacion) => !notificacion.leida
  ).length;

  const notificacionesRecientes = notificacionesInicio.slice(0, 3);

  const solicitudesActivas = solicitudes.filter((solicitud) => {
    const estado = normalizarEstado(obtenerEstado(solicitud));
    return estado === "ingresada" || estado === "en_revision";
  });

  const pendientesDocumentos = solicitudes.filter(
    (solicitud) =>
      normalizarEstado(obtenerEstado(solicitud)) === "pendiente_documentos" ||
      obtenerDocumentosFaltantes(solicitud).length > 0
  );

  const solicitudesAprobadas = solicitudes.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "aprobada"
  );

  const ultimaSolicitud = useMemo(() => {
    if (solicitudes.length === 0) return undefined;
    return solicitudes[0];
  }, [solicitudes]);

  const primeraPendienteDocumentos = useMemo(() => {
    return pendientesDocumentos[0];
  }, [pendientesDocumentos]);

  const obtenerClaseEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return "estado-mini estado-aprobado";
    if (estadoNormalizado === "pendiente_documentos") {
      return "estado-mini estado-falta";
    }

    return "estado-mini estado-proceso";
  };

  function obtenerTextoEstado(estado: string) {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return "Aprobada";
    if (estadoNormalizado === "rechazada") return "Rechazada";
    if (estadoNormalizado === "pendiente_documentos") {
      return "Documentos pendientes";
    }
    if (estadoNormalizado === "en_revision") return "En revisión";

    return "Ingresada";
  }

  const obtenerEtapaActual = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada" || estadoNormalizado === "rechazada") {
      return 4;
    }

    if (estadoNormalizado === "pendiente_documentos") return 3;
    if (estadoNormalizado === "en_revision") return 2;

    return 1;
  };

  const obtenerMensajeAlerta = (solicitud: Solicitud) => {
    const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);
    const comentarioFuncionario = obtenerComentarioFuncionario(solicitud);

    if (documentosFaltantes.length > 0) {
      return `Debes adjuntar los siguientes documentos: ${documentosFaltantes.join(
        ", "
      )}.`;
    }

    if (comentarioFuncionario.trim() !== "") {
      return comentarioFuncionario;
    }

    return (
      obtenerValor(solicitud, "observacion") ||
      obtenerValor(solicitud, "observaciones") ||
      "Tu solicitud se encuentra registrada y será revisada por el equipo municipal correspondiente."
    );
  };

  const renderSeguimiento = (solicitud: Solicitud) => {
    const estado = obtenerEstado(solicitud);
    const etapa = obtenerEtapaActual(estado);

    const fechaIngreso = obtenerFechaRecibo(solicitud);
    const fechaActualizacion = formatearFecha(
      obtenerUltimaActualizacionRaw(solicitud)
    );

    const pasos = [
      {
        numero: 1,
        titulo: "Ingresada",
        fecha: fechaIngreso,
      },
      {
        numero: 2,
        titulo: "En revisión",
        fecha: etapa >= 2 ? fechaActualizacion : "Pendiente",
      },
      {
        numero: 3,
        titulo: "Documentos pendientes",
        fecha: etapa >= 3 ? fechaActualizacion : "Pendiente",
      },
      {
        numero: 4,
        titulo: "Finalizada",
        fecha: etapa >= 4 ? fechaActualizacion : "Pendiente",
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

  const obtenerIconoNotificacion = (tipo: TipoNotificacionReal) => {
    if (tipo === "documento") return folderOpenOutline;
    if (tipo === "mensaje") return mailUnreadOutline;
    return documentTextOutline;
  };

  const obtenerColorNotificacion = (tipo: TipoNotificacionReal) => {
    if (tipo === "documento") return "orange";
    if (tipo === "mensaje") return "green";
    return "blue";
  };

  const irASubirDocumentos = () => {
    if (primeraPendienteDocumentos) {
      history.push(`/usuario/solicitud/${obtenerId(primeraPendienteDocumentos)}`);
      return;
    }

    history.push("/usuario/mis-tramites");
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        scrollY
        className="inicio-usuario-content"
      >
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
                {avisosNoLeidos > 0 && <span>{avisosNoLeidos}</span>}
              </button>

              <div className="user-chip">
                <IonIcon icon={personCircleOutline} />
                <div>
                  <strong>Bienvenido, {usuarioActual.nombre || "Usuario"}</strong>
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
            {cargando && (
              <section className="panel-card">
                <h3>Cargando solicitudes...</h3>
                <p>
                  Estamos obteniendo tu información desde el sistema municipal.
                </p>
              </section>
            )}

            {mensajeError && (
              <section className="panel-card">
                <h3>No se pudo cargar la información</h3>
                <p>{mensajeError}</p>
              </section>
            )}

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
                    onClick={() => history.push("/usuario/seleccionar-tramite")}
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

                <button onClick={irASubirDocumentos}>
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
                  <strong>{avisosNoLeidos}</strong>
                  <p>No leídos</p>
                </div>

                <button onClick={() => history.push("/usuario/notificaciones")}>
                  Ver avisos <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>
            </section>

            <section className="inicio-content-grid">
              <div className="inicio-left-column">
                <section className="panel-card seguimiento-card">
                  <div className="panel-title-row">
                    <h3>Seguimiento rápido</h3>

                    <button onClick={() => history.push("/usuario/mis-tramites")}>
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
                          <h4>{obtenerId(ultimaSolicitud)}</h4>
                          <p>{obtenerTipoPatente(ultimaSolicitud)}</p>
                          <span>
                            Última actualización:{" "}
                            {formatearFecha(
                              obtenerUltimaActualizacionRaw(ultimaSolicitud)
                            )}
                          </span>
                        </div>

                        <span
                          className={obtenerClaseEstado(
                            obtenerEstado(ultimaSolicitud)
                          )}
                        >
                          {obtenerTextoEstado(obtenerEstado(ultimaSolicitud))}
                        </span>

                        <button
                          className="detalle-button"
                          onClick={() =>
                            history.push(
                              `/usuario/solicitud/${obtenerId(ultimaSolicitud)}`
                            )
                          }
                        >
                          Ver detalle <IonIcon icon={arrowForwardOutline} />
                        </button>
                      </div>

                      {renderSeguimiento(ultimaSolicitud)}

                      <div className="info-alert">
                        <IonIcon icon={alertCircleOutline} />
                        <span>{obtenerMensajeAlerta(ultimaSolicitud)}</span>
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
                      onClick={() =>
                        history.push("/usuario/nueva-solicitud/patente")
                      }
                    >
                      <IonIcon icon={storefrontOutline} />
                      <strong>Patente comercial</strong>
                      <span>Solicita, renueva o consulta tu patente.</span>
                      <p>
                        Ir al trámite <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        history.push("/usuario/nueva-solicitud/circulacion")
                      }
                    >
                      <IonIcon icon={carOutline} />
                      <strong>Permiso de circulación</strong>
                      <span>Solicita o renueva tu permiso.</span>
                      <p>
                        Ir al trámite <IonIcon icon={arrowForwardOutline} />
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        history.push("/usuario/nueva-solicitud/obras")
                      }
                    >
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

                    <button onClick={() => history.push("/usuario/notificaciones")}>
                      Ver todas <IonIcon icon={arrowForwardOutline} />
                    </button>
                  </div>

                  <div className="notification-list">
                    {notificacionesRecientes.length > 0 ? (
                      notificacionesRecientes.map((notificacion) => (
                        <div className="notification-row" key={notificacion.id}>
                          <span
                            className={`notification-dot ${obtenerColorNotificacion(
                              notificacion.tipo
                            )}`}
                          ></span>

                          <IonIcon
                            icon={obtenerIconoNotificacion(notificacion.tipo)}
                          />

                          <strong>{notificacion.titulo}</strong>

                          <p>{notificacion.mensaje}</p>

                          <small>{notificacion.fecha}</small>
                        </div>
                      ))
                    ) : (
                      <div className="notification-row">
                        <span className="notification-dot green"></span>
                        <IonIcon icon={checkmarkCircleOutline} />
                        <strong>Sin notificaciones recientes</strong>
                        <p>No tienes avisos pendientes por revisar.</p>
                        <small>Actualizado</small>
                      </div>
                    )}
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
                    {ultimaSolicitud
                      ? formatearFecha(
                          obtenerUltimaActualizacionRaw(ultimaSolicitud)
                        )
                      : "Sin registros"}
                  </strong>

                  <p>
                    {ultimaSolicitud
                      ? `${obtenerTipoPatente(ultimaSolicitud)} (${obtenerId(
                          ultimaSolicitud
                        )})`
                      : "No existen solicitudes registradas."}
                  </p>

                  <span>
                    Estado actual:{" "}
                    {ultimaSolicitud
                      ? obtenerTextoEstado(obtenerEstado(ultimaSolicitud))
                      : "Sin estado"}
                  </span>

                  <button onClick={() => history.push("/usuario/mis-tramites")}>
                    Ver todo el historial{" "}
                    <IonIcon icon={arrowForwardOutline} />
                  </button>
                </section>

                <section className="side-card">
                  <h3>
                    <IonIcon icon={calendarOutline} />
                    Próximas acciones
                  </h3>

                  <button
                    className="action-row"
                    type="button"
                    onClick={irASubirDocumentos}
                  >
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

                  <button
                    className="action-row"
                    type="button"
                    onClick={() =>
                      history.push("/usuario/agendar-funcionario")
                    }
                  >
                    <div className="action-icon blue">
                      <IonIcon icon={calendarOutline} />
                    </div>

                    <div>
                      <strong>Citas programadas</strong>
                      <span>Sin citas registradas</span>
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
                      <span>{avisosNoLeidos} avisos sin leer</span>
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
