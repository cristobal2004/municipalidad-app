const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  convertirPyme,
  formatearSolicitud,
  normalizarDocumentosFaltantes,
  normalizarEstado,
  parsearDocumentos,
} = require("../src/features/solicitudes/domain/solicitudMapper");

test("normaliza estados equivalentes y usa un estado seguro por defecto", () => {
  assert.equal(normalizarEstado("aprobado"), "aprobada");
  assert.equal(normalizarEstado("pendiente_de_documentos"), "observada");
  assert.equal(normalizarEstado("estado-desconocido"), "pendiente");
});

test("convierte valores comunes de pyme", () => {
  assert.equal(convertirPyme(true), true);
  assert.equal(convertirPyme("si"), true);
  assert.equal(convertirPyme("false"), false);
});

test("parsea documentos JSON sin lanzar errores por entradas corruptas", () => {
  assert.deepEqual(parsearDocumentos('[{"nombre":"archivo.pdf"}]'), [
    { nombre: "archivo.pdf" },
  ]);
  assert.deepEqual(parsearDocumentos("{invalido"), []);
});

test("normaliza documentos faltantes desde arreglos o texto", () => {
  assert.deepEqual(normalizarDocumentosFaltantes([" RUT ", ""]), ["RUT"]);
  assert.deepEqual(normalizarDocumentosFaltantes("RUT, Escritura"), [
    "RUT",
    "Escritura",
  ]);
});

test("formatea la entidad de base sin exponer nombres internos", () => {
  const solicitud = formatearSolicitud({
    id: 9,
    codigo: "SOL-2026-0009",
    usuario_id: 2,
    funcionario_id: 3,
    tipo_tramite: "Patente",
    estado: "en_revision",
    documentos: [],
    documentos_faltantes: [],
  });

  assert.equal(solicitud.id, "SOL-2026-0009");
  assert.equal(solicitud.estado, "En revisión");
  assert.equal(solicitud.usuario_id, undefined);
});
