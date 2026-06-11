const xss = require("xss");

const limpiarValor = (valor) => {
  if (typeof valor === "string") {
    return xss(valor.trim());
  }

  if (Array.isArray(valor)) {
    return valor.map(limpiarValor);
  }

  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, item]) => [clave, limpiarValor(item)])
    );
  }

  return valor;
};

const sanitizarEntrada = (req, res, next) => {
  req.body = limpiarValor(req.body);
  req.query = limpiarValor(req.query);
  req.params = limpiarValor(req.params);

  next();
};

module.exports = {
  sanitizarEntrada,
};