import React, { Suspense, lazy, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonRouterOutlet,
  IonSpinner,
} from "@ionic/react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const PaginaPrincipal = lazy(
  () => import("../../../features/landing/presentation/screens/PaginaPrincipal"),
);
const LoginUsuario = lazy(
  () => import("../../../features/auth/presentation/screens/LoginUsuario"),
);
const RegistroUsuario = lazy(
  () => import("../../../features/auth/presentation/screens/RegistroUsuario"),
);
const LoginFuncionario = lazy(
  () => import("../../../features/auth/presentation/screens/LoginFuncionario"),
);

const InicioUsuario = lazy(
  () => import("../../../features/dashboard/presentation/screens/InicioUsuario"),
);
const SeleccionarTramite = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/SeleccionarTramite"
    ),
);
const SolicitudPatente = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudPatente"
    ),
);
const SolicitudTramiteGeneral = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudTramiteGeneral"
    ),
);
const ConfirmacionSolicitud = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/ConfirmacionSolicitud"
    ),
);
const MisTramites = lazy(
  () => import("../../../features/solicitudes/presentation/screens/MisTramites"),
);
const DetalleSolicitudUsuario = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/DetalleSolicitudUsuario"
    ),
);
const NotificacionesUsuario = lazy(
  () =>
    import(
      "../../../features/notificaciones/presentation/screens/NotificacionesUsuario"
    ),
);
const AgendarFuncionario = lazy(
  () =>
    import("../../../features/agenda/presentation/screens/AgendarFuncionario"),
);

const InicioFuncionario = lazy(
  () =>
    import(
      "../../../features/dashboard/presentation/screens/InicioFuncionario"
    ),
);
const SolicitudesAsignadas = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudesAsignadas"
    ),
);
const DetalleSolicitudFuncionario = lazy(
  () =>
    import(
      "../../../features/solicitudes/presentation/screens/DetalleSolicitudFuncionario"
    ),
);
const ReportesMunicipales = lazy(
  () =>
    import(
      "../../../features/reportes/presentation/screens/ReportesMunicipales"
    ),
);
const NotificacionesFuncionario = lazy(
  () =>
    import(
      "../../../features/notificaciones/presentation/screens/NotificacionesFuncionario"
    ),
);
const AgendaFuncionario = lazy(
  () =>
    import("../../../features/agenda/presentation/screens/AgendaFuncionario"),
);

const preloadRouteModules = () =>
  Promise.allSettled([
    import("../../../features/landing/presentation/screens/PaginaPrincipal"),
    import("../../../features/auth/presentation/screens/LoginUsuario"),
    import("../../../features/auth/presentation/screens/RegistroUsuario"),
    import("../../../features/auth/presentation/screens/LoginFuncionario"),
    import("../../../features/dashboard/presentation/screens/InicioUsuario"),
    import(
      "../../../features/solicitudes/presentation/screens/SeleccionarTramite"
    ),
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudPatente"
    ),
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudTramiteGeneral"
    ),
    import(
      "../../../features/solicitudes/presentation/screens/ConfirmacionSolicitud"
    ),
    import("../../../features/solicitudes/presentation/screens/MisTramites"),
    import(
      "../../../features/solicitudes/presentation/screens/DetalleSolicitudUsuario"
    ),
    import(
      "../../../features/notificaciones/presentation/screens/NotificacionesUsuario"
    ),
    import("../../../features/agenda/presentation/screens/AgendarFuncionario"),
    import("../../../features/dashboard/presentation/screens/InicioFuncionario"),
    import(
      "../../../features/solicitudes/presentation/screens/SolicitudesAsignadas"
    ),
    import(
      "../../../features/solicitudes/presentation/screens/DetalleSolicitudFuncionario"
    ),
    import(
      "../../../features/reportes/presentation/screens/ReportesMunicipales"
    ),
    import(
      "../../../features/notificaciones/presentation/screens/NotificacionesFuncionario"
    ),
    import("../../../features/agenda/presentation/screens/AgendaFuncionario"),
  ]);

const RouteFallback: React.FC = () => (
  <IonPage className="route-loading-page">
    <IonContent fullscreen>
      <div className="route-loading-state" role="status" aria-live="polite">
        <IonSpinner name="crescent" />
        <span>Cargando vista...</span>
      </div>
    </IonContent>
  </IonPage>
);

const AppRoutes: React.FC = () => {
  useEffect(() => {
    const preloadTimeout = window.setTimeout(() => {
      void preloadRouteModules();
    }, 250);

    return () => window.clearTimeout(preloadTimeout);
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
      <IonRouterOutlet animated={false}>
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
        path="/usuario/nueva-solicitud/patente"
        component={SolicitudPatente}
        allowedRole="usuario"
      />

      <ProtectedRoute
        exact
        path="/usuario/nueva-solicitud/:tipo"
        component={SolicitudTramiteGeneral}
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

      {/* Ruta nueva usada por DetalleSolicitudUsuario */}
      <ProtectedRoute
        exact
        path="/usuario/agendar-funcionario"
        component={AgendarFuncionario}
        allowedRole="usuario"
      />

      {/* Ruta antigua mantenida por compatibilidad */}
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
        path="/funcionario/agenda"
        component={AgendaFuncionario}
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

      <ProtectedRoute
        exact
        path="/funcionario/notificaciones"
        component={NotificacionesFuncionario}
        allowedRole="funcionario"
      />

        {/* Redirección por defecto */}
      </IonRouterOutlet>
    </Suspense>
  );
};

export default AppRoutes;
