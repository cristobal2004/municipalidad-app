const bcrypt = require("bcrypt");
const pool = require("./connection");

const funcionarios = [
  {
    nombre: "Cristian Mejías",
    rut: "12.345.678-0",
    correo: "cristian.mejias@santodomingo.cl",
    numeroEmpleado: "12345678",
    password: "admin123",
    area: "Atención General",
    cargo: "Funcionario Municipal",
    rol: "funcionario",
  },
  {
    nombre: "Benjamin Gomez",
    rut: "87.654.321-0",
    correo: "benjamin.gomez@santodomingo.cl",
    numeroEmpleado: "87654321",
    password: "funcionario123",
    area: "Servicio Ciudadano",
    cargo: "Ejecutivo de Atención",
    rol: "funcionario",
  },
  {
    nombre: "Oscar Ruiz",
    rut: "11.223.344-0",
    correo: "oscar.ruiz@santodomingo.cl",
    numeroEmpleado: "11223344",
    password: "finanzas123",
    area: "Finanzas",
    cargo: "Analista Municipal",
    rol: "funcionario",
  },
  {
    nombre: "Pablo Aguilera",
    rut: "44.556.677-0",
    correo: "pablo.aguilera@santodomingo.cl",
    numeroEmpleado: "44556677",
    password: "obras123",
    area: "Obras Municipales",
    cargo: "Revisor Técnico",
    rol: "funcionario",
  },
  {
    nombre: "Martina Ponce",
    rut: "99.887.766-0",
    correo: "martina.ponce@santodomingo.cl",
    numeroEmpleado: "99887766",
    password: "patentes123",
    area: "Patentes Comerciales",
    cargo: "Encargada de Patentes",
    rol: "funcionario",
  },
];

const seedFuncionarios = async () => {
  try {
    for (const funcionario of funcionarios) {
      const passwordHash = await bcrypt.hash(funcionario.password, 10);

      await pool.query(
        `
        INSERT INTO usuarios
        (
          nombre,
          rut,
          correo,
          password_hash,
          rol,
          region,
          comuna,
          tipo_usuario,
          area,
          numero_empleado,
          cargo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (correo)
        DO UPDATE SET
          nombre = EXCLUDED.nombre,
          rut = EXCLUDED.rut,
          password_hash = EXCLUDED.password_hash,
          rol = EXCLUDED.rol,
          region = EXCLUDED.region,
          comuna = EXCLUDED.comuna,
          tipo_usuario = EXCLUDED.tipo_usuario,
          area = EXCLUDED.area,
          numero_empleado = EXCLUDED.numero_empleado,
          cargo = EXCLUDED.cargo
        `,
        [
          funcionario.nombre,
          funcionario.rut,
          funcionario.correo,
          passwordHash,
          funcionario.rol,
          "Valparaíso",
          "Santo Domingo",
          "funcionario",
          funcionario.area,
          funcionario.numeroEmpleado,
          funcionario.cargo,
        ]
      );

      console.log(`Funcionario creado/actualizado: ${funcionario.nombre}`);
    }

    console.log("Seed de funcionarios finalizado correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando seed de funcionarios:", error);
    process.exit(1);
  }
};

seedFuncionarios();