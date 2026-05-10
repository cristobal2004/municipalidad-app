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

const MisTramites: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis trámites</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Resumen de mis trámites</h2>

        <IonList>
          <IonItem>
            <IonLabel>
              <h3>SOL-2026-0001</h3>
              <p>Patente comercial - En proceso</p>
              <p>Encargado: Cristian Mejías</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/usuario/solicitud/1")}>
              Ver solicitud
            </IonButton>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>SOL-2026-0002</h3>
              <p>Documentación pendiente</p>
              <p>Encargada: María Barroso</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/usuario/solicitud/2")}>
              Ver solicitud
            </IonButton>
          </IonItem>
        </IonList>

        <IonButton
          expand="block"
          onClick={() => history.push("/usuario/agendar/1")}
        >
          Agendar con funcionario
        </IonButton>

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

export default MisTramites;