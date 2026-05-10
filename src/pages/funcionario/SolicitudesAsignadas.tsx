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

const SolicitudesAsignadas: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Solicitudes asignadas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Lista de solicitudes asignadas</h2>

        <IonList>
          <IonItem>
            <IonLabel>
              <h3>SOL-2026-0001</h3>
              <p>Patente comercial</p>
              <p>Estado: En proceso | Prioridad: Alta</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/funcionario/solicitud/1")}>
              Ver solicitud
            </IonButton>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>SOL-2026-0002</h3>
              <p>Documentación pendiente</p>
              <p>Estado: Pendiente | Prioridad: Media</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/funcionario/solicitud/2")}>
              Ver solicitud
            </IonButton>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h3>SOL-2026-0003</h3>
              <p>Solicitud aprobada</p>
              <p>Estado: Aprobado | Prioridad: Baja</p>
            </IonLabel>
            <IonButton onClick={() => history.push("/funcionario/solicitud/3")}>
              Ver solicitud
            </IonButton>
          </IonItem>
        </IonList>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/funcionario/inicio")}
        >
          Volver al panel principal
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudesAsignadas;