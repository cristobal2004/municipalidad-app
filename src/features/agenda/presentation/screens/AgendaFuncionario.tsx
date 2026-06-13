import React, { useEffect, useState } from "react";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  arrowBackOutline,
  calendarOutline,
  timeOutline,
  documentTextOutline,
  personOutline,
  mailOutline,
  briefcaseOutline,
  eyeOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

import api from "../../../../core/data/http/apiClient";
import "./AgendaFuncionario.css";

interface Agendamiento {
  [key: string]: any;
}

const AgendaFuncionario: React.FC = () => {
  const history = useHistory();

  const [agendamientos, setAgendamientos] = useState<Agendamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarAgendamientos = async (event?: any) => {
    try {
      setError("");

      if (!event) {
        setCargando(true);
      }

      const respuesta = await api.get("/solicitudes/mis-agendamientos");

      console.log("Agendamientos funcionario:", respuesta.data);

      const data = respuesta.data;

      const lista =
        data?.agendamientos ||
        data?.data ||
        data?.resultado ||
        data?.items ||
        data ||
        [];

      setAgendamientos(Array.isArray(lista) ? lista : []);
    } catch (errorBackend: any) {
      console.error("Error al cargar agenda funcionario:", errorBackend);

      const mensaje =
        errorBackend.response?.data?.mensaje ||
        errorBackend.response?.data?.error ||
        errorBackend.message ||
        "No fue posible cargar la agenda del funcionario.";

      setError(mensaje);
      setAgendamientos([]);
    } finally {
      setCargando(false);

      if (event) {
        event.detail.complete();
      }
    }
  };

  useEffect(() => {
    cargarAgendamientos();
  }, []);

  const obtenerValor = (...valores: any[]) => {
    for (const valor of valores) {
      if (valor !== undefined && valor !== null && valor !== "") {
        return valor;
      }
    }

    return "";
  };

  const obtenerFechaHora = (item: Agendamiento) => {
    return obtenerValor(
      item.fecha_hora,
      item.fechaHora,
      item.fecha,
      item.fecha_agendada,
      item.fechaAgendada,
      item.fecha_cita,
      item.fechaCita,
      item.horario,
      item.hora,
      item.created_at
    );
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "Fecha no disponible";

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return fecha;
    }

    return fechaConvertida.toLocaleString("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerCodigoSolicitud = (item: Agendamiento) => {
    return obtenerValor(
      item.codigo_solicitud,
      item.codigoSolicitud,
      item.solicitud_codigo,
      item.solicitudCodigo,
      item.codigo,
      item.solicitud?.codigo,
      item.solicitud?.codigo_solicitud,
      item.solicitud?.codigoSolicitud,
      item.solicitud_id,
      item.solicitudId,
      item.id_solicitud,
      item.idSolicitud
    );
  };

  const obtenerCodigoMostrar = (item: Agendamiento) => {
    const codigo = obtenerCodigoSolicitud(item);

    if (!codigo) {
      return "SIN-CÓDIGO";
    }

    if (String(codigo).startsWith("SOL-")) {
      return codigo;
    }

    return codigo;
  };

  const obtenerTipoTramite = (item: Agendamiento) => {
    return (
      obtenerValor(
        item.tipo_tramite,
        item.tipoTramite,
        item.tramite,
        item.tipo_patente,
        item.tipoPatente,
        item.nombre_tramite,
        item.nombreTramite,
        item.solicitud?.tipo_tramite,
        item.solicitud?.tipoTramite,
        item.solicitud?.tramite,
        item.solicitud?.tipo_patente,
        item.solicitud?.tipoPatente
      ) || "Trámite no especificado"
    );
  };

  const obtenerNombreCiudadano = (item: Agendamiento) => {
    return (
      obtenerValor(
        item.ciudadano_nombre,
        item.ciudadanoNombre,
        item.nombre_ciudadano,
        item.nombreCiudadano,
        item.usuario_nombre,
        item.usuarioNombre,
        item.solicitante_nombre,
        item.solicitanteNombre,
        item.nombre_solicitante,
        item.nombreSolicitante,
        item.nombre_usuario,
        item.nombreUsuario,
        item.usuario?.nombre,
        item.solicitante?.nombre,
        item.ciudadano?.nombre,
        item.solicitud?.usuario?.nombre,
        item.solicitud?.solicitante?.nombre
      ) || "Ciudadano no especificado"
    );
  };

  const obtenerCorreoCiudadano = (item: Agendamiento) => {
    return (
      obtenerValor(
        item.ciudadano_correo,
        item.ciudadanoCorreo,
        item.correo_ciudadano,
        item.correoCiudadano,
        item.usuario_correo,
        item.usuarioCorreo,
        item.solicitante_correo,
        item.solicitanteCorreo,
        item.correo_solicitante,
        item.correoSolicitante,
        item.email,
        item.correo,
        item.usuario?.correo,
        item.usuario?.email,
        item.solicitante?.correo,
        item.solicitante?.email,
        item.ciudadano?.correo,
        item.ciudadano?.email,
        item.solicitud?.usuario?.correo,
        item.solicitud?.usuario?.email
      ) || "Correo no disponible"
    );
  };

  const obtenerInfoFuncionario = (item: Agendamiento) => {
    const area = obtenerValor(
      item.funcionario_area,
      item.funcionarioArea,
      item.area_funcionario,
      item.areaFuncionario,
      item.area,
      item.funcionario?.area,
      item.solicitud?.funcionario?.area
    );

    const cargo = obtenerValor(
      item.funcionario_cargo,
      item.funcionarioCargo,
      item.cargo_funcionario,
      item.cargoFuncionario,
      item.cargo,
      item.funcionario?.cargo,
      item.solicitud?.funcionario?.cargo
    );

    if (area && cargo) return `${area} / ${cargo}`;
    if (area) return area;
    if (cargo) return cargo;

    return "Área o cargo no especificado";
  };

  const normalizarEstado = (estado?: string) => {
    return String(estado || "agendada")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const irADetalleSolicitud = (item: Agendamiento) => {
    const codigo = obtenerCodigoSolicitud(item);

    if (!codigo) {
      return;
    }

    history.push(`/funcionario/solicitud/${encodeURIComponent(codigo)}`, {
      volverA: "/funcionario/agenda",
      textoVolver: "Volver a agenda",
      textoOrigen: "Agenda",
    });
  };

  const volverAlPanelFuncionario = () => {
    history.push("/funcionario/inicio");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="agenda-funcionario-toolbar">
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              className="agenda-back-button"
              onClick={volverAlPanelFuncionario}
            >
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>

          <IonTitle>Agenda funcionario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="agenda-funcionario-page">
        <IonRefresher slot="fixed" onIonRefresh={cargarAgendamientos}>
          <IonRefresherContent pullingText="Desliza para actualizar" />
        </IonRefresher>

        <section className="agenda-funcionario-hero">
          <div>
            <p className="agenda-funcionario-eyebrow">Gestión de citas</p>
            <h1>Mi agenda</h1>
            <p>
              Revisa las citas agendadas por los ciudadanos para las solicitudes
              que tienes asignadas.
            </p>
          </div>

          <div className="agenda-funcionario-hero-icon">
            <IonIcon icon={calendarOutline} />
          </div>
        </section>

        {cargando && (
          <div className="agenda-funcionario-loading">
            <IonSpinner name="crescent" />
            <p>Cargando agenda...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="agenda-funcionario-error">
            <IonIcon icon={alertCircleOutline} />
            <h2>No se pudo cargar la agenda</h2>
            <p>{error}</p>

            <IonButton onClick={() => cargarAgendamientos()}>
              Intentar nuevamente
            </IonButton>
          </div>
        )}

        {!cargando && !error && agendamientos.length === 0 && (
          <div className="agenda-funcionario-empty">
            <IonIcon icon={calendarOutline} />
            <h2>No tienes citas agendadas</h2>
            <p>
              Cuando un ciudadano agende una atención asociada a una de tus
              solicitudes, aparecerá en esta sección.
            </p>
          </div>
        )}

        {!cargando && !error && agendamientos.length > 0 && (
          <section className="agenda-funcionario-list">
            {agendamientos.map((item, index) => {
              const codigoSolicitud = obtenerCodigoMostrar(item);
              const fechaHora = obtenerFechaHora(item);
              const estadoNormalizado = normalizarEstado(item.estado);

              return (
                <IonCard
                  className="agenda-funcionario-card"
                  key={item.id || index}
                >
                  <IonCardContent>
                    <div className="agenda-funcionario-card-header">
                      <div>
                        <p className="agenda-funcionario-card-label">
                          Fecha y hora
                        </p>

                        <h2>
                          <IonIcon icon={timeOutline} />
                          {formatearFecha(fechaHora)}
                        </h2>
                      </div>

                      <IonBadge
                        className={`agenda-funcionario-badge estado-${estadoNormalizado}`}
                      >
                        {item.estado || "agendada"}
                      </IonBadge>
                    </div>

                    <div className="agenda-funcionario-info-grid">
                      <div className="agenda-funcionario-info-item">
                        <IonIcon icon={documentTextOutline} />
                        <div>
                          <span>Código de solicitud</span>
                          <strong>{codigoSolicitud}</strong>
                        </div>
                      </div>

                      <div className="agenda-funcionario-info-item">
                        <IonIcon icon={documentTextOutline} />
                        <div>
                          <span>Tipo de trámite</span>
                          <strong>{obtenerTipoTramite(item)}</strong>
                        </div>
                      </div>

                      <div className="agenda-funcionario-info-item">
                        <IonIcon icon={personOutline} />
                        <div>
                          <span>Ciudadano</span>
                          <strong>{obtenerNombreCiudadano(item)}</strong>
                        </div>
                      </div>

                      <div className="agenda-funcionario-info-item">
                        <IonIcon icon={mailOutline} />
                        <div>
                          <span>Correo ciudadano</span>
                          <strong>{obtenerCorreoCiudadano(item)}</strong>
                        </div>
                      </div>

                      <div className="agenda-funcionario-info-item agenda-funcionario-info-full">
                        <IonIcon icon={briefcaseOutline} />
                        <div>
                          <span>Área / cargo funcionario</span>
                          <strong>{obtenerInfoFuncionario(item)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="agenda-funcionario-actions">
                      <IonButton
                        expand="block"
                        onClick={() => irADetalleSolicitud(item)}
                        disabled={!obtenerCodigoSolicitud(item)}
                      >
                        <IonIcon icon={eyeOutline} slot="start" />
                        Ver solicitud
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </section>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AgendaFuncionario;