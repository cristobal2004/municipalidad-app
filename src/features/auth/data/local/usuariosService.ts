export interface Usuario {
  id: string;
  nombre: string;
  rut: string;
  correo: string;
  region: string;
  comuna: string;
  tipoUsuario: string;
  password: string;
}

const USERS_STORAGE_KEY = "usuarios_registrados";
const CURRENT_USER_KEY = "usuario_actual";

function obtenerUsuariosGuardados(): Usuario[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);

  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  return JSON.parse(data);
}

function guardarUsuarios(usuarios: Usuario[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
}

function generarNuevoId(usuarios: Usuario[]) {
  const numero = usuarios.length + 1;
  return `USR-${String(numero).padStart(4, "0")}`;
}

export const usuariosService = {
  obtenerUsuarios(): Usuario[] {
    return obtenerUsuariosGuardados();
  },

  registrarUsuario(data: {
    nombre: string;
    rut: string;
    correo: string;
    region: string;
    comuna: string;
    tipoUsuario: string;
    password: string;
  }): { ok: boolean; mensaje: string; usuario?: Usuario } {
    const usuarios = obtenerUsuariosGuardados();

    const correoExiste = usuarios.some(
      (usuario) => usuario.correo.toLowerCase() === data.correo.toLowerCase()
    );

    if (correoExiste) {
      return {
        ok: false,
        mensaje: "Ya existe una cuenta registrada con este correo electrónico.",
      };
    }

    const rutExiste = usuarios.some(
      (usuario) => usuario.rut.toLowerCase() === data.rut.toLowerCase()
    );

    if (rutExiste) {
      return {
        ok: false,
        mensaje: "Ya existe una cuenta registrada con este RUT.",
      };
    }

    const nuevoUsuario: Usuario = {
      id: generarNuevoId(usuarios),
      nombre: data.nombre,
      rut: data.rut,
      correo: data.correo,
      region: data.region,
      comuna: data.comuna,
      tipoUsuario: data.tipoUsuario,
      password: data.password,
    };

    const nuevosUsuarios = [...usuarios, nuevoUsuario];
    guardarUsuarios(nuevosUsuarios);

    return {
      ok: true,
      mensaje: "Usuario registrado correctamente.",
      usuario: nuevoUsuario,
    };
  },

  loginUsuario(correo: string, password: string): {
    ok: boolean;
    mensaje: string;
    usuario?: Usuario;
  } {
    const usuarios = obtenerUsuariosGuardados();

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase() === correo.toLowerCase() &&
        usuario.password === password
    );

    if (!usuarioEncontrado) {
      return {
        ok: false,
        mensaje: "Correo o contraseña incorrectos.",
      };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuarioEncontrado));

    return {
      ok: true,
      mensaje: "Inicio de sesión correcto.",
      usuario: usuarioEncontrado,
    };
  },

  loginConClaveUnica(): {
    ok: boolean;
    mensaje: string;
    usuario: Usuario;
  } {
    const usuarios = obtenerUsuariosGuardados();

    const correoClaveUnica = "claveunica@registrocivil.cl";

    let usuarioClaveUnica = usuarios.find(
      (usuario) => usuario.correo === correoClaveUnica
    );

    if (!usuarioClaveUnica) {
      usuarioClaveUnica = {
        id: generarNuevoId(usuarios),
        nombre: "Usuario ClaveÚnica",
        rut: "12.345.678-9",
        correo: correoClaveUnica,
        region: "Valparaíso",
        comuna: "Santo Domingo",
        tipoUsuario: "ciudadano",
        password: "claveunica",
      };

      const nuevosUsuarios = [...usuarios, usuarioClaveUnica];
      guardarUsuarios(nuevosUsuarios);
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuarioClaveUnica));

    return {
      ok: true,
      mensaje: "Inicio de sesión con ClaveÚnica correcto.",
      usuario: usuarioClaveUnica,
    };
  },

  obtenerUsuarioActual(): Usuario | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  },

  cerrarSesionUsuario() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};