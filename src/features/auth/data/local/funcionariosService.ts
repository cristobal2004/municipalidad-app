export interface Funcionario {
  id: string;
  nombre: string;
  numeroEmpleado: string;
  password: string;
  area: string;
  cargo: string;
  rol?: "funcionario";
}

const FUNCIONARIO_ACTUAL_KEY = "funcionario_actual";

const funcionariosMunicipales: Funcionario[] = [
  {
    id: "FUN-001",
    nombre: "Cristian Mejías",
    numeroEmpleado: "12345678",
    password: "admin123",
    area: "Atención General",
    cargo: "Funcionario Municipal",
    rol: "funcionario",
  },
  {
    id: "FUN-002",
    nombre: "Benjamin Gomez",
    numeroEmpleado: "87654321",
    password: "funcionario123",
    area: "Servicio Ciudadano",
    cargo: "Ejecutivo de Atención",
    rol: "funcionario",
  },
  {
    id: "FUN-003",
    nombre: "Oscar Ruiz",
    numeroEmpleado: "11223344",
    password: "finanzas123",
    area: "Finanzas",
    cargo: "Analista Municipal",
    rol: "funcionario",
  },
  {
    id: "FUN-004",
    nombre: "Pablo Aguilera",
    numeroEmpleado: "44556677",
    password: "obras123",
    area: "Obras Municipales",
    cargo: "Revisor Técnico",
    rol: "funcionario",
  },
  {
    id: "FUN-005",
    nombre: "Martina Ponce",
    numeroEmpleado: "99887766",
    password: "patentes123",
    area: "Patentes Comerciales",
    cargo: "Encargada de Patentes",
    rol: "funcionario",
  },
];

