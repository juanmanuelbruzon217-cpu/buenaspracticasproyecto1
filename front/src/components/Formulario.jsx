import { useState } from 'react';
import Campo from './Campo';

const VACIO = { cliente: '', recurso: '', inicio: '', fin: '', asistentes: '' };

export default function Formulario({ onCrear }) {
  const [datos, setDatos] = useState(VACIO);

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    // Las reglas (horas maximas, asistentes, choques de horario) las valida el servidor.
    const creada = await onCrear({ ...datos, asistentes: Number(datos.asistentes) });
    if (creada) setDatos(VACIO);
  }

  return (
    <form onSubmit={enviar}>
      <Campo etiqueta="Cliente" nombre="cliente" valor={datos.cliente} onCambio={cambiar} />
      <Campo etiqueta="Recurso" nombre="recurso" valor={datos.recurso} onCambio={cambiar} />
      <Campo etiqueta="Inicio" nombre="inicio" tipo="datetime-local" valor={datos.inicio} onCambio={cambiar} />
      <Campo etiqueta="Fin" nombre="fin" tipo="datetime-local" valor={datos.fin} onCambio={cambiar} />
      <Campo etiqueta="Asistentes" nombre="asistentes" tipo="number" valor={datos.asistentes} onCambio={cambiar} />
      <button type="submit">Reservar</button>
    </form>
  );
}