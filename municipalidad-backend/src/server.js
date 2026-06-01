const app = require("./app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`Servidor backend disponible en la red local usando tu IP en el puerto ${PORT}`);
});