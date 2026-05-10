import React from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  arrowBackOutline,
  addOutline,
  eyeOutline,
  cloudDownloadOutline,
  calendarOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./MisTramites.css";

const MisTramites: React.FC = () => {
  const history = useHistory();

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
              <h2>Resumen de mis Trámites</h2>

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
                  Nuevo Trámite
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
                    <tr>
                      <td>0001</td>
                      <td>18/04/26</td>
                      <td>
                        <span className="estado estado-proceso">En Proceso</span>
                      </td>
                      <td>Cristian Mejías</td>
                      <td>Atención Gral.</td>
                      <td className="observacion-normal">
                        En revisión de antecedentes.
                      </td>
                      <td>
                        <button
                          className="calendar-button"
                          onClick={() => history.push("/usuario/agendar/1")}
                        >
                          <IonIcon icon={calendarOutline} />
                        </button>
                      </td>
                      <td>
                        <button
                          className="accion-button"
                          onClick={() => history.push("/usuario/solicitud/1")}
                        >
                          <IonIcon icon={eyeOutline} />
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>0002</td>
                      <td>15/04/26</td>
                      <td>
                        <span className="estado estado-falta">
                          Falta Documentación
                        </span>
                      </td>
                      <td>María Barroso</td>
                      <td>Serv. Ciudadano</td>
                      <td className="observacion-alerta">
                        Subir copia de Cédula de Identidad.
                      </td>
                      <td>
                        <button
                          className="calendar-button"
                          onClick={() => history.push("/usuario/agendar/2")}
                        >
                          <IonIcon icon={calendarOutline} />
                        </button>
                      </td>
                      <td>
                        <button
                          className="accion-button"
                          onClick={() => history.push("/usuario/solicitud/2")}
                        >
                          <IonIcon icon={cloudDownloadOutline} />
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>0003</td>
                      <td>10/04/26</td>
                      <td>
                        <span className="estado estado-aprobado">Aprobado</span>
                      </td>
                      <td>Cristian Díaz</td>
                      <td>Finanzas</td>
                      <td className="observacion-normal">
                        Patente otorgada correctamente.
                      </td>
                      <td>
                        <button
                          className="calendar-button"
                          onClick={() => history.push("/usuario/agendar/3")}
                        >
                          <IonIcon icon={calendarOutline} />
                        </button>
                      </td>
                      <td>
                        <button className="accion-download">
                          <IonIcon icon={cloudDownloadOutline} />
                        </button>
                      </td>
                    </tr>
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
                  Agendar Con Funcionario
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