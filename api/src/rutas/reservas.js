const express = require('express');
const repositorio = require('../datos/repositorio');
const {
  MIN_ASISTENTES, MAX_ASISTENTES, MAX_HORAS_RESERVA,
  validarAsistentes, validarFechas, hayConflicto, calcularResumen
} = require('../logica/reglas-reservas');

const router = express.Router();

function responder(res, codigo, datos) {
  res.status(codigo).json(datos);
}

router.get('/', (req, res) => {
  responder(res, 200, repositorio.listar());
});

router.get('/resumen', (req, res) => {
  responder(res, 200, calcularResumen(repositorio.listar()));
});

router.post('/', (req, res) => {
  const { cliente, recurso, inicio, fin, asistentes } = req.body;

  if (!cliente || !recurso || !inicio || !fin || asistentes === undefined) {
    return responder(res, 400, { error: 'Faltan datos: cliente, recurso, inicio, fin y asistentes son obligatorios' });
  }
  if (!validarFechas(inicio, fin)) {
    return responder(res, 400, { error: `Fechas inválidas: el fin debe ser posterior al inicio y la reserva no puede superar ${MAX_HORAS_RESERVA} horas` });
  }
  if (!validarAsistentes(Number(asistentes))) {
    return responder(res, 400, { error: `Los asistentes deben ser un entero entre ${MIN_ASISTENTES} y ${MAX_ASISTENTES}` });
  }
  if (hayConflicto(repositorio.listar(), { recurso, inicio, fin })) {
    return responder(res, 409, { error: `El recurso ${recurso} ya está reservado en ese horario` });
  }

  const nueva = repositorio.agregar({
    id: Date.now(), cliente, recurso, inicio, fin,
    asistentes: Number(asistentes), estado: 'pendiente'
  });
  responder(res, 201, nueva);
});

router.patch('/:id/cancelar', (req, res) => {
  const reserva = repositorio.cancelar(Number(req.params.id));
  if (!reserva) {
    return responder(res, 404, { error: 'No existe una reserva con ese id' });
  }
  responder(res, 200, reserva);
});

module.exports = router;