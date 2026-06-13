export type UserRole = "usuario" | "funcionario";

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  rut?: string;
  correo: string;
  rol: UserRole;
  region?: string;
  comuna?: string;
  tipoUsuario?: string;
  area?: string;
  cargo?: string;
  numeroEmpleado?: string;
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface RegisterUserData {
  nombre: string;
  rut: string;
  correo: string;
  password: string;
  region?: string;
  comuna?: string;
  tipoUsuario?: string;
  rol?: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthenticatedUser;
}

export const normalizeUserRole = (role: unknown): UserRole => {
  const normalizedRole = String(role ?? "").trim().toLowerCase();

  if (normalizedRole === "funcionario") {
    return "funcionario";
  }

  if (normalizedRole === "usuario" || normalizedRole === "ciudadano") {
    return "usuario";
  }

  throw new Error("El servidor no devolvio un rol valido.");
};
