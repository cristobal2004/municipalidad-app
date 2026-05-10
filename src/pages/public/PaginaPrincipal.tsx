import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const PaginaPrincipal: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Municipalidad de Santo Domingo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1>Portal de Solicitudes Municipales</h1>
        <p>
          Bienvenido al sistema de atención municipal. Desde esta plataforma
          podrá ingresar solicitudes, revisar el estado de sus trámites y
          comunicarse con la municipalidad.
        </p>

        <IonButton expand="block" onClick={() => history.push("/login-usuario")}>
          Iniciar sesión usuario
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/login-funcionario")}
        >
          Iniciar sesión funcionario
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PaginaPrincipal;