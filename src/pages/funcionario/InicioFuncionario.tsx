import React from "react";
import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  businessOutline,
  carOutline,
  gridOutline,
  logOutOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";
import { funcionariosService } from "../../services/funcionariosService";
import "./InicioFuncionario.css";

const InicioFuncionario: React.FC = () => {
  const history = useHistory();

  const funcionarioActual = funcionariosService.obtenerFuncionarioActual();

  const nombreFuncionario = funcionarioActual?.nombre || "Funcionario Municipal";
  const areaFuncionario = funcionarioActual?.area || "Área no informada";
  const cargoFuncionario = funcionarioActual?.cargo || "Funcionario";
  const numeroEmpleado = funcionarioActual?.numeroEmpleado || "No informado";

  const cerrarSesion = () => {
    funcionariosService.cerrarSesionFuncionario();
    authService.logout();
    history.push("/");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="funcionario-home-content">
        <div className="funcionario-page-wrapper">
          <header className="funcionario-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="funcionario-top-actions">
              <span className="panel-label">Panel Funcionario</span>

              <span className="funcionario-welcome">
                {nombreFuncionario}
              </span>

              <button className="logout-small-button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>

              <button className="menu-button">☰</button>
            </div>
          </header>

          <main className="funcionario-layout">
            <section className="funcionario-hero">
              <aside className="funcionario-logo-area">
                <img
                  src="/assets/Estandar-Muni.png"
                  alt="Logo Municipalidad de Santo Domingo"
                  className="funcionario-logo"
                />
              </aside>

              <div className="funcionario-hero-text">
                <h2>Bienvenidos a Santo Domingo</h2>
                <p>Transformación digital al servicio de la comunidad</p>
                <button className="funcionario-office-button">
                  Oficina Virtual
                </button>
              </div>

              <div className="funcionario-services-section">
                <h3>Servicios Frecuentes</h3>

                <div className="funcionario-services-grid">
                  <button className="funcionario-service-card">
                    <IonIcon icon={carOutline} />
                    <span>Permisos de Circulación</span>
                  </button>

                  <button className="funcionario-service-card">
                    <IonIcon icon={businessOutline} />
                    <span>Patentes Comerciales</span>
                  </button>

                  <button className="funcionario-service-card">
                    <IonIcon icon={gridOutline} />
                    <span>Obras Municipales</span>
                  </button>
                </div>
              </div>
            </section>

            <aside className="funcionario-sidebar">
              <div className="funcionario-profile">
                <IonIcon
                  icon={personCircleOutline}
                  className="funcionario-avatar"
                />

                <div className="funcionario-profile-data">
                  <p>
                    <strong>Nombre:</strong> {nombreFuncionario}
                  </p>
                  <p>
                    <strong>Cargo:</strong> {cargoFuncionario}
                  </p>
                  <p>
                    <strong>Área:</strong> {areaFuncionario}
                  </p>
                  <p>
                    <strong>N° empleado:</strong> {numeroEmpleado}
                  </p>
                </div>
              </div>

              <div className="funcionario-role-label">
                FUNCIONARIO
              </div>

              <IonButton
                expand="block"
                className="funcionario-sidebar-button"
              >
                &gt; Actualizar Datos
              </IonButton>

              <IonButton
                expand="block"
                className="funcionario-sidebar-button"
                onClick={() => history.push("/funcionario/solicitudes")}
              >
                &gt; Solicitudes Asignadas
              </IonButton>

              <IonButton
                expand="block"
                className="funcionario-sidebar-button"
                onClick={() => history.push("/funcionario/reportes")}
              >
                &gt; Reporte de Solicitudes
              </IonButton>

              <IonButton
                expand="block"
                className="funcionario-sidebar-button"
                onClick={cerrarSesion}
              >
                &gt; Cerrar Sesión
              </IonButton>
            </aside>
          </main>

          <footer className="funcionario-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InicioFuncionario;