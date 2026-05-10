import React from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  carOutline,
  businessOutline,
  gridOutline,
  menuOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";

const PaginaPrincipal: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen className="muni-home-content">
        <div className="muni-page-wrapper">
          <header className="muni-header">
            <h1>Municipalidad de Santo Domingo</h1>
            <IonIcon icon={menuOutline} className="muni-menu-icon" />
          </header>

          <main className="muni-layout">
            <section className="muni-hero">
            

              <div className="muni-hero-text">
                <h2>Bienvenidos a Santo Domingo</h2>
                <p>Transformación digital al servicio de la comunidad</p>
                <button className="office-button">Oficina Virtual</button>
              </div>

              <div className="services-section">
                <h3>Servicios Frecuentes</h3>

                <div className="services-grid">
                  <button className="service-card">
                    <IonIcon icon={carOutline} />
                    <span>Permisos de Circulación</span>
                  </button>

                  <button className="service-card">
                    <IonIcon icon={businessOutline} />
                    <span>Patentes Comerciales</span>
                  </button>

                  <button className="service-card">
                    <IonIcon icon={gridOutline} />
                    <span>Obras Municipales</span>
                  </button>
                </div>
              </div>
            </section>

            <aside className="login-sidebar">
              <IonButton
                expand="block"
                className="sidebar-button"
                onClick={() => history.push("/login-usuario")}
              >
                &gt; Iniciar Sesión Usuario
              </IonButton>

              <IonButton
                expand="block"
                className="sidebar-button"
                onClick={() => history.push("/login-funcionario")}
              >
                &gt; Iniciar Sesión Funcionario
              </IonButton>
            </aside>
          </main>

          <footer className="muni-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaginaPrincipal;