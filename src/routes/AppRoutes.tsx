import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import ProtectedRoute from "../components/ProtectedRoute";

/* Páginas públicas */
import PaginaPrincipal from "../pages/public/PaginaPrincipal";
import LoginUsuario from "../pages/public/LoginUsuario";
import RegistroUsuario from "../pages/public/RegistroUsuario";
import LoginFuncionario from "../pages/public/LoginFuncionario";

/* Páginas usuario */
import InicioUsuario from "../pages/usuario/InicioUsuario";
import SeleccionarTramite from "../pages/usuario/SeleccionarTramite";
import SolicitudPatente from "../pages/usuario/SolicitudPatente";
import ConfirmacionSolicitud from "../pages/usuario/ConfirmacionSolicitud";
import MisTramites from "../pages/usuario/MisTramites";
import DetalleSolicitudUsuario from "../pages/usuario/DetalleSolicitudUsuario";
import NotificacionesUsuario from "../pages/usuario/NotificacionesUsuario";
import AgendarFuncionario from "../pages/usuario/AgendarFuncionario";

/* Páginas funcionario */
import InicioFuncionario from "../pages/funcionario/InicioFuncionario";
import SolicitudesAsignadas from "../pages/funcionario/SolicitudesAsignadas";
import DetalleSolicitudFuncionario from "../pages/funcionario/DetalleSolicitudFuncionario";
import ReportesMunicipales from "../pages/funcionario/ReportesMunicipales";

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet>
      {/* Rutas públicas */}
      <Route exact path="/" component={PaginaPrincipal} />
      <Route exact path="/login-usuario" component={LoginUsuario} />
      <Route exact path="/registro" component={RegistroUsuario} />
      <Route exact path="/login-funcionario" component={LoginFuncionario} />

      {/* Rutas protegidas del usuario ciudadano */}
      <ProtectedRoute
        exact
        path="/usuario/inicio"
        component={InicioUsuario}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/seleccionar-tramite"
        component={SeleccionarTramite}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/solicitud/patente"
        component={SolicitudPatente}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/confirmacion"
        component={ConfirmacionSolicitud}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/mis-tramites"
        component={MisTramites}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/solicitud/:id"
        component={DetalleSolicitudUsuario}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/notificaciones"
        component={NotificacionesUsuario}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/agendar/:id"
        component={AgendarFuncionario}
        allowedRole="usuario"
      />

      {/* Rutas protegidas del funcionario municipal */}
      <ProtectedRoute
        exact
        path="/funcionario/inicio"
        component={InicioFuncionario}
        allowedRole="funcionario"
      />

      <ProtectedRoute
        exact
        path="/funcionario/solicitudes"
        component={SolicitudesAsignadas}
        allowedRole="funcionario"
      />

      <ProtectedRoute
        exact
        path="/funcionario/solicitud/:id"
        component={DetalleSolicitudFuncionario}
        allowedRole="funcionario"
      />

      <ProtectedRoute
        exact
        path="/funcionario/reportes"
        component={ReportesMunicipales}
        allowedRole="funcionario"
      />

      {/* Redirección por defecto */}
      <Redirect to="/" />
    </IonRouterOutlet>
  );
};

export default AppRoutes;