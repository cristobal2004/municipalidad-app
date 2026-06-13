import apiClient from "../../../../core/data/http/apiClient";
import {
  normalizeUserRole,
  type AuthenticatedUser,
  type AuthSession,
  type LoginCredentials,
  type RegisterUserData,
} from "../../domain/entities/User";
import type { AuthRepository } from "../../domain/repositories/AuthRepository";

interface AuthResponse {
  token: string;
  usuario?: unknown;
  user?: unknown;
}

const extractUser = (data: unknown): Record<string, unknown> => {
  const response = data as Record<string, unknown>;
  const nestedUser = response.usuario as Record<string, unknown> | undefined;

  if (nestedUser?.usuario) {
    return nestedUser.usuario as Record<string, unknown>;
  }

  if (nestedUser) {
    return nestedUser;
  }

  if (response.user) {
    return response.user as Record<string, unknown>;
  }

  return response;
};

const normalizeUser = (rawUser: unknown): AuthenticatedUser => {
  const user = extractUser(rawUser);

  return {
    id: Number(user.id),
    nombre: String(user.nombre || user.name || ""),
    rut: String(user.rut || ""),
    correo: String(user.correo || user.email || ""),
    rol: normalizeUserRole(user.rol || user.role),
    region: String(user.region || ""),
    comuna: String(user.comuna || ""),
    tipoUsuario: String(user.tipoUsuario || user.tipo_usuario || ""),
    area: String(user.area || ""),
    cargo: String(user.cargo || ""),
    numeroEmpleado: String(
      user.numeroEmpleado ||
        user.numero_empleado ||
        user.numeroEmpleadoMunicipal ||
        "",
    ),
  };
};

const toSession = (response: AuthResponse): AuthSession => {
  const rawUser = extractUser(response);

  if (!response.token || !rawUser) {
    throw new Error("Respuesta invalida del servidor.");
  }

  return {
    token: response.token,
    user: normalizeUser(rawUser),
  };
};

export const authApiRepository: AuthRepository = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    return toSession(response.data);
  },

  async register(data: RegisterUserData) {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      ...data,
      rol: "usuario",
    });

    return toSession(response.data);
  },
};
