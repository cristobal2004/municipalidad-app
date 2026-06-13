import type {
  LoginCredentials,
  RegisterUserData,
} from "../entities/User";
import type { AuthRepository } from "../repositories/AuthRepository";

export const createAuthUseCases = (repository: AuthRepository) => ({
  login: (credentials: LoginCredentials) => repository.login(credentials),
  register: (data: RegisterUserData) => repository.register(data),
});
