export default function Campo({ etiqueta, nombre, valor, onCambio, tipo = 'text' }) {
  return (
    <label className="campo">
      {etiqueta}
      <input name={nombre} type={tipo} value={valor} onChange={onCambio} required />
    </label>
  );
}