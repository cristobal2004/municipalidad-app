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

const ConfirmacionSolicitud: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Confirmación</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Muchas gracias</h2>
        <p>
          Su solicitud ha sido registrada correctamente con el ID
          <strong> SOL-2026-0001</strong>.
        </p>

        <IonButton expand="block" onClick={() => history.push("/usuario/mis-tramites")}>
          Ver mis trámites
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/seleccionar-tramite")}
        >
          Nuevo trámite
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionSolicitud;