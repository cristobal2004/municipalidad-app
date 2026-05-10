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

const NotificacionesUsuario: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Notificaciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Notificaciones usuario</h2>

        <IonList>
          <IonItem>
            <IonLabel>
              <h3>Documento pendiente</h3>
              <p>Debe subir copia de cédula de identidad.</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/usuario/solicitud/2")}>
              Ver solicitud
            </IonButton>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>Solicitud actualizada</h3>
              <p>Su solicitud SOL-2026-0001 cambió a “En revisión”.</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/usuario/solicitud/1")}>
              Ver solicitud
            </IonButton>
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

export default NotificacionesUsuario;