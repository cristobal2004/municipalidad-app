import type {
  AuthSession,
  LoginCredentials,
  RegisterUserData,
} from "../entities/User";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(data: RegisterUserData): Promise<AuthSession>;
}
