const CLAVE_ALMACENAMIENTO = "eventosReservados";

let listaEventos = cargarEventos();

document.getElementById("formularioReserva").addEventListener("submit", function (e) {
    e.preventDefault();
    procesarReserva();
});

function cargarEventos() {
    const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return datos ? JSON.parse(datos) : [];
}

function guardarEventos() {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(listaEventos));
}

function mostrarAviso(texto, tipo) {
    const aviso = document.getElementById("avisoEstado");
    aviso.textContent = texto;
    aviso.style.color = tipo === "error" ? "red" : "green";
}

function procesarReserva() {
    const nombre = document.getElementById("nombreAsistente").value.trim();
    const evento = document.getElementById("tipoEvento").value;
    const fecha = document.getElementById("fechaEvento").value;
    const hora = document.getElementById("horaEvento").value;

    if (!nombre || !evento || !fecha || !hora) {
        mostrarAviso("Completa todos los campos antes de continuar.", "error");
        return;
    }

    const conflicto = listaEventos.find(
        (ev) => ev.evento === evento && ev.fecha === fecha && ev.hora === hora
    );

    if (conflicto) {
        mostrarAviso("Ese horario ya está reservado para ese evento.", "error");
        return;
    }

    listaEventos.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        nombre,
        evento,
        fecha,
        hora,
    });

    guardarEventos();
    mostrarAviso(`Reserva confirmada para ${nombre}.`, "exito");
    document.getElementById("formularioReserva").reset();
}
function eliminarEvento(id) {
    listaEventos = listaEventos.filter((ev) => ev.id !== id);
    guardarEventos();
    renderizarLista();
}
function renderizarLista() {
    const contenedor = document.getElementById("contenedorReservas");

    if (listaEventos.length === 0) {
        contenedor.innerHTML = "<p>Aún no hay reservas registradas.</p>";
        return;
    }

    contenedor.innerHTML = listaEventos
        .map(
            (ev) => `
        <div class="tarjeta-reserva">
            <div class="info">
                <strong>${ev.nombre} — ${ev.evento}</strong>
                <small>${ev.fecha} · ${ev.hora}</small>
            </div>
            <button onclick="eliminarEvento('${ev.id}')">Cancelar</button>
        </div>
    `
        )
        .join("");
}

renderizarLista();