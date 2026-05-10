import React from "react";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const AgendarFuncionario: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agendar con funcionario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Seleccione fecha y hora disponible</h2>

        <IonDatetime presentation="date-time" />

        <IonButton
          expand="block"
          onClick={() => history.push("/usuario/mis-tramites")}
        >
          Confirmar agendamiento
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/mis-tramites")}
        >
          Cancelar
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AgendarFuncionario;