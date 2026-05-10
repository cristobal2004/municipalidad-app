import React from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { fingerPrintOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";
import "./LoginFuncionario.css";

const LoginFuncionario: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    authService.login("funcionario");
    history.push("/funcionario/inicio");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-funcionario-content">
        <div className="login-funcionario-wrapper">
          <header className="login-funcionario-header">
            <h1>Municipalidad de Santo Domingo</h1>
          </header>

          <main className="login-funcionario-background">
            

            <section className="login-funcionario-card">
              <h2>Iniciar Sesión</h2>

              <p className="login-funcionario-description">
                Ingresa para gestionar solicitudes y actualizar estados de trámites
              </p>

              <IonItem className="login-funcionario-input">
                <IonLabel position="stacked">Número de empleado</IonLabel>
                <IonInput placeholder="Ej: 12345678" />
              </IonItem>

              <IonItem className="login-funcionario-input">
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput type="password" placeholder="Ingresa tu contraseña" />
              </IonItem>

              <div className="login-funcionario-options">
                <label className="funcionario-remember-option">
                  <IonCheckbox />
                  <span>Recordar mis datos</span>
                </label>

                <button className="funcionario-forgot-button">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <IonButton
                expand="block"
                className="funcionario-main-button"
                onClick={handleLogin}
              >
                Ingresar
              </IonButton>

              <div className="funcionario-divider">
                <span></span>
                <p>O</p>
                <span></span>
              </div>

              <IonButton
              expand="block"
              className="webauthn-button"
              onClick={handleLogin}
            >
              <IonIcon icon={fingerPrintOutline} slot="start" />
              Iniciar con WebAuthn
            </IonButton>
            </section>
          </main>

          <footer className="login-funcionario-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginFuncionario;