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
import "./LoginUsuario.css";

const LoginUsuario: React.FC = () => {
  const history = useHistory();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordarDatos, setRecordarDatos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setMensajeError("");

    if (!correo.trim() || !password.trim()) {
      setMensajeError("Debe ingresar correo electrónico y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const usuario = await authService.login({
        correo,
        password,
      });

      if (usuario.rol !== "usuario") {
        authService.logout();
        setMensajeError("Esta cuenta no corresponde a un usuario ciudadano.");
        return;
      }

      history.push("/usuario/inicio");
    } catch (error: any) {
      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo iniciar sesión. Verifica tus credenciales.";

      setMensajeError(mensajeBackend);
    } finally {
      setCargando(false);
    }
  };

  const handleClaveUnica = () => {
    setMensajeError(
      "La autenticación con ClaveÚnica quedará disponible en una integración futura. Para EP2 se usará inicio de sesión con correo y contraseña."
    );
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
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
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