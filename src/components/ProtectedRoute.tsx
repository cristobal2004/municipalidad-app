import React from "react";
import { Redirect, Route } from "react-router-dom";
import { authService, UserRole } from "../services/authService";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRole: UserRole;
  exact?: boolean;
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
        const isAuthenticated = authService.isAuthenticated();
        const role = authService.getRole();

        if (!isAuthenticated) {
          return <Redirect to="/" />;
        }

        if (role !== allowedRole) {
          return <Redirect to="/" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;