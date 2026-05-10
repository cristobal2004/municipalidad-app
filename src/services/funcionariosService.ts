export interface Funcionario {
  id: string;
  nombre: string;
  numeroEmpleado: string;
  password: string;
  area: string;
  cargo: string;
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
  },
  {
    id: "FUN-002",
    nombre: "Benjamin Gomez",
    numeroEmpleado: "87654321",
    password: "funcionario123",
    area: "Servicio Ciudadano",
    cargo: "Ejecutivo de Atención",
  },
  {
    id: "FUN-003",
    nombre: "Oscar Ruiz",
    numeroEmpleado: "11223344",
    password: "finanzas123",
    area: "Finanzas",
    cargo: "Analista Municipal",
  },
  {
    id: "FUN-004",
    nombre: "Pablo Aguilera",
    numeroEmpleado: "44556677",
    password: "obras123",
    area: "Obras Municipales",
    cargo: "Revisor Técnico",
  },
  {
    id: "FUN-005",
    nombre: "Martina Ponce",
    numeroEmpleado: "99887766",
    password: "patentes123",
    area: "Patentes Comerciales",
    cargo: "Encargada de Patentes",
  },
];

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

    localStorage.setItem(
      FUNCIONARIO_ACTUAL_KEY,
      JSON.stringify(funcionarioEncontrado)
    );

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
    const funcionarioWebAuthn: Funcionario = {
      id: "FUN-WEB-001",
      nombre: "Funcionario WebAuthn",
      numeroEmpleado: "WEB-001",
      password: "webauthn",
      area: "Administración Municipal",
      cargo: "Funcionario Verificado",
    };

    localStorage.setItem(
      FUNCIONARIO_ACTUAL_KEY,
      JSON.stringify(funcionarioWebAuthn)
    );

    return {
      ok: true,
      mensaje: "Inicio de sesión con WebAuthn correcto.",
      funcionario: funcionarioWebAuthn,
    };
  },

  obtenerFuncionarioActual(): Funcionario | null {
    const data = localStorage.getItem(FUNCIONARIO_ACTUAL_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  },

  cerrarSesionFuncionario() {
    localStorage.removeItem(FUNCIONARIO_ACTUAL_KEY);
  },
};