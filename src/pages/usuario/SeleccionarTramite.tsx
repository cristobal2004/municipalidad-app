import React from "react";
import {
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  businessOutline,
  cardOutline,
  constructOutline,
  arrowBackOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./SeleccionarTramite.css";

const SeleccionarTramite: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen className="seleccionar-content">
        <div className="seleccionar-wrapper">
          <header className="seleccionar-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="seleccionar-user-actions">
              <span>Bienvenido, Cristóbal Rubilar</span>
              <button onClick={() => history.push("/")}>Cerrar Sesión</button>
            </div>
          </header>

          <main className="seleccionar-main">
            <aside className="seleccionar-logo-area">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Logo Municipalidad de Santo Domingo"
                className="seleccionar-logo"
              />
            </aside>

            <section className="seleccionar-card">
              <h2>Seleccione el Trámite a realizar</h2>

              <div className="tramite-list">
                <button
                  className="tramite-option"
                  onClick={() =>
                    history.push("/usuario/nueva-solicitud/patente")
                  }
                >
                  <IonIcon icon={businessOutline} />
                  <span>Solicitar Patente Comercial</span>
                </button>

                <button className="tramite-option">
                  <IonIcon icon={cardOutline} />
                  <span>Solicitud de Licencia de Conducir</span>
                </button>

                <button className="tramite-option">
                  <IonIcon icon={constructOutline} />
                  <span>Solicitud de Permiso de Construcción</span>
                </button>
              </div>

              <button
                className="seleccionar-volver-button"
                onClick={() => history.push("/usuario/inicio")}
              >
                <IonIcon icon={arrowBackOutline} />
                Volver al Inicio
              </button>
            </section>
          </main>

          <footer className="seleccionar-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SeleccionarTramite;