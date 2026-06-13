import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const VistaPrivada = () => <div>Contenido privado</div>;
const VistaLogin = () => <div>Inicio de sesion</div>;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirige al login cuando no existe token", () => {
    render(
      <MemoryRouter initialEntries={["/usuario/inicio"]}>
        <ProtectedRoute
          exact
          path="/usuario/inicio"
          component={VistaPrivada}
          allowedRole="usuario"
        />
        <Route path="/login-usuario" component={VistaLogin} />
      </MemoryRouter>
    );

    expect(screen.getByText("Inicio de sesion")).toBeInTheDocument();
  });

  it("permite el acceso cuando token y rol coinciden", () => {
    localStorage.setItem("token", "token-prueba");
    localStorage.setItem("role", "usuario");

    render(
      <MemoryRouter initialEntries={["/usuario/inicio"]}>
        <ProtectedRoute
          exact
          path="/usuario/inicio"
          component={VistaPrivada}
          allowedRole="usuario"
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });
});
