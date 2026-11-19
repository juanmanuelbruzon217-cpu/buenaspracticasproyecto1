# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 2026-10-20
- Autor: Andres David Bustamante Heredia
- Estado: Aceptada

## Contexto

El proyecto es el Gestor de Eventos V2, una página web estática donde un asistente registra su nombre, el evento, la fecha y la hora de una reserva. Al inicio, el sitio vivía en un solo bucket de S3 con alojamiento de sitio web estático y sin versionado.
En esa configuración, borrar un objeto era definitivo: si alguien eliminaba un archivo del sitio (por ejemplo `index.html`), el sitio devolvía un error 404 y no había forma de recuperar el archivo.
Además, no había separación entre lo que debe ser público (el código del sitio) y lo que no (reservas con nombres de personas, respaldos y registros de actividad), de modo que cualquier dato personal guardado junto al sitio habría quedado expuesto.
Al activar el versionado para resolver el primer problema apareció otro: el bucket guarda todas las versiones de todo y cada versión cuesta, así que el almacenamiento crece sin límite si no se controla.
El problema a resolver era, entonces, triple: poder recuperar archivos borrados, separar datos públicos de privados y evitar que el costo de las versiones crezca sin control.

## Decisión

Se adoptó la siguiente estructura:

- **Dos buckets en la región us-east-1:**
  - `cuc-bp-eq04-bustamante-sitio-2026`: **público**, con alojamiento de sitio web estático. Contiene solo lo que el navegador debe poder descargar (HTML, CSS, JS y el catálogo de eventos).
  - `cuc-bp-eq04-bustamante-privado-2026`: **privado**, sin acceso público. Contiene los datos de las personas y del sistema.
- **Prefijos en el bucket privado:** `reservas/` (datos de cada asistente), `respaldos/` (copias completas de las reservas) y `logs/` (registros de actividad). Cada prefijo corresponde a un tipo de dato de la matriz de clasificación.
- **Versionado activo en ambos buckets.** Si un objeto se elimina, S3 solo agrega un marcador de eliminación; el sitio se recupera borrando ese marcador, y así se resolvió la caída del sitio por 404.
- **Regla de ciclo de vida `retencion-sitio` en el bucket del sitio**, aplicada a todo el bucket:
  - Versiones actuales: a Standard-IA a los **30 días** y a Glacier Flexible Retrieval a los **90 días**.
  - Versiones no actuales: eliminación permanente a los **180 días**.

Los plazos se eligieron así: 30 días es el mínimo que S3 permite para pasar a Standard-IA y coincide con el momento en que una reserva deja de consultarse; 90 días es un plazo razonable para considerar un evento como historial; 180 días es tiempo suficiente para notar y corregir un error antes de perder la versión anterior.

## Alternativas consideradas

1. **Dejar el sitio en Netlify (o similar) y no usar S3 para el sitio.** Se descartó porque el objetivo de esta fase es aprender y demostrar el diseño del almacenamiento en AWS, y porque Netlify no resuelve por sí solo dónde guardar los datos privados de las reservas, que de todos modos necesitarían un almacenamiento aparte.
2. **Usar un solo bucket para todo (sitio y datos).** Se descartó porque un bucket público con datos de asistentes expone nombres y reservas a cualquiera con la URL, y porque los permisos de S3 se aplican por bucket: no se puede dejar el sitio abierto sin abrir también lo demás sin depender de políticas muy delicadas. Dos buckets hacen que el error más grave (hacer público lo privado) sea mucho más difícil de cometer.
3. **Activar el versionado sin regla de ciclo de vida.** Se descartó porque resuelve la recuperación pero deja el costo creciendo para siempre: cada versión vieja se cobra indefinidamente sin que nadie vaya a usarla.

## Consecuencias

### Positivas

- Un archivo borrado por error se recupera eliminando el marcador de eliminación, sin perder datos ni tener que volver a subirlos.
- Los datos personales de los asistentes quedan fuera del alcance público por diseño.
- El costo de las versiones viejas se controla solo, sin intervención manual.
- La decisión queda documentada con sus razones para quien llegue al equipo después.

### Costos o desventajas que aceptamos

- El versionado consume almacenamiento adicional: cada versión se cobra mientras exista.
- Standard-IA y Glacier cobran por recuperar datos y tienen tiempos mínimos de permanencia; Glacier Flexible Retrieval tarda de minutos a horas en devolver un objeto.
- Hay que administrar dos buckets y sus permisos en lugar de uno.
- En una estimación de ejemplo con 100 GB, la regla baja el costo anual de 27.60 USD (todo en Standard) a 12.24 USD, un ahorro de 15.36 USD (cerca de 56 %). Con el volumen real del proyecto, que pesa kilobytes, el ahorro sería de centavos.

### Que habria que revisar mas adelante

- **Riesgo de Glacier en el sitio:** la regla aplica a todo el bucket y mueve a Glacier las versiones actuales a los 90 días. Un archivo del sitio de más de 128 KB (por ejemplo una imagen o un video) podría archivarse y dejar de cargar hasta restaurarlo. Conviene limitar la regla a un prefijo (por ejemplo `archivo/`) o excluir los archivos que sirven el sitio.
- **Tamaño mínimo de 128 KB:** las transiciones ignoran por defecto los objetos más pequeños, por lo que con los archivos actuales la regla casi no mueve nada. Su valor real hoy es la eliminación de versiones no actuales.
- **Bucket privado sin regla de ciclo de vida:** tiene versionado activo pero no una regla propia, así que sus versiones viejas se acumulan. Habría que definirla cuando el sistema empiece a guardar reservas y respaldos de verdad.
- **Recuperación de borrados:** el procedimiento de borrar el marcador de eliminación es manual; si el equipo crece, convendría documentarlo como un procedimiento de recuperación.
