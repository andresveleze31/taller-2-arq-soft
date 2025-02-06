const express = require("express");
const httpProxy = require("http-proxy");
const cors = require("cors");
const axios = require("axios");

const app = express();
const proxy = httpProxy.createProxyServer({});
const servers = [
  { url: "http://localhost:3000", active: true },
  { url: "http://localhost:3001", active: true },
];
let currentIndex = 0;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// Función para verificar si un servidor está activo
const checkServerStatus = async (server) => {
  try {
    await axios.get(`${server.url}/ping`);
    server.active = true;
  } catch (error) {
    console.error(`Servidor caído: ${server.url}`);
    server.active = false;
  }
};

// Verificar servidores cada 5 segundos
setInterval(() => {
  servers.forEach(checkServerStatus);
}, 2000);

app.use((req, res) => {
  // Encontrar un servidor activo
  let attempts = 0;
  while (attempts < servers.length) {
    const server = servers[currentIndex];

    if (server.active) {
      console.log(`Redirigiendo a: ${server.url}`);
      proxy.web(req, res, { target: server.url }, (err) => {
        console.error("Error en proxy:", err);
        server.active = false; // Si falla, lo marcamos como inactivo
      });
      currentIndex = (currentIndex + 1) % servers.length;
      return;
    }

    // Si el servidor está inactivo, pasamos al siguiente
    currentIndex = (currentIndex + 1) % servers.length;
    attempts++;
  }

  // Si no hay servidores activos, devolver error
  res.status(503).send("No hay servidores disponibles");
});

app.listen(5000, () => {
  console.log("Balanceador de carga corriendo en el puerto 5000");
});
