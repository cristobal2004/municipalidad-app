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

const InicioFuncionario: React.FC = () => {
  const history = useHistory();

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel funcionario municipal</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1>Bienvenido al panel funcionario</h1>
        <p>
          Desde esta sección puede revisar solicitudes asignadas, gestionar
          trámites y consultar reportes municipales.
        </p>

        <IonButton
          expand="block"
          onClick={() => history.push("/funcionario/solicitudes")}
        >
          Ver solicitudes asignadas
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/funcionario/reportes")}
        >
          Ver reportes municipales
        </IonButton>

        <IonButton expand="block" color="danger" onClick={cerrarSesion}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default InicioFuncionario;