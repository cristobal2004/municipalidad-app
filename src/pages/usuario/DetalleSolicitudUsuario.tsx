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

const DetalleSolicitudUsuario: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalle de solicitud</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>SOL-2026-0001</h2>
        <p><strong>Trámite:</strong> Patente comercial</p>
        <p><strong>Estado:</strong> En proceso</p>
        <p><strong>Área:</strong> Atención General</p>
        <p><strong>Encargado:</strong> Cristian Mejías</p>
        <p><strong>Observación:</strong> En revisión por funcionario.</p>

        <h3>Datos del formulario</h3>
        <p>Razón social: Almacén El Parque</p>
        <p>RUT: 76.123.456-7</p>
        <p>Dirección: Av. Litoral 450, Santo Domingo</p>

        <h3>Historial</h3>
        <p>19/04/2026: Asignada a Atención General.</p>
        <p>20/04/2026: En revisión por funcionario.</p>

        <IonButton
          expand="block"
          onClick={() => history.push("/usuario/agendar/1")}
        >
          Agendar con funcionario
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/mis-tramites")}
        >
          Volver a mis trámites
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudUsuario;