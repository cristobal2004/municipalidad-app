import React from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const RegistroUsuario: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro de usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Crear cuenta ciudadana</h2>

        <IonItem>
          <IonLabel position="stacked">Nombre de usuario</IonLabel>
          <IonInput placeholder="Ej: Cristóbal Rubilar" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">RUT</IonLabel>
          <IonInput placeholder="12.345.678-9" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Correo electrónico</IonLabel>
          <IonInput type="email" placeholder="nombre@ejemplo.cl" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Región</IonLabel>
          <IonSelect placeholder="Seleccione una región">
            <IonSelectOption value="valparaiso">Valparaíso</IonSelectOption>
            <IonSelectOption value="metropolitana">Metropolitana</IonSelectOption>
            <IonSelectOption value="ohiggins">O'Higgins</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Comuna</IonLabel>
          <IonSelect placeholder="Seleccione una comuna">
            <IonSelectOption value="santo-domingo">Santo Domingo</IonSelectOption>
            <IonSelectOption value="san-antonio">San Antonio</IonSelectOption>
            <IonSelectOption value="cartagena">Cartagena</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput type="password" placeholder="Ingrese contraseña" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Confirmación de contraseña</IonLabel>
          <IonInput type="password" placeholder="Repita contraseña" />
        </IonItem>

        <IonItem>
          <IonCheckbox slot="start" />
          <IonLabel>Acepto términos y condiciones</IonLabel>
        </IonItem>

        <IonButton expand="block" onClick={() => history.push("/login-usuario")}>
          Registrar cuenta
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/login-usuario")}
        >
          Volver al login
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default RegistroUsuario;