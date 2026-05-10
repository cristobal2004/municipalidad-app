export type UserRole = "usuario" | "funcionario";

export const authService = {
  login(role: UserRole) {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", role);
  },

  logout() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
  },

  isAuthenticated() {
    return localStorage.getItem("isAuthenticated") === "true";
  },

  getRole(): UserRole | null {
    return localStorage.getItem("role") as UserRole | null;
  },
};