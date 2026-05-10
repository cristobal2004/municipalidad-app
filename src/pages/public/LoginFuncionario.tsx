import React from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { authService } from "../../services/authService";

const LoginFuncionario: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    authService.login("funcionario");
    history.push("/funcionario/inicio");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio de sesión funcionario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Acceso funcionario municipal</h2>

        <IonItem>
          <IonLabel position="stacked">Número de funcionario</IonLabel>
          <IonInput placeholder="Ej: FUN-001" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput type="password" placeholder="Ingrese su contraseña" />
        </IonItem>

        <IonButton expand="block" onClick={handleLogin}>
          Ingresar como funcionario
        </IonButton>

        <IonButton expand="block" fill="outline" onClick={() => history.push("/")}>
          Volver al inicio
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginFuncionario;