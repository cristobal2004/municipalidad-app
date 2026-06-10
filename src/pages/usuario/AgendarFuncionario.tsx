import React, { useEffect, useMemo, useState } from "react";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from "@ionic/react";
import {
  alertCircleOutline,
  arrowBackOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  locationOutline,
  personCircleOutline,
  timeOutline,
} from "ionicons/icons";
import { useHistory, useLocation, useParams } from "react-router-dom";

import api from "../../services/api";
import type { Solicitud } from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./AgendarFuncionario.css";
import { feriadosService, type Feriado } from "../../services/feriadosService";

interface AgendamientoResponse {
  id: number;
  solicitudId: number;
  solicitudCodigo: string;
  codigoSolicitud: string;
  fechaHora: string;
  estado: string;
  funcionarioNombre?: string;
  funcionarioArea?: string;
  funcionarioCargo?: string;
  tramite?: string;
}

const validarFechaAntesDeAgendar = async (fecha: string) => {
  const resultado = await feriadosService.verificarFecha(fecha);

  if (resultado.esFeriado) {
    throw new Error(
      `No se puede agendar en feriado: ${
        resultado.feriado?.localName || "feriado legal"
      }.`
    );
  }
};

const AgendarFuncionario: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useParams<{ id?: string; solicitudId?: string }>();

  const queryParams = new URLSearchParams(location.search);

  const idDesdeRuta =
    params.id ||
    params.solicitudId ||
    queryParams.get("solicitudId") ||
    queryParams.get("codigo") ||
    "";

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<string>(idDesdeRuta);
  const [fechaHora, setFechaHora] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  const obtenerValor = (objeto: any, campo: string, respaldo = "") => {
    const valor = objeto?.[campo];

    if (valor === undefined || valor === null || valor === "") {
      return respaldo;
    }

    return valor;
  };

  const obtenerIdSolicitud = (solicitud: Solicitud | any) => {
    return (
      obtenerValor(solicitud, "codigo") ||
      obtenerValor(solicitud, "solicitudId") ||
      obtenerValor(solicitud, "id") ||
      ""
    );
  };

  const obtenerNombreSolicitud = (solicitud: Solicitud | any) => {
    const codigo = obtenerIdSolicitud(solicitud);

    const tramite =
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      "Trámite municipal";

    const funcionario =
      obtenerValor(solicitud, "funcionarioAsignado") ||
      obtenerValor(solicitud, "encargado") ||
      "Funcionario municipal";

    return `${codigo} · ${tramite} · ${funcionario}`;
  };

  const formatearFechaHora = (fecha: string) => {
    if (!fecha) return "Sin fecha";

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

  const obtenerFechaIso = (fechaIso: string) => {
    return String(fechaIso || "").slice(0, 10);
  };

  const esDomingo = (fechaIso: string) => {
    const fecha = obtenerFechaIso(fechaIso);

    if (!fecha) {
      return false;
    }

    return new Date(`${fecha}T12:00:00`).getDay() === 0;
  };

  const obtenerFeriado = (fechaIso: string) => {
    const fecha = obtenerFechaIso(fechaIso);
    return feriados.find((feriado) => feriado.date === fecha);
  };

  const fechaEstaDisponible = (fechaIso: string) => {
    return !esDomingo(fechaIso) && !obtenerFeriado(fechaIso);
  };

  const resaltarFechaNoDisponible = (fechaIso: string) => {
    if (esDomingo(fechaIso) || obtenerFeriado(fechaIso)) {
      return {
        textColor: "#991b1b",
        backgroundColor: "#fee2e2",
        border: "1px solid #ef4444",
      };
    }

    return undefined;
  };

  const solicitudActual = useMemo(() => {
    return solicitudes.find(
      (solicitud) => obtenerIdSolicitud(solicitud) === solicitudSeleccionada
    );
  }, [solicitudes, solicitudSeleccionada]);

  const fechaMinima = useMemo(() => {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() + 30);
    return ahora.toISOString();
  }, []);

  const cargarFeriados = async () => {
    try {
      const anioActual = new Date().getFullYear();
      const anioSiguiente = anioActual + 1;
      const feriadosPorAnio = await Promise.all([
        feriadosService.obtenerPorAnio(anioActual),
        feriadosService.obtenerPorAnio(anioSiguiente),
      ]);

      setFeriados(feriadosPorAnio.flat());
    } catch (error) {
      console.error("Error al cargar feriados:", error);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = authService.getUsuarioActual();

      if (!usuario) {
        history.push("/login-usuario");
        return;
      }

      const respuesta = await api.get("/solicitudes/mis-solicitudes");
      const solicitudesBackend = respuesta.data?.solicitudes || [];

      setSolicitudes(solicitudesBackend);

      if (!solicitudSeleccionada && solicitudesBackend.length > 0) {
        setSolicitudSeleccionada(obtenerIdSolicitud(solicitudesBackend[0]));
      }
    } catch (error: any) {
      console.error("Error al cargar solicitudes para agendar:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron cargar tus solicitudes.";

      setMensajeError(mensajeBackend);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    cargarFeriados();
  }, []);

  const registrarNotificacionAgendamiento = (
    agendamiento: AgendamientoResponse
  ) => {
    const notificacionesGuardadas = localStorage.getItem(
      "notificaciones_usuario"
    );

    let notificaciones: any[] = [];

    if (notificacionesGuardadas) {
      try {
        notificaciones = JSON.parse(notificacionesGuardadas);
      } catch {
        notificaciones = [];
      }
    }

    const codigoSolicitud =
      agendamiento.codigoSolicitud ||
      agendamiento.solicitudCodigo ||
      solicitudSeleccionada;

    const nuevaNotificacion = {
      id: `CITA-${Date.now()}`,
      solicitudId: codigoSolicitud,
      titulo: "Cita agendada correctamente",
      mensaje: `Tu cita para la solicitud ${codigoSolicitud} fue agendada para el ${formatearFechaHora(
        agendamiento.fechaHora
      )}.`,
      fecha: new Date().toLocaleString("es-CL"),
      leida: false,
      tipo: "cita",
      accionTexto: "Ver solicitud",
    };

    localStorage.setItem(
      "notificaciones_usuario",
      JSON.stringify([nuevaNotificacion, ...notificaciones])
    );

    window.dispatchEvent(new Event("notificacionesActualizadas"));
    window.dispatchEvent(new Event("solicitudesActualizadas"));
  };

  const confirmarAgendamiento = async () => {
    try {
      setMensajeError("");
      setMensajeExito("");

      if (!solicitudSeleccionada) {
        setMensajeError("Debes seleccionar una solicitud para agendar.");
        return;
      }

      if (!fechaHora) {
        setMensajeError("Debes seleccionar fecha y hora.");
        return;
      }

      const fechaSeleccionada = new Date(fechaHora);
      const ahora = new Date();

      if (Number.isNaN(fechaSeleccionada.getTime())) {
        setMensajeError("La fecha seleccionada no es válida.");
        return;
      }

      if (fechaSeleccionada <= ahora) {
        setMensajeError("Debes seleccionar una fecha y hora futura.");
        return;
      }

      setGuardando(true);

      const fechaParaValidar = obtenerFechaIso(fechaHora);

      if (esDomingo(fechaParaValidar)) {
        setMensajeError("No se puede agendar atención municipal un domingo.");
        return;
      }

      await validarFechaAntesDeAgendar(fechaParaValidar);

      const respuesta = await api.post(
        `/solicitudes/${solicitudSeleccionada}/agendamientos`,
        {
          fechaHora,
        }
      );

      const agendamiento = respuesta.data?.agendamiento;

      if (agendamiento) {
        registrarNotificacionAgendamiento(agendamiento);
      }

      setMensajeExito("Agendamiento creado correctamente.");

      setTimeout(() => {
        history.push("/usuario/mis-tramites");
      }, 1300);
    } catch (error: any) {
      console.error("Error al confirmar agendamiento:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo crear el agendamiento.";

      setMensajeError(mensajeBackend);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="agendar-content">
        <div className="agendar-wrapper">
          <header className="agendar-header">
            <div className="agendar-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <div>
                <h1>Municipalidad de Santo Domingo</h1>
                <p>Oficina virtual municipal</p>
              </div>
            </div>

            <button
              className="agendar-back-top"
              onClick={() => history.push("/usuario/mis-tramites")}
            >
              <IonIcon icon={arrowBackOutline} />
              Volver
            </button>
          </header>

          <main className="agendar-main">
            <section className="agendar-hero">
              <div>
                <span className="agendar-chip">
                  <IonIcon icon={calendarOutline} />
                  Agenda municipal
                </span>

                <h2>Agendar con funcionario</h2>

                <p>
                  Selecciona la solicitud asociada y escoge una fecha disponible
                  para coordinar la atención con el funcionario municipal.
                </p>
              </div>

              <div className="agendar-hero-icon">
                <IonIcon icon={calendarOutline} />
              </div>
            </section>

            <section className="agendar-grid">
              <article className="agendar-card">
                <div className="agendar-section-title">
                  <div>
                    <IonIcon icon={informationCircleOutline} />
                  </div>

                  <div>
                    <h3>Solicitud asociada</h3>
                    <p>El agendamiento quedará vinculado a este trámite.</p>
                  </div>
                </div>

                {cargando ? (
                  <div className="agendar-loading">
                    <IonSpinner />
                    <p>Cargando solicitudes...</p>
                  </div>
                ) : solicitudes.length === 0 ? (
                  <div className="agendar-empty">
                    <IonIcon icon={alertCircleOutline} />
                    <strong>No tienes solicitudes disponibles</strong>
                    <p>
                      Para agendar una cita, primero debes ingresar una
                      solicitud municipal.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="agendar-label">Selecciona solicitud</label>

                    <IonSelect
                      value={solicitudSeleccionada}
                      interface="popover"
                      placeholder="Selecciona una solicitud"
                      className="agendar-select"
                      onIonChange={(event) =>
                        setSolicitudSeleccionada(
                          String(event.detail.value || "")
                        )
                      }
                    >
                      {solicitudes.map((solicitud) => (
                        <IonSelectOption
                          key={obtenerIdSolicitud(solicitud)}
                          value={obtenerIdSolicitud(solicitud)}
                        >
                          {obtenerNombreSolicitud(solicitud)}
                        </IonSelectOption>
                      ))}
                    </IonSelect>

                    {solicitudActual && (
                      <div className="agendar-summary">
                        <div className="agendar-summary-row">
                          <IonIcon icon={calendarOutline} />
                          <div>
                            <span>Solicitud</span>
                            <strong>{obtenerIdSolicitud(solicitudActual)}</strong>
                          </div>
                        </div>

                        <div className="agendar-summary-row">
                          <IonIcon icon={personCircleOutline} />
                          <div>
                            <span>Funcionario asignado</span>
                            <strong>
                              {obtenerValor(
                                solicitudActual,
                                "funcionarioAsignado"
                              ) ||
                                obtenerValor(solicitudActual, "encargado") ||
                                "Funcionario municipal"}
                            </strong>
                          </div>
                        </div>

                        <div className="agendar-summary-row">
                          <IonIcon icon={businessOutline} />
                          <div>
                            <span>Área responsable</span>
                            <strong>
                              {obtenerValor(solicitudActual, "area") ||
                                "Área municipal"}
                            </strong>
                          </div>
                        </div>

                        <div className="agendar-summary-row">
                          <IonIcon icon={locationOutline} />
                          <div>
                            <span>Estado actual</span>
                            <strong>
                              {obtenerValor(solicitudActual, "estado") ||
                                "Ingresada"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </article>

              <article className="agendar-card">
                <div className="agendar-section-title">
                  <div>
                    <IonIcon icon={timeOutline} />
                  </div>

                  <div>
                    <h3>Fecha y hora</h3>
                    <p>Escoge un horario futuro para la atención.</p>
                  </div>
                </div>

                <div className="agendar-datetime-box">
                  <IonDatetime
                    presentation="date-time"
                    value={fechaHora}
                    min={fechaMinima}
                    isDateEnabled={fechaEstaDisponible}
                    highlightedDates={resaltarFechaNoDisponible}
                    onIonChange={(event) => {
                      const valor = event.detail.value;
                      const nuevaFecha = Array.isArray(valor)
                        ? valor[0] || ""
                        : valor || "";

                      if (!nuevaFecha) {
                        setFechaHora("");
                        return;
                      }

                      const fechaIso = obtenerFechaIso(nuevaFecha);
                      const feriado = obtenerFeriado(fechaIso);

                      if (esDomingo(fechaIso)) {
                        setMensajeError(
                          "No se puede agendar atención municipal un domingo."
                        );
                        return;
                      }

                      if (feriado) {
                        setMensajeError(
                          `No se puede agendar en feriado: ${feriado.localName}.`
                        );
                        return;
                      }

                      setMensajeError("");
                      setFechaHora(nuevaFecha);
                    }}
                  />
                </div>

                <div className="agendar-calendar-legend">
                  <span></span>
                  <p>Domingos y feriados no disponibles</p>
                </div>

                {fechaHora && (
                  <div className="agendar-selected-date">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <div>
                      <span>Fecha seleccionada</span>
                      <strong>{formatearFechaHora(fechaHora)}</strong>
                    </div>
                  </div>
                )}
              </article>
            </section>

            {mensajeError && (
              <section className="agendar-message agendar-message-error">
                <IonIcon icon={alertCircleOutline} />
                <p>{mensajeError}</p>
              </section>
            )}

            {mensajeExito && (
              <section className="agendar-message agendar-message-success">
                <IonIcon icon={checkmarkCircleOutline} />
                <p>{mensajeExito}</p>
              </section>
            )}

            <section className="agendar-info-card">
              <IonIcon icon={informationCircleOutline} />
              <div>
                <strong>Importante</strong>
                <p>
                  Al confirmar el agendamiento, se notificará al ciudadano y la
                  cita quedará registrada en la base de datos municipal.
                </p>
              </div>
            </section>

            <section className="agendar-actions">
              <IonButton
                expand="block"
                className="agendar-primary"
                onClick={confirmarAgendamiento}
                disabled={guardando || cargando || solicitudes.length === 0}
              >
                {guardando ? "Guardando agendamiento..." : "Confirmar agendamiento"}
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                className="agendar-secondary"
                onClick={() => history.push("/usuario/mis-tramites")}
                disabled={guardando}
              >
                Cancelar
              </IonButton>
            </section>
          </main>

          <footer className="agendar-footer">
            <span>© 2026 I. Municipalidad de Santo Domingo</span>
            <span>Sistema de gestión ciudadana</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AgendarFuncionario;
