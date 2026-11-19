export default function Tarjeta({ titulo, valor }) {
  return (
    <div className="tarjeta">
      <h3>{titulo}</h3>
      <p>{valor}</p>
    </div>
  );
}