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
import { authService } from "../../services/authService";

const InicioUsuario: React.FC = () => {
  const history = useHistory();

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Página principal usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1>Bienvenido al portal ciudadano</h1>
        <p>Desde aquí puede realizar solicitudes y revisar sus trámites.</p>

        <IonButton
          expand="block"
          onClick={() => history.push("/usuario/seleccionar-tramite")}
        >
          Realizar trámite
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/mis-tramites")}
        >
          Mis trámites
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/usuario/notificaciones")}
        >
          Notificaciones
        </IonButton>

        <IonButton expand="block" color="danger" onClick={cerrarSesion}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default InicioUsuario;