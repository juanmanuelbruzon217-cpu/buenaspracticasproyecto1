let reservas = [
  { id: 1, cliente: 'Ana', recurso: 'Sonido', inicio: '2026-12-01T08:00:00', fin: '2026-12-01T12:00:00', asistentes: 50, estado: 'confirmada' },
  { id: 2, cliente: 'Luis', recurso: 'Proyector', inicio: '2026-12-02T14:00:00', fin: '2026-12-02T16:00:00', asistentes: 20, estado: 'pendiente' }
];

function listar() { return reservas; }

function agregar(nueva) {
  reservas.push(nueva);
  return nueva;
}

function cancelar(id) {
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return null;
  reserva.estado = 'cancelada';
  return reserva;
}

module.exports = { listar, agregar, cancelar };