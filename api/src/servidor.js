const express = require('express');
const cors = require('cors');
const rutasReservas = require('./rutas/reservas');

const app = express();

// Desarrollo: abierto. Entrega: se define FRONT_URL con la URL del bucket de S3.
app.use(cors(process.env.FRONT_URL ? { origin: process.env.FRONT_URL } : undefined));
app.use(express.json());

function registrar(req, res, siguiente) {
  console.log(`${req.method} ${req.url}`);
  siguiente();
}
app.use(registrar);

app.use('/reservas', rutasReservas);

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log('API escuchando en el puerto ' + PUERTO));