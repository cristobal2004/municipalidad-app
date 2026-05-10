import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const SeleccionarTramite: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seleccionar trámite</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Seleccione el trámite a realizar</h2>

        <IonList>
          <IonItem button onClick={() => history.push("/usuario/solicitud/patente")}>
            <IonLabel>Solicitar patente comercial</IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Solicitud de licencia de conducir</IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Solicitud de permiso de construcción</IonLabel>
          </IonItem>
        </IonList>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/inicio")}
        >
          Volver al inicio
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SeleccionarTramite;