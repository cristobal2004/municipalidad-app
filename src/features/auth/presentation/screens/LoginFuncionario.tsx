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
import { authService } from "../../composition/authService";
import "./LoginFuncionario.css";

const LoginFuncionario: React.FC = () => {
  const history = useHistory();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordarDatos, setRecordarDatos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setMensajeError("");

    if (!correo.trim() || !password.trim()) {
      setMensajeError("Debe ingresar correo institucional y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const usuario = await authService.login({
        correo: correo.trim(),
        password,
      });

      const rolUsuario = String(usuario.rol || "")
        .trim()
        .toLowerCase();

      console.log("Usuario recibido en login funcionario:", usuario);
      console.log("Rol recibido:", rolUsuario);

      if (rolUsuario !== "funcionario") {
        authService.logout();
        setMensajeError("Esta cuenta no corresponde a un funcionario municipal.");
        return;
      }

      history.push("/funcionario/inicio");
    } catch (error: any) {
      console.error("Error login funcionario:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo iniciar sesión. Verifica tus credenciales.";

      setMensajeError(mensajeBackend);
    } finally {
      setCargando(false);
    }
  };

  const handleWebAuthn = () => {
    setMensajeError(
      "La autenticación con WebAuthn quedará disponible en una integración futura. Para EP2 se usará inicio de sesión con correo institucional y contraseña."
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-funcionario-content">
        <div className="login-funcionario-wrapper">
          <header className="login-funcionario-header">
            <h1>Municipalidad de Santo Domingo</h1>
          </header>

          <main className="login-funcionario-background">
            
            <IonButton
              className="back-button"
              onClick={() => history.push("/")}>
              ← Volver
            </IonButton>

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
                <IonLabel position="stacked">Correo institucional</IonLabel>
                <IonInput
                  value={correo}
                  type="email"
                  placeholder="funcionario@santodomingo.cl"
                  onIonInput={(e) => setCorreo(e.detail.value ?? "")}
                />
              </IonItem>

              <IonItem className="login-funcionario-input">
                <IonLabel position="stacked">Contraseña</IonLabel>
                <IonInput
                  value={password}
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  onIonInput={(e) => setPassword(e.detail.value ?? "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
              </IonItem>

              <div className="login-funcionario-options">
                <label className="funcionario-remember-option">
                  <IonCheckbox
                    checked={recordarDatos}
                    onIonChange={(e) => setRecordarDatos(e.detail.checked)}
                  />
                  <span>Recordar mis datos</span>
                </label>
                

                <button className="funcionario-forgot-button" type="button">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <IonButton
                expand="block"
                className="login-funcionario-main-button"
                onClick={handleLogin}
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
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