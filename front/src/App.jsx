import { useEffect, useState } from 'react';
import { obtenerReservas, obtenerResumen, crearReserva, cancelarReserva } from './api';
import Resumen from './components/Resumen';
import ListaReservas from './components/ListaReservas';
import Formulario from './components/Formulario';
import './App.css';

export default function App() {
  const [reservas, setReservas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    try {
      setReservas(await obtenerReservas());
      setResumen(await obtenerResumen());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear(reserva) {
    try {
      await crearReserva(reserva);
      setError('');
      await cargar();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function cancelar(id) {
    try {
      await cancelarReserva(id);
      setError('');
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>Reservas de eventos</h1>
      {error && <p className="error">{error}</p>}
      <Resumen resumen={resumen} />
      <Formulario onCrear={crear} />
      <ListaReservas reservas={reservas} onCancelar={cancelar} />
    </main>
  );
}