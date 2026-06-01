import api from "./api";

export type UserRole = "usuario" | "funcionario";

export interface UsuarioAutenticado {
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

export interface RegistroUsuarioData {
  nombre: string;
  rut: string;
  correo: string;
  password: string;
  region?: string;
  comuna?: string;
  tipoUsuario?: string;
  rol?: UserRole;
}

interface AuthResponse {
  ok: boolean;
  mensaje?: string;
  token: string;
  usuario?: any;
  user?: any;
}

const normalizarRol = (rol: unknown): UserRole => {
  const rolTexto = String(rol ?? "").trim().toLowerCase();

  if (rolTexto === "funcionario") {
    return "funcionario";
  }

  if (rolTexto === "usuario" || rolTexto === "ciudadano") {
    return "usuario";
  }

  throw new Error("El servidor no devolvió un rol válido.");
};

const extraerUsuario = (data: any): any => {
  if (data?.usuario?.usuario) {
    return data.usuario.usuario;
  }

  if (data?.usuario) {
    return data.usuario;
  }

  if (data?.user) {
    return data.user;
  }

  return data;
};

const normalizarUsuario = (usuarioRaw: any): UsuarioAutenticado => {
  const usuario = extraerUsuario(usuarioRaw);

  console.log("Usuario raw antes de normalizar:", usuario);

  return {
    id: Number(usuario.id),
    nombre: usuario.nombre || usuario.name || "",
    rut: usuario.rut || "",
    correo: usuario.correo || usuario.email || "",
    rol: normalizarRol(usuario.rol || usuario.role),
    region: usuario.region || "",
    comuna: usuario.comuna || "",
    tipoUsuario: usuario.tipoUsuario || usuario.tipo_usuario || "",
    area: usuario.area || "",
    cargo: usuario.cargo || "",
    numeroEmpleado:
      usuario.numeroEmpleado || usuario.numero_empleado || usuario.numeroEmpleadoMunicipal || "",
  };
};

const guardarSesion = (token: string, usuarioRaw: any): UsuarioAutenticado => {
  const usuarioNormalizado = normalizarUsuario(usuarioRaw);

  localStorage.setItem("token", token);
  localStorage.setItem("usuarioActual", JSON.stringify(usuarioNormalizado));
  localStorage.setItem("role", usuarioNormalizado.rol);

  return usuarioNormalizado;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<UsuarioAutenticado> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    console.log("Respuesta login backend:", response.data);

    const { token } = response.data;
    const usuarioRaw = extraerUsuario(response.data);

    if (!token || !usuarioRaw) {
      throw new Error("Respuesta inválida del servidor.");
    }

    return guardarSesion(token, usuarioRaw);
  },

  async register(data: RegistroUsuarioData): Promise<UsuarioAutenticado> {
    const response = await api.post<AuthResponse>("/auth/register", {
      ...data,
      rol: data.rol || "usuario",
    });

    console.log("Respuesta registro backend:", response.data);

    const { token } = response.data;
    const usuarioRaw = extraerUsuario(response.data);

    if (!token || !usuarioRaw) {
      throw new Error("Respuesta inválida del servidor.");
    }

    return guardarSesion(token, usuarioRaw);
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getRole(): UserRole | null {
    const role = localStorage.getItem("role");

    if (!role) {
      return null;
    }

    try {
      return normalizarRol(role);
    } catch {
      return null;
    }
  },

  getUsuarioActual(): UsuarioAutenticado | null {
    const usuario = localStorage.getItem("usuarioActual");

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario) as UsuarioAutenticado;
    } catch {
      return null;
    }
  },
};