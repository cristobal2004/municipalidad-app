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

const LoginUsuario: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    authService.login("usuario");
    history.push("/usuario/inicio");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio de sesión ciudadano</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Ingresar como usuario ciudadano</h2>

        <IonItem>
          <IonLabel position="stacked">Correo electrónico</IonLabel>
          <IonInput type="email" placeholder="nombre@ejemplo.cl" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput type="password" placeholder="Ingrese su contraseña" />
        </IonItem>

        <IonButton expand="block" onClick={handleLogin}>
          Ingresar
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={() => history.push("/registro")}
        >
          Crear cuenta
        </IonButton>

        <IonButton expand="block" fill="outline" onClick={() => history.push("/")}>
          Volver al inicio
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginUsuario;