const normalizarTexto = (texto: string) => {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const guardarFuncionarioSesion = (funcionario: Funcionario) => {
  const sesion = {
    ...funcionario,
    rol: "funcionario",
    role: "funcionario",
    correo: `${normalizarTexto(funcionario.nombre).replace(/\s+/g, ".")}@santodomingo.cl`,
    email: `${normalizarTexto(funcionario.nombre).replace(/\s+/g, ".")}@santodomingo.cl`,
  };

  localStorage.setItem(FUNCIONARIO_ACTUAL_KEY, JSON.stringify(sesion));
  localStorage.setItem("funcionarioActual", JSON.stringify(sesion));
  localStorage.setItem("funcionario_logueado", JSON.stringify(sesion));
  localStorage.setItem("funcionarioLogueado", JSON.stringify(sesion));
  localStorage.setItem("current_funcionario", JSON.stringify(sesion));
  localStorage.setItem("usuario_actual", JSON.stringify(sesion));
  localStorage.setItem("usuarioActual", JSON.stringify(sesion));
  localStorage.setItem("current_user", JSON.stringify(sesion));
  localStorage.setItem("rol", "funcionario");
};

const obtenerFuncionarioPorNombre = (nombre: string) => {
  return funcionariosMunicipales.find(
    (funcionario) =>
      normalizarTexto(funcionario.nombre) === normalizarTexto(nombre)
  );
};

const obtenerFuncionarioPorId = (id: string) => {
  return funcionariosMunicipales.find(
    (funcionario) => normalizarTexto(funcionario.id) === normalizarTexto(id)
  );
};

const obtenerFuncionarioPorNumeroEmpleado = (numeroEmpleado: string) => {
  return funcionariosMunicipales.find(
    (funcionario) =>
      normalizarTexto(funcionario.numeroEmpleado) ===
      normalizarTexto(numeroEmpleado)
  );
};

const funcionarioExiste = (nombre: string) => {
  return Boolean(obtenerFuncionarioPorNombre(nombre));
};

const obtenerFuncionarioPorRegla = (solicitud: any) => {
  const texto = normalizarTexto(
    [
      solicitud?.tramite,
      solicitud?.tipoTramite,
      solicitud?.tipoPatente,
      solicitud?.area,
      solicitud?.departamento,
      solicitud?.areaResponsable,
      solicitud?.giro,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (
    texto.includes("comercial") ||
    texto.includes("patente") ||
    texto.includes("patentes comerciales")
  ) {
    return obtenerFuncionarioPorId("FUN-005")!;
  }

  if (
    texto.includes("circulacion") ||
    texto.includes("permiso") ||
    texto.includes("servicio ciudadano")
  ) {
    return obtenerFuncionarioPorId("FUN-002")!;
  }

  if (
    texto.includes("finanza") ||
    texto.includes("pago") ||
    texto.includes("profesional")
  ) {
    return obtenerFuncionarioPorId("FUN-003")!;
  }

  if (
    texto.includes("obra") ||
    texto.includes("construccion") ||
    texto.includes("predio") ||
    texto.includes("edificacion")
  ) {
    return obtenerFuncionarioPorId("FUN-004")!;
  }

  return obtenerFuncionarioPorId("FUN-001")!;
};

const obtenerFuncionarioAsignado = (solicitud: any) => {
  const encargadoGuardado =
    solicitud?.encargado ||
    solicitud?.funcionario ||
    solicitud?.asignadoA ||
    solicitud?.funcionarioAsignado ||
    "";

  if (encargadoGuardado && funcionarioExiste(encargadoGuardado)) {
    return obtenerFuncionarioPorNombre(encargadoGuardado)!;
  }

  return obtenerFuncionarioPorRegla(solicitud);
};

const normalizarSolicitudConFuncionario = (solicitud: any) => {
  const funcionario = obtenerFuncionarioAsignado(solicitud);

  return {
    ...solicitud,
    area: funcionario.area,
    departamento: funcionario.area,
    areaResponsable: funcionario.area,
    encargado: funcionario.nombre,
    funcionario: funcionario.nombre,
    asignadoA: funcionario.nombre,
    funcionarioAsignado: funcionario.nombre,
    funcionarioId: funcionario.id,
    cargoFuncionario: funcionario.cargo,
    numeroEmpleadoFuncionario: funcionario.numeroEmpleado,
  };
};

export const funcionariosService = {
  obtenerFuncionarios(): Funcionario[] {
    return funcionariosMunicipales;
  },

  loginFuncionario(
    numeroEmpleado: string,
    password: string
  ): {
    ok: boolean;
    mensaje: string;
    funcionario?: Funcionario;
  } {
    const funcionarioEncontrado = funcionariosMunicipales.find(
      (funcionario) =>
        funcionario.numeroEmpleado === numeroEmpleado &&
        funcionario.password === password
    );

    if (!funcionarioEncontrado) {
      return {
        ok: false,
        mensaje: "Número de empleado o contraseña incorrectos.",
      };
    }

    guardarFuncionarioSesion(funcionarioEncontrado);

    return {
      ok: true,
      mensaje: "Inicio de sesión funcionario correcto.",
      funcionario: funcionarioEncontrado,
    };
  },

  loginConWebAuthn(): {
    ok: boolean;
    mensaje: string;
    funcionario: Funcionario;
  } {
    const funcionarioWebAuthn = funcionariosMunicipales[0];

    guardarFuncionarioSesion(funcionarioWebAuthn);

    return {
      ok: true,
      mensaje: "Inicio de sesión con WebAuthn correcto.",
      funcionario: funcionarioWebAuthn,
    };
  },

  obtenerFuncionarioActual(): Funcionario | null {
    const keys = [
      FUNCIONARIO_ACTUAL_KEY,
      "funcionarioActual",
      "funcionario_logueado",
      "funcionarioLogueado",
      "current_funcionario",
    ];

    for (const key of keys) {
      const data = localStorage.getItem(key);

      if (!data) continue;

      try {
        const funcionario = JSON.parse(data);

        const encontrado =
          obtenerFuncionarioPorNumeroEmpleado(funcionario.numeroEmpleado || "") ||
          obtenerFuncionarioPorId(funcionario.id || "") ||
          obtenerFuncionarioPorNombre(funcionario.nombre || "");

        if (encontrado) {
          return encontrado;
        }
      } catch {
        continue;
      }
    }

    return null;
  },

  cerrarSesionFuncionario() {
    const keys = [
      FUNCIONARIO_ACTUAL_KEY,
      "funcionarioActual",
      "funcionario_logueado",
      "funcionarioLogueado",
      "current_funcionario",
      "usuario_actual",
      "usuarioActual",
      "current_user",
      "rol",
    ];

    keys.forEach((key) => localStorage.removeItem(key));
  },

  obtenerFuncionarioPorNombre,
  obtenerFuncionarioPorId,
  obtenerFuncionarioPorNumeroEmpleado,
  obtenerFuncionarioAsignado,
  normalizarSolicitudConFuncionario,
  funcionarioExiste,
  normalizarTexto,
};