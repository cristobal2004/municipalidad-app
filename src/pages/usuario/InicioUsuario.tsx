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
  notificationsOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";
import "./InicioUsuario.css";

const InicioUsuario: React.FC = () => {
  const history = useHistory();

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="usuario-home-content">
        <div className="usuario-page-wrapper">
          <header className="usuario-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="usuario-top-actions">
              <button
                className="notification-button"
                onClick={() => history.push("/usuario/notificaciones")}
                title="Tienes notificaciones pendientes"
              >
                <IonIcon icon={notificationsOutline} />
                <span className="notification-dot">3</span>
              </button>

              <span className="usuario-welcome">Bienvenido, Cristóbal Rubilar</span>

              <button className="logout-small-button" onClick={cerrarSesion}>
                Cerrar Sesión
              </button>
            </div>
          </header>

          <main className="usuario-layout">
            <section className="usuario-hero">
              <div className="usuario-hero-text">
                <h2>Bienvenidos a Santo Domingo</h2>
                <p>Transformación digital al servicio de la comunidad</p>
                <button className="usuario-office-button">Oficina Virtual</button>
              </div>

              <div className="usuario-services-section">
                <h3>Servicios Frecuentes</h3>

                <div className="usuario-services-grid">
                  <button className="usuario-service-card">
                    <IonIcon icon={carOutline} />
                    <span>Permisos de Circulación</span>
                  </button>

                  <button className="usuario-service-card">
                    <IonIcon icon={businessOutline} />
                    <span>Patentes Comerciales</span>
                  </button>

                  <button className="usuario-service-card">
                    <IonIcon icon={gridOutline} />
                    <span>Obras Municipales</span>
                  </button>
                </div>
              </div>
            </section>

            <aside className="usuario-sidebar">
              <div className="usuario-profile">
                <IonIcon icon={personCircleOutline} className="usuario-avatar" />

                <div className="usuario-profile-data">
                  <p><strong>Nombre:</strong> Cristóbal Rubilar</p>
                  <p><strong>Tipo de Usuario:</strong> Ciudadano</p>
                  <p><strong>Rut:</strong> 69.671.308-k</p>
                  <p><strong>Usuario Verificado</strong></p>
                </div>
              </div>

              <div className="usuario-role-label">CIUDADANO</div>

              <IonButton
                expand="block"
                className="usuario-sidebar-button"
              >
                &gt; Actualizar Datos
              </IonButton>

              <IonButton
                expand="block"
                className="usuario-sidebar-button"
                onClick={() => history.push("/usuario/agendar/1")}
              >
                &gt; Agendar Hora
              </IonButton>

              <IonButton
                expand="block"
                className="usuario-sidebar-button"
                onClick={() => history.push("/usuario/seleccionar-tramite")}
              >
                &gt; Realizar Trámites
              </IonButton>

              <IonButton
                expand="block"
                className="usuario-sidebar-button"
                onClick={() => history.push("/usuario/mis-tramites")}
              >
                &gt; Mis Trámites
              </IonButton>
            </aside>
          </main>

          <footer className="usuario-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicioUsuario;