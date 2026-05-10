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
import { keyOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";
import "./LoginUsuario.css";


const LoginUsuario: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    authService.login("usuario");
    history.push("/usuario/inicio");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-user-content">
        <div className="login-page-wrapper">
          <header className="login-header">
            <h1>Municipalidad de Santo Domingo</h1>
          </header>

          <main className="login-background">
            <button
              className="register-pill"
              onClick={() => history.push("/registro")}
            >
              ¿No tienes cuenta? <span>Regístrate aquí</span>
            </button>

            <section className="login-card">
              <h2>Iniciar Sesión</h2>

              <p className="login-description">
                Ingresa para revisar el estado de tus solicitudes y documentos.
              </p>

              <IonItem className="login-input">
                <IonLabel position="stacked">Correo electrónico</IonLabel>
                <IonInput type="email" placeholder="nombre@ejemplo.cl" />
              </IonItem>

              <IonItem className="login-input">
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput type="password" placeholder="Ingresa tu contraseña" />
              </IonItem>

              <div className="login-options">
                <label className="remember-option">
                  <IonCheckbox />
                  <span>Recordar mis datos</span>
                </label>

                <button className="forgot-button">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <IonButton
                expand="block"
                className="login-main-button"
                onClick={handleLogin}
              >
                Ingresar
              </IonButton>

              <div className="login-divider">
                <span></span>
                <p>O</p>
                <span></span>
              </div>

              <IonButton
                expand="block"
                className="clave-button"
                onClick={handleLogin}
              >
                <IonIcon icon={keyOutline} slot="start" />
                Iniciar sesión con ClaveÚnica
              </IonButton>

              <button className="guest-link" onClick={() => history.push("/")}>
                Entrar como invitado
              </button>
            </section>
          </main>

          <footer className="login-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginUsuario;