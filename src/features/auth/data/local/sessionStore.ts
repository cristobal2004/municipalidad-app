import {
  normalizeUserRole,
  type AuthenticatedUser,
  type AuthSession,
  type UserRole,
} from "../../domain/entities/User";

const TOKEN_KEY = "token";
const USER_KEY = "usuarioActual";
const ROLE_KEY = "role";

const getStorage = (): Storage | null =>
  typeof window === "undefined" ? null : window.localStorage;

export const sessionStore = {
  save(session: AuthSession) {
    const storage = getStorage();

    storage?.setItem(TOKEN_KEY, session.token);
    storage?.setItem(USER_KEY, JSON.stringify(session.user));
    storage?.setItem(ROLE_KEY, session.user.rol);
  },

  clear() {
    const storage = getStorage();

    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
    storage?.removeItem(ROLE_KEY);
    storage?.removeItem("isAuthenticated");
  },

  getToken(): string | null {
    return getStorage()?.getItem(TOKEN_KEY) ?? null;
  },

  getRole(): UserRole | null {
    const role = getStorage()?.getItem(ROLE_KEY);

    if (!role) {
      return null;
    }

    try {
      return normalizeUserRole(role);
    } catch {
      return null;
    }
  },

  getUser(): AuthenticatedUser | null {
    const rawUser = getStorage()?.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthenticatedUser;
    } catch {
      return null;
    }
  },
};
