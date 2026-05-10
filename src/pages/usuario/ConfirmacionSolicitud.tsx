import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  arrowBackOutline,
  arrowForwardOutline,
  addOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./ConfirmacionSolicitud.css";

const ConfirmacionSolicitud: React.FC = () => {
  const history = useHistory();
  const [solicitudId, setSolicitudId] = useState("SOL-2026-0001");

  useEffect(() => {
    const ultimaSolicitud = localStorage.getItem("ultima_solicitud_id");

    if (ultimaSolicitud) {
      setSolicitudId(ultimaSolicitud);
    }
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="confirmacion-content">
        <div className="confirmacion-wrapper">
          <header className="confirmacion-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="confirmacion-user-actions">
              <span>Trámites Ciudadanos</span>
            </div>
          </header>

          <main className="confirmacion-main">
            <aside className="confirmacion-logo-area">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Logo Municipalidad de Santo Domingo"
                className="confirmacion-logo"
              />
            </aside>

            <section className="confirmacion-card">
              <h2>Ingreso de Nueva Solicitud</h2>

              <p className="confirmacion-description">
                Complete los campos a continuación para procesar su trámite.
                <span> Los campos con * son obligatorios.</span>
              </p>

              <div className="confirmacion-message-box">
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="confirmacion-check-icon"
                />

                <h3>Muchas Gracias</h3>

                <p>
                  Su solicitud ha sido registrada con el ID N°{" "}
                  <strong>{solicitudId}</strong>, puede visualizar su estado en
                  el siguiente{" "}
                  <button
                    className="confirmacion-link"
                    onClick={() => history.push(`/usuario/solicitud/${solicitudId}`)}
                  >
                    link
                  </button>
                </p>
              </div>

              <div className="confirmacion-actions">
                <IonButton
                  className="confirmacion-back-button"
                  onClick={() => history.push("/usuario/nueva-solicitud/patente")}
                >
                  <IonIcon icon={arrowBackOutline} slot="start" />
                  Volver atrás
                </IonButton>

                <div className="confirmacion-right-actions">
                  <IonButton
                    className="confirmacion-new-button"
                    onClick={() => history.push("/usuario/seleccionar-tramite")}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Nuevo Trámite
                  </IonButton>

                  <IonButton
                    className="confirmacion-continue-button"
                    onClick={() => history.push("/usuario/mis-tramites")}
                  >
                    Continuar
                    <IonIcon icon={arrowForwardOutline} slot="end" />
                  </IonButton>
                </div>
              </div>
            </section>
          </main>

          <footer className="confirmacion-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionSolicitud;