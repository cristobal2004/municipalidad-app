import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const SolicitudPatente: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Solicitud de patente</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Ingreso de nueva solicitud</h2>

        <IonItem>
          <IonLabel position="stacked">Nombre del proyecto o razón social</IonLabel>
          <IonInput placeholder="Ej: Minimarket Los Andes" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">RUT solicitante o empresa</IonLabel>
          <IonInput placeholder="12.345.678-9" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Dirección comercial</IonLabel>
          <IonInput placeholder="Calle, número, villa o población" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Tipo de patente solicitada</IonLabel>
          <IonInput placeholder="Ej: Comercial definitiva" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Rol de avalúo de la propiedad</IonLabel>
          <IonInput placeholder="Ej: 1234-56" />
        </IonItem>

        <IonRadioGroup>
          <IonItem>
            <IonLabel>Pyme: Sí</IonLabel>
            <IonRadio slot="start" value="si" />
          </IonItem>

          <IonItem>
            <IonLabel>Pyme: No</IonLabel>
            <IonRadio slot="start" value="no" />
          </IonItem>
        </IonRadioGroup>

        <p>Documentos adjuntos: Escritura de sociedad, certificado de residencia, entre otros.</p>

        <IonButton expand="block" onClick={() => history.push("/usuario/confirmacion")}>
          Enviar solicitud
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/seleccionar-tramite")}
        >
          Volver atrás
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudPatente;