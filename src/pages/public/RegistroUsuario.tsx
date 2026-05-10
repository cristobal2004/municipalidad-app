import React from "react";
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
import "./RegistroUsuario.css";

const RegistroUsuario: React.FC = () => {
  const history = useHistory();

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

              <div className="registro-row">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Nombre de Usuario</IonLabel>
                  <IonInput placeholder="Ej: Juan Pérez" />
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">RUT</IonLabel>
                  <IonInput placeholder="12.345.678-k" />
                </IonItem>
              </div>

              <IonItem className="registro-input">
                <IonLabel position="stacked">Correo Electrónico</IonLabel>
                <IonInput type="email" placeholder="nombre@ejemplo.cl" />
              </IonItem>

              <div className="registro-row">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Región</IonLabel>
                  <IonSelect placeholder="Seleccione Región">
                    <IonSelectOption value="valparaiso">
                      Valparaíso
                    </IonSelectOption>
                    <IonSelectOption value="metropolitana">
                      Metropolitana
                    </IonSelectOption>
                    <IonSelectOption value="ohiggins">
                      O'Higgins
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">Comuna</IonLabel>
                  <IonSelect placeholder="Seleccione Comuna">
                    <IonSelectOption value="Olmué">
                      Olmué
                    </IonSelectOption>
                    <IonSelectOption value="Quilpué">
                      Quilpué
                    </IonSelectOption>
                    <IonSelectOption value="Limache">
                      Limache
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>

              <IonItem className="registro-input">
                  <IonLabel position="stacked">Tipo de Usuario</IonLabel>

                  <IonSelect placeholder="Seleccione tipo de usuario">
                    <IonSelectOption value="ciudadano">
                      Ciudadano (Solicitante)
                    </IonSelectOption>

                    <IonSelectOption value="empresa">
                      Empresa (Representante legal)
                    </IonSelectOption>

                    <IonSelectOption value="organizacion">
                      Organización comunitaria
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>

              <div className="registro-row">
                <IonItem className="registro-input">
                  <IonLabel position="stacked">Contraseña</IonLabel>
                  <IonInput type="password" placeholder="********" />
                </IonItem>

                <IonItem className="registro-input">
                  <IonLabel position="stacked">Confirmar Contraseña</IonLabel>
                  <IonInput type="password" placeholder="********" />
                </IonItem>
              </div>

              <label className="registro-terms">
                <IonCheckbox />
                <span>
                  Acepto los términos y condiciones de uso y autorizo recibir
                  notificaciones sobre el estado de mis solicitudes.
                </span>
              </label>

              <IonButton
                expand="block"
                className="registro-main-button"
                onClick={() => history.push("/login-usuario")}
              >
                Registrar cuenta
              </IonButton>

              <button
                className="registro-login-link"
                onClick={() => history.push("/login-usuario")}
              >
                ¿Ya tienes cuenta? <span>Inicia sesión aquí</span>
              </button>
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

export default RegistroUsuario;