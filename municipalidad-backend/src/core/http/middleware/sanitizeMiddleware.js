const xss = require("xss");

const clavesSensibles = new Set([
  "password",
  "confirmPassword",
  "confirmacionPassword",
  "token",
]);

const limpiarValor = (valor, clave = "") => {
  if (typeof valor === "string") {
    if (clavesSensibles.has(clave)) {
      return valor;
    }

    return xss(valor.trim());
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => limpiarValor(item, clave));
  }

  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([claveActual, item]) => [
        claveActual,
        limpiarValor(item, claveActual),
      ])
    );
  }

  return valor;
};

const sanitizarPropiedades = (coleccion) => {
  if (!coleccion || typeof coleccion !== "object") {
    return;
  }

  for (const clave of Object.keys(coleccion)) {
    coleccion[clave] = limpiarValor(coleccion[clave], clave);
  }
};

const sanitizarEntrada = (req, res, next) => {
  if (req.body) {
    req.body = limpiarValor(req.body);
  }

  // Express 5 expone req.query mediante un getter, por lo que no debe reasignarse.
  sanitizarPropiedades(req.query);
  sanitizarPropiedades(req.params);

  next();
};

module.exports = {
  sanitizarEntrada,
};
