export default function ListaReservas({ reservas, onCancelar }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Cliente</th><th>Recurso</th><th>Inicio</th><th>Fin</th>
          <th>Asistentes</th><th>Estado</th><th></th>
        </tr>
      </thead>
      <tbody>
        {reservas.map(r => (
          <tr key={r.id}>
            <td>{r.cliente}</td>
            <td>{r.recurso}</td>
            <td>{r.inicio}</td>
            <td>{r.fin}</td>
            <td>{r.asistentes}</td>
            <td>{r.estado}</td>
            <td>
              {r.estado !== 'cancelada' && (
                <button onClick={() => onCancelar(r.id)}>Cancelar</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}