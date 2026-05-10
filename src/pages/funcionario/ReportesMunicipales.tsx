import React from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const ReportesMunicipales: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Reportes municipales</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Reporte de solicitudes</h2>
        <p>Resumen estadístico de gestión y tiempos de respuesta.</p>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Solicitudes recibidas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h2>128</h2>
            <p>12% más que el mes anterior.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Solicitudes pendientes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h2>34</h2>
            <p>Requieren atención inmediata.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Solicitudes aprobadas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h2>72</h2>
            <p>Tasa de aprobación: 56%.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Solicitudes rechazadas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h2>22</h2>
            <p>Principal causa: documentación incompleta.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Tiempo promedio de respuesta</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h2>4,2 días</h2>
            <p>Meta institucional: 5 días.</p>
          </IonCardContent>
        </IonCard>

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

export default ReportesMunicipales;