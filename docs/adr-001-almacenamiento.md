# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 2026-10-20
- Autor: Mateo David Vargas Aguas
- Estado: Aceptada

## Contexto

El proyecto es una plataforma de reservas y gestión de eventos que hasta ahora no tenía una estrategia definida de almacenamiento. Los archivos del sitio web, las imágenes de los eventos, las reservas de los asistentes, los respaldos de la base de datos y los reportes de gestión no estaban separados por nivel de sensibilidad. Algunos de estos datos deben ser visibles para cualquier visitante, y otros contienen datos personales de los asistentes (nombre y correo) que no pueden quedar expuestos. Además, un borrado accidental de un archivo, como ocurrió con index.html en el laboratorio, podía significar la pérdida permanente de información. Por último, guardar todo en S3 Standard indefinidamente genera un costo innecesario para datos que casi no se consultan. Había que decidir cuántos buckets usar, quién puede leer cada tipo de dato, si activar el versionado y cómo controlar el costo en el tiempo.

## Decision

Se adoptan dos buckets en la región US East (N. Virginia):

1. **Bucket público**: aloja los archivos del sitio web (index.html, CSS y JavaScript) y las imágenes de los eventos. Tiene lectura pública mediante política de bucket y alojamiento de sitio web estático.
2. **Bucket privado**: aloja las reservas de asistentes, los respaldos de la base de datos y los reportes de gestión. Tiene el bloqueo de acceso público activado y solo los administradores autorizados pueden leerlo mediante IAM.

Dentro de cada bucket se usan prefijos separados por tipo de dato (por ejemplo `reservas/`, `respaldos/` y `reportes/`), para poder aplicar permisos y reglas de ciclo de vida distintas a cada uno.

El versionado queda **activado en el bucket privado**, donde los datos cambian constantemente y no se podrían reconstruir si se borran por error. En el bucket público queda **desactivado**, porque el código fuente está respaldado en Git y los archivos son pequeños.

Se crea la regla de ciclo de vida `retencion-sitio` con estos plazos:

- Pasar a S3 Standard-IA a los **30 días**.
- Pasar a S3 Glacier Flexible Retrieval a los **180 días**.
- Eliminar versiones no vigentes a los **90 días**.

## Alternativas consideradas

1. **Dejar el sitio en Netlify y usar S3 solo para los datos privados.** Se descartó porque el proyecto necesita practicar y evaluar la solución completa en AWS, y mantener el sitio en otro proveedor agregaría una plataforma más que administrar y configurar.
2. **Usar un solo bucket para todo.** Se descartó porque obligaría a mezclar archivos públicos con datos personales en el mismo bucket. Un error en una política de acceso podría exponer los respaldos y las reservas de los asistentes. Con dos buckets, el bucket privado nunca queda abierto por accidente.
3. **No activar el versionado en ningún bucket.** Se descartó porque un borrado o una sobrescritura accidental en el bucket privado sería irrecuperable. En el laboratorio se vio que, con el versionado activo, el sitio se pudo recuperar quitando el delete marker.
4. **Activar el versionado sin regla de ciclo de vida.** Se descartó porque las versiones antiguas se acumularían sin límite y el costo de almacenamiento crecería sin control. La regla pone un tope de 90 días a las versiones no vigentes.

## Consecuencias

### Positivas

- Los datos personales de los asistentes quedan aislados de los archivos públicos, lo que reduce el riesgo de exposición.
- Los borrados y las sobrescrituras accidentales en el bucket privado se pueden recuperar.
- El costo baja de forma automática: en la estimación con 100 GB durante 12 meses en calculator.aws, el costo pasó de 27,60 USD sin la regla a aproximadamente 10,71 USD con la regla, un ahorro de unos 16,89 USD al año (cerca de 61 %).

### Costos o desventajas que aceptamos

- Hay dos buckets que administrar en vez de uno, con sus propias políticas y permisos.
- El versionado en el bucket privado genera costo extra por almacenar versiones antiguas durante 90 días.
- Recuperar datos desde Glacier es lento y tiene costo adicional, por lo que los respaldos archivados no están disponibles de inmediato.

### Que habria que revisar mas adelante

- Los plazos (30, 180 y 90 días) se eligieron por estimación y no con datos reales de uso. Hay que revisarlos cuando el proyecto tenga tráfico real.
- Los archivos que necesitan acceso inmediato (como index.html) no pueden pasar a Glacier. Hay que limitar la regla por prefijo para que la transición a Glacier solo afecte a respaldos y reportes antiguos.
- Si el volumen de datos crece de forma importante, conviene volver a estimar el costo en calculator.aws.
