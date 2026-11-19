import Tarjeta from './Tarjeta';

export default function Resumen({ resumen }) {
  if (!resumen) return null;
  return (
    <section className="resumen">
      <Tarjeta titulo="Reservas activas" valor={resumen.activas} />
      <Tarjeta titulo="Canceladas" valor={resumen.canceladas} />
      <Tarjeta titulo="Horas reservadas" valor={resumen.horasReservadas} />
    </section>
  );
}