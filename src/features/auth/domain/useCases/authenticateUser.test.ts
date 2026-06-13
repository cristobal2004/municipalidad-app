import { describe, expect, it, vi } from "vitest";

import type { AuthRepository } from "../repositories/AuthRepository";
import { createAuthUseCases } from "./authenticateUser";

const session = {
  token: "token",
  user: {
    id: 1,
    nombre: "Usuario",
    correo: "usuario@example.com",
    rol: "usuario" as const,
  },
};

describe("createAuthUseCases", () => {
  it("delega el inicio de sesion en el repositorio", async () => {
    const repository: AuthRepository = {
      login: vi.fn().mockResolvedValue(session),
      register: vi.fn(),
    };
    const useCases = createAuthUseCases(repository);
    const credentials = {
      correo: "usuario@example.com",
      password: "Password123",
    };

    await expect(useCases.login(credentials)).resolves.toEqual(session);
    expect(repository.login).toHaveBeenCalledWith(credentials);
  });

  it("delega el registro sin alterar los datos del dominio", async () => {
    const repository: AuthRepository = {
      login: vi.fn(),
      register: vi.fn().mockResolvedValue(session),
    };
    const useCases = createAuthUseCases(repository);
    const data = {
      nombre: "Usuario",
      rut: "11.111.111-1",
      correo: "usuario@example.com",
      password: "Password123",
    };

    await expect(useCases.register(data)).resolves.toEqual(session);
    expect(repository.register).toHaveBeenCalledWith(data);
  });
});
