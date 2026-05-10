import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const DetalleSolicitudFuncionario: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestión de solicitud</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>SOL-2026-0001</h2>

        <p><strong>Trámite:</strong> Patente comercial</p>
        <p><strong>Fecha de ingreso:</strong> 18/04/2026</p>
        <p><strong>Área:</strong> Atención General</p>
        <p><strong>Estado actual:</strong> En proceso</p>
        <p><strong>Solicitante:</strong> Almacén El Parque</p>
        <p><strong>RUT:</strong> 76.123.456-7</p>
        <p><strong>Dirección:</strong> Av. Litoral 450, Santo Domingo</p>

        <h3>Documentos adjuntos</h3>
        <p>Escritura_Sociedad.pdf</p>
        <p>Cert_Residencia.pdf</p>

        <h3>Panel de gestión funcionario</h3>

        <IonItem>
          <IonLabel position="stacked">Cambiar estado</IonLabel>
          <IonSelect placeholder="Seleccione un estado">
            <IonSelectOption value="en-proceso">En proceso</IonSelectOption>
            <IonSelectOption value="observada">Observada</IonSelectOption>
            <IonSelectOption value="aprobada">Aprobada</IonSelectOption>
            <IonSelectOption value="rechazada">Rechazada</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Observaciones internas</IonLabel>
          <IonTextarea placeholder="Escriba una observación para la solicitud" />
        </IonItem>

        <IonButton expand="block" color="success">
          Aprobar solicitud
        </IonButton>

        <IonButton expand="block" color="danger">
          Rechazar solicitud
        </IonButton>

        <IonButton expand="block" color="medium">
          Derivar a otra área
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/funcionario/solicitudes")}
        >
          Volver a solicitudes
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudFuncionario;