// Duración máxima de una reserva. Si cambia la política, cambia aquí y en ninguna otra parte.
const MAX_HORAS_RESERVA = 12;
const MIN_ASISTENTES = 1;
const MAX_ASISTENTES = 500;
const MS_POR_HORA = 3600000;

function calcularDuracionHoras(inicio, fin) {
  return (new Date(fin) - new Date(inicio)) / MS_POR_HORA;
}

function validarAsistentes(asistentes) {
  return Number.isInteger(asistentes) &&
    asistentes >= MIN_ASISTENTES &&
    asistentes <= MAX_ASISTENTES;
}

function validarFechas(inicio, fin) {
  if (isNaN(new Date(inicio)) || isNaN(new Date(fin))) return false;
  const horas = calcularDuracionHoras(inicio, fin);
  return horas > 0 && horas <= MAX_HORAS_RESERVA;
}

// Los recursos se comparan sin importar mayusculas ni espacios sobrantes.
function normalizar(texto) {
  return String(texto).trim().toLowerCase();
}

// Dos reservas del mismo recurso chocan si sus horarios se solapan.
// Una que termina justo cuando otra empieza NO choca.
function hayConflicto(existentes, nueva) {
  return existentes.some(r =>
   normalizar(r.recurso) === normalizar(nueva.recurso) &&
    r.estado !== 'cancelada' &&
    new Date(nueva.inicio) < new Date(r.fin) &&
    new Date(nueva.fin) > new Date(r.inicio)
  );
}

function calcularResumen(reservas) {
  const activas = reservas.filter(r => r.estado !== 'cancelada');
  return {
    total: reservas.length,
    activas: activas.length,
    canceladas: reservas.length - activas.length,
    horasReservadas: activas.reduce((s, r) => s + calcularDuracionHoras(r.inicio, r.fin), 0)
  };
}

module.exports = {
  MAX_HORAS_RESERVA, MIN_ASISTENTES, MAX_ASISTENTES,
  calcularDuracionHoras, validarAsistentes, validarFechas, hayConflicto, calcularResumen
};