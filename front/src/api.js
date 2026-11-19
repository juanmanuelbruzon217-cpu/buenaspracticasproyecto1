const BASE = import.meta.env.VITE_API_URL;

// Una sola funcion para todas las peticiones: evita repetir fetch y manejo de errores.
async function pedir(ruta, opciones) {
  const respuesta = await fetch(`${BASE}${ruta}`, opciones);
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'Error en la solicitud');
  return datos;
}

export function obtenerReservas() {
  return pedir('/reservas');
}

export function obtenerResumen() {
  return pedir('/reservas/resumen');
}

export function crearReserva(reserva) {
  return pedir('/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}

export function cancelarReserva(id) {
  return pedir(`/reservas/${id}/cancelar`, { method: 'PATCH' });
}