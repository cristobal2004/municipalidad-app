import React, { useState } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { authService } from "../../composition/authService";
import "./RegistroUsuario.css";

const CrearCuentaUsuario: React.FC = () => {
  const history = useHistory();

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("ciudadano");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarCuenta = async () => {
    setMensajeError("");
    setMensajeExito("");

    if (
      !nombre.trim() ||
      !rut.trim() ||
      !correo.trim() ||
      !region.trim() ||
      !comuna.trim() ||
      !tipoUsuario.trim() ||
      !password.trim() ||
      !confirmarPassword.trim()
    ) {
      setMensajeError("Debe completar todos los campos obligatorios.");
      return;
    }

    if (!correo.includes("@")) {
      setMensajeError("Debe ingresar un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setMensajeError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setMensajeError("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setMensajeError("Debe aceptar los términos y condiciones.");
      return;
    }

    try {
      setCargando(true);

      await authService.register({
        nombre,
        rut,
        correo,
        password,
        region,
        comuna,
        tipoUsuario,
        rol: "usuario",
      });

      setMensajeExito("Cuenta registrada correctamente. Redirigiendo al inicio...");

      setTimeout(() => {
        history.push("/usuario/inicio");
      }, 1200);
    } catch (error: any) {
      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo registrar la cuenta. Intenta nuevamente.";

      setMensajeError(mensajeBackend);
    } finally {
      setCargando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="registro-content">
        <div className="registro-wrapper">
          <header className="registro-header">
            <h1>Municipalidad de Santo Domingo</h1>
          </header>

          <main className="registro-background">
            <section className="registro-card">
              <h2>Crear Cuenta</h2>

              <p className="registro-description">
                Regístrate para recibir notificaciones sobre tus solicitudes
              </p>

              {mensajeError && (
                <div className="registro-error-box">{mensajeError}</div>
              )}

              {mensajeExito && (
                <div className="registro-success-box">{mensajeExito}</div>
              )}

              <div className="registro-grid">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Nombre de Usuario</IonLabel>
                  <IonInput
                    value={nombre}
                    placeholder="Ej: Juan Pérez"
                    onIonInput={(e) => setNombre(e.detail.value ?? "")}
                  />
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">RUT</IonLabel>
                  <IonInput
                    value={rut}
                    placeholder="12.345.678-k"
                    onIonInput={(e) => setRut(e.detail.value ?? "")}
                  />
                </IonItem>
              </div>

              <IonItem className="registro-input">
                <IonLabel position="stacked">Correo Electrónico</IonLabel>
                <IonInput
                  value={correo}
                  type="email"
                  placeholder="nombre@ejemplo.cl"
                  onIonInput={(e) => setCorreo(e.detail.value ?? "")}
                />
              </IonItem>

              <div className="registro-grid">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Región</IonLabel>
                  <IonSelect
                    value={region}
                    placeholder="Seleccione Región"
                    onIonChange={(e) => setRegion(e.detail.value)}
                  >
                    <IonSelectOption value="Valparaíso">
                      Valparaíso
                    </IonSelectOption>
                    <IonSelectOption value="Metropolitana">
                      Metropolitana
                    </IonSelectOption>
                    <IonSelectOption value="O'Higgins">
                      O'Higgins
                    </IonSelectOption>
                    <IonSelectOption value="Maule">Maule</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">Comuna</IonLabel>
                  <IonSelect
                    value={comuna}
                    placeholder="Seleccione Comuna"
                    onIonChange={(e) => setComuna(e.detail.value)}
                  >
                    <IonSelectOption value="Santo Domingo">
                      Santo Domingo
                    </IonSelectOption>
                    <IonSelectOption value="San Antonio">
                      San Antonio
                    </IonSelectOption>
                    <IonSelectOption value="Cartagena">
                      Cartagena
                    </IonSelectOption>
                    <IonSelectOption value="El Tabo">El Tabo</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>

              <IonItem className="registro-input">
                <IonLabel position="stacked">Tipo de Usuario</IonLabel>
                <IonSelect
                  value={tipoUsuario}
                  placeholder="Seleccione tipo de usuario"
                  onIonChange={(e) => setTipoUsuario(e.detail.value)}
                >
                  <IonSelectOption value="ciudadano">
                    Ciudadano (Solicitante)
                  </IonSelectOption>
                  <IonSelectOption value="empresa">
                    Empresa (Representante legal)
                  </IonSelectOption>
                  <IonSelectOption value="organizacion">
                    Organización comunitaria
                  </IonSelectOption>
                  <IonSelectOption value="profesional">
                    Profesional independiente
                  </IonSelectOption>
                </IonSelect>
              </IonItem>

              <div className="registro-grid">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Contraseña</IonLabel>
                  <IonInput
                    value={password}
                    type="password"
                    placeholder="********"
                    onIonInput={(e) => setPassword(e.detail.value ?? "")}
                  />
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">Confirmar Contraseña</IonLabel>
                  <IonInput
                    value={confirmarPassword}
                    type="password"
                    placeholder="********"
                    onIonInput={(e) =>
                      setConfirmarPassword(e.detail.value ?? "")
                    }
                  />
                </IonItem>
              </div>

              <label className="registro-terms">
                <IonCheckbox
                  checked={aceptaTerminos}
                  onIonChange={(e) => setAceptaTerminos(e.detail.checked)}
                />
                <span>
                  Acepto los términos y condiciones de uso y autorizo recibir
                  notificaciones sobre el estado de mis solicitudes.
                </span>
              </label>

              <IonButton
                expand="block"
                className="registro-button"
                onClick={registrarCuenta}
                disabled={cargando}
              >
                {cargando ? "Registrando..." : "Registrar cuenta"}
              </IonButton>

              <p className="registro-login-link">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => history.push("/login-usuario")}
                >
                  Inicia sesión aquí
                </button>
              </p>
            </section>
          </main>

          <footer className="registro-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CrearCuentaUsuario;