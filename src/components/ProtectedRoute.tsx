import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { authService, UserRole } from "../services/authService";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  allowedRole: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  allowedRole,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = authService.getToken();
        const role = authService.getRole();

        if (!token) {
          const loginPath =
            allowedRole === "funcionario"
              ? "/login-funcionario"
              : "/login-usuario";

          return <Redirect to={loginPath} />;
        }

        if (role !== allowedRole) {
          if (role === "usuario") {
            return <Redirect to="/usuario/inicio" />;
          }

          if (role === "funcionario") {
            return <Redirect to="/funcionario/inicio" />;
          }

          return <Redirect to="/" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;