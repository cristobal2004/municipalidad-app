import React, { useEffect, useState } from "react";
import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  arrowBackOutline,
  addOutline,
  eyeOutline,
  cloudDownloadOutline,
  calendarOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import "./MisTramites.css";

const MisTramites: React.FC = () => {
  const history = useHistory();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    const solicitudesGuardadas = solicitudesService.obtenerSolicitudes();
    setSolicitudes(solicitudesGuardadas);
  }, []);

  const obtenerClaseEstado = (estado: string) => {
    if (estado === "Aprobado") return "estado estado-aprobado";
    if (estado === "Falta Documentación") return "estado estado-falta";
    return "estado estado-proceso";
  };

  return (
    <IonPage>
      <IonContent fullscreen className="tramites-content">
        <div className="tramites-wrapper">
          <header className="tramites-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="tramites-user-actions">
              <span>Bienvenido, Cristóbal Rubilar</span>
              <button onClick={() => history.push("/")}>Cerrar Sesión</button>
            </div>
          </header>

          <main className="tramites-main">
            <aside className="tramites-logo-area">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Logo Municipalidad de Santo Domingo"
                className="tramites-logo"
              />
            </aside>

            <section className="tramites-card">
              <h2>Resumen de mis trámites</h2>

              <p className="tramites-description">
                Hola, Cristóbal Rubilar. Aquí puedes realizar el seguimiento en
                tiempo real de tus solicitudes, revisar documentos pendientes y
                descargar resoluciones oficiales de la Municipalidad de Santo
                Domingo, entre otras cosas.
              </p>

              <div className="tramites-title-row">
                <h3>Trámites realizados</h3>

                <IonButton
                  className="nuevo-tramite-button"
                  onClick={() => history.push("/usuario/seleccionar-tramite")}
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Nuevo trámite
                </IonButton>
              </div>

              <div className="tramites-table-container">
                <table className="tramites-table">
                  <thead>
                    <tr>
                      <th>ID Trámite</th>
                      <th>Fecha Recibo</th>
                      <th>Estado</th>
                      <th>Encargado</th>
                      <th>Área</th>
                      <th>Observaciones</th>
                      <th>Agendar con funcionario</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>{solicitud.id}</td>
                        <td>{solicitud.fechaRecibo}</td>
                        <td>
                          <span className={obtenerClaseEstado(solicitud.estado)}>
                            {solicitud.estado}
                          </span>
                        </td>
                        <td>{solicitud.encargado}</td>
                        <td>{solicitud.area}</td>
                        <td
                          className={
                            solicitud.estado === "Falta Documentación"
                              ? "observacion-alerta"
                              : "observacion-normal"
                          }
                        >
                          {solicitud.observacion}
                        </td>
                        <td>
                          <button
                            className="calendar-button"
                            onClick={() =>
                              history.push(`/usuario/agendar/${solicitud.id}`)
                            }
                          >
                            <IonIcon icon={calendarOutline} />
                          </button>
                        </td>
                        <td>
                          <button
                            className="accion-button"
                            onClick={() =>
                              history.push(`/usuario/solicitud/${solicitud.id}`)
                            }
                          >
                            <IonIcon
                              icon={
                                solicitud.estado === "Aprobado"
                                  ? cloudDownloadOutline
                                  : eyeOutline
                              }
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="tramites-actions-bottom">
                <IonButton
                  className="volver-button"
                  onClick={() => history.push("/usuario/inicio")}
                >
                  <IonIcon icon={arrowBackOutline} slot="start" />
                  Volver atrás
                </IonButton>

                <IonButton
                  className="agendar-button"
                  onClick={() => history.push("/usuario/agendar/1")}
                >
                  <IonIcon icon={calendarOutline} slot="start" />
                  Agendar con funcionario
                </IonButton>
              </div>
            </section>
          </main>

          <footer className="tramites-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MisTramites;