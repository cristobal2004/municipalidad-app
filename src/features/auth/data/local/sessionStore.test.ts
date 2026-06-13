import { beforeEach, describe, expect, it } from "vitest";

import { sessionStore } from "./sessionStore";

describe("sessionStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("guarda y recupera una sesion autenticada", () => {
    sessionStore.save({
      token: "token-seguro",
      user: {
        id: 7,
        nombre: "Ana Perez",
        correo: "ana@example.com",
        rol: "usuario",
      },
    });

    expect(sessionStore.getToken()).toBe("token-seguro");
    expect(sessionStore.getRole()).toBe("usuario");
    expect(sessionStore.getUser()?.nombre).toBe("Ana Perez");
  });

  it("limpia tambien claves heredadas de autenticacion", () => {
    localStorage.setItem("isAuthenticated", "true");
    sessionStore.save({
      token: "token",
      user: {
        id: 1,
        nombre: "Funcionario",
        correo: "funcionario@example.com",
        rol: "funcionario",
      },
    });

    sessionStore.clear();

    expect(sessionStore.getToken()).toBeNull();
    expect(sessionStore.getUser()).toBeNull();
    expect(localStorage.getItem("isAuthenticated")).toBeNull();
  });

  it("tolera datos locales corruptos", () => {
    localStorage.setItem("usuarioActual", "{json-invalido");
    localStorage.setItem("role", "administrador");

    expect(sessionStore.getUser()).toBeNull();
    expect(sessionStore.getRole()).toBeNull();
  });
});
