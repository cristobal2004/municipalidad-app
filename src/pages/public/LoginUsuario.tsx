import React, { useState } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";
import { usuariosService } from "../../services/usuariosService";
import "./LoginUsuario.css";

const LoginUsuario: React.FC = () => {
  const history = useHistory();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordarDatos, setRecordarDatos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const handleLogin = () => {
    setMensajeError("");

    if (!correo.trim() || !password.trim()) {
      setMensajeError("Debe ingresar correo electrónico y contraseña.");
      return;
    }

    const resultado = usuariosService.loginUsuario(correo, password);

    if (!resultado.ok) {
      setMensajeError(resultado.mensaje);
      return;
    }

    authService.login("usuario");
    history.push("/usuario/inicio");
  };

  const handleClaveUnica = () => {
    usuariosService.loginConClaveUnica();
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

              {mensajeError && (
                <div className="login-error-box">{mensajeError}</div>
              )}

              <IonItem className="login-input">
                <IonLabel position="stacked">Correo electrónico</IonLabel>
                <IonInput
                  value={correo}
                  type="email"
                  placeholder="nombre@ejemplo.cl"
                  onIonInput={(e) => setCorreo(e.detail.value ?? "")}
                />
              </IonItem>

              <IonItem className="login-input">
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput
                  value={password}
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  onIonInput={(e) => setPassword(e.detail.value ?? "")}
                />
              </IonItem>

              <div className="login-options">
                <label className="remember-option">
                  <IonCheckbox
                    checked={recordarDatos}
                    onIonChange={(e) => setRecordarDatos(e.detail.checked)}
                  />
                  <span>Recordar mis datos</span>
                </label>

                <button className="forgot-button" type="button">
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
                onClick={handleClaveUnica}
              >
                Iniciar sesión con ClaveÚnica
              </IonButton>

              <button
                className="guest-link"
                type="button"
                onClick={() => history.push("/")}
              >
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