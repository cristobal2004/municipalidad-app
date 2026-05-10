import React, { useState } from "react";
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
import { funcionariosService } from "../../services/funcionariosService";
import "./LoginFuncionario.css";

const LoginFuncionario: React.FC = () => {
  const history = useHistory();

  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [password, setPassword] = useState("");
  const [recordarDatos, setRecordarDatos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const handleLogin = () => {
    setMensajeError("");

    if (!numeroEmpleado.trim() || !password.trim()) {
      setMensajeError("Debe ingresar número de empleado y contraseña.");
      return;
    }

    const resultado = funcionariosService.loginFuncionario(
      numeroEmpleado,
      password
    );

    if (!resultado.ok) {
      setMensajeError(resultado.mensaje);
      return;
    }

    authService.login("funcionario");
    history.push("/funcionario/inicio");
  };

  const handleWebAuthn = () => {
    funcionariosService.loginConWebAuthn();
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
                Ingresa para gestionar solicitudes y actualizar estados de
                trámites.
              </p>

              {mensajeError && (
                <div className="login-funcionario-error-box">
                  {mensajeError}
                </div>
              )}

              <IonItem className="login-funcionario-input">
                <IonLabel position="stacked">Número de empleado</IonLabel>
                <IonInput
                  value={numeroEmpleado}
                  placeholder="Ej: 12345678"
                  onIonInput={(e) =>
                    setNumeroEmpleado(e.detail.value ?? "")
                  }
                />
              </IonItem>

              <IonItem className="login-funcionario-input">
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput
                  value={password}
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  onIonInput={(e) => setPassword(e.detail.value ?? "")}
                />
              </IonItem>

              <div className="login-funcionario-options">
                <label className="login-funcionario-remember">
                  <IonCheckbox
                    checked={recordarDatos}
                    onIonChange={(e) => setRecordarDatos(e.detail.checked)}
                  />
                  <span>Recordar mis datos</span>
                </label>

                <button className="login-funcionario-forgot">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <IonButton
                expand="block"
                className="login-funcionario-main-button"
                onClick={handleLogin}
              >
                Ingresar
              </IonButton>

              <div className="login-funcionario-divider">
                <span></span>
                <p>O</p>
                <span></span>
              </div>

              <IonButton
                expand="block"
                className="login-funcionario-webauthn-button"
                onClick={handleWebAuthn}
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