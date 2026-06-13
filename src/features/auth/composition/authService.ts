import { sessionStore } from "../data/local/sessionStore";
import { authApiRepository } from "../data/remote/authApiRepository";
import type {
  AuthenticatedUser,
  LoginCredentials,
  RegisterUserData,
  UserRole,
} from "../domain/entities/User";
import { createAuthUseCases } from "../domain/useCases/authenticateUser";

export type UsuarioAutenticado = AuthenticatedUser;
export type RegistroUsuarioData = RegisterUserData;
export type { LoginCredentials, UserRole };

const authUseCases = createAuthUseCases(authApiRepository);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    const session = await authUseCases.login(credentials);
    sessionStore.save(session);
    return session.user;
  },

  async register(data: RegisterUserData): Promise<AuthenticatedUser> {
    const session = await authUseCases.register(data);
    sessionStore.save(session);
    return session.user;
  },

  logout: sessionStore.clear,
  isAuthenticated: () => Boolean(sessionStore.getToken()),
  getToken: sessionStore.getToken,
  getRole: sessionStore.getRole,
  getUsuarioActual: sessionStore.getUser,
};
