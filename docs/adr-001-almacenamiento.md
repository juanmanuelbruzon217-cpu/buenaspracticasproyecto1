# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 20 de octubre de 2026
- Autor: Juan Manuel Bruzón
- Estado: Aceptada

## Contexto

El proyecto es "Gestor de Eventos", un sitio web que permite a los asistentes reservar un evento indicando su nombre, el evento, la fecha y la hora.

Hasta la Fase 1 el sitio estaba publicado en S3, pero sin ninguna protección: si alguien borraba o sobrescribía un archivo como `index.html`, el sitio se caía con un error 404 y no había forma de recuperarlo.

El proyecto además va a manejar datos de personas (reservas de asistentes, comprobantes de pago o inscripción, respaldos y logs de errores) y no existía ningún lugar definido para guardarlos ni un criterio para decidir qué puede ser público y qué no.

El bucket privado solo tenía un archivo de prueba sin significado real, y el bucket del sitio no tenía ninguna política de retención, por lo que, una vez activado el versionado, las versiones antiguas se acumularían sin límite y con costo.

El problema concreto a resolver es doble: que los errores humanos se puedan deshacer, y que cada tipo de dato quede en el lugar correcto, con acceso acorde a su sensibilidad y con un costo controlado.

## Decisión

Se adoptó una arquitectura de **dos buckets** en Amazon S3:

1. **Bucket del sitio (`cuc-bp-eq04-bruzon-sitio-2026`):** contiene los archivos que el navegador debe descargar para mostrar la página (`index.html`, `css/`, `js/` y los afiches de eventos). Es de lectura pública, porque un visitante tiene que poder cargarlos.
   - **Versionado: activado.** Un borrado accidental deja un delete marker en lugar de eliminar el archivo, y el sitio se recupera quitando el marcador. Esto se comprobó en el laboratorio: al borrar `index.html` el sitio dio 404 y volvió al quitar el delete marker.
   - **Regla de ciclo de vida `retencion-sitio`** (aplicada a todos los objetos del bucket): las versiones vigentes pasan a Standard-IA a los 30 días y las versiones no vigentes se eliminan a los 30 días. No se configuró transición a Glacier.

2. **Bucket privado (`cuc-bp-eq04-bruzon-privado-2026`):** contiene los datos de las personas y de operación, organizados en cuatro prefijos según la matriz de clasificación: `reservas/`, `comprobantes/`, `respaldos/` y `logs/`. No tiene acceso público.
   - **Versionado: activado  

## Alternativas consideradas

1. **Un solo bucket para todo.** Se descartó porque mezclaría el contenido público del sitio con datos personales y respaldos. Como un bucket tiene una única configuración de acceso público, un error al abrirlo para que el sitio funcione expondría también las reservas y los comprobantes de los asistentes. Con dos buckets, ese error queda contenido en el que no tiene datos sensibles.

2. **No activar el versionado.** Se descartó porque, sin él, el borrado de `index.html` es definitivo: el sitio queda en 404 hasta volver a subir el archivo manualmente, y solo si alguien conserva una copia local. El versionado resuelve el mismo problema en segundos y sin herramientas adicionales.

3. **Activar el versionado sin regla de ciclo de vida.** Se descartó porque cada versión se conserva indefinidamente y se cobra mientras exista. Aunque hoy el volumen es pequeño, los errores y despliegues repetidos harían crecer el almacenamiento sin ningún beneficio, ya que una versión de hace muchos meses rara vez se necesita recuperar. La regla limita ese costo y mantiene una ventana de 30 días para corregir errores.

## Consecuencias

### Positivas

- Los errores humanos sobre los archivos del sitio se pueden deshacer: el sitio se recupera en segundos quitando el delete marker.
- Los datos sensibles (reservas, comprobantes, respaldos) están separados del contenido público, por lo que una mala configuración del sitio no los expone.
- Los prefijos del bucket privado permiten aplicar permisos y reglas distintas por tipo de dato (por ejemplo, que `logs/` lo lea solo el equipo de desarrollo y `comprobantes/` solo el administrador).
- Las versiones antiguas del sitio no se acumulan indefinidamente.

### Costos o desventajas que aceptamos

- Se paga almacenamiento por las versiones anteriores durante los 30 días que se conservan.
- Pasados esos 30 días, una versión no vigente se elimina de forma definitiva: un error que se detecte después de ese plazo ya no se podrá deshacer con el versionado.
- Al no haber Glacier, no se aprovecha el almacenamiento más barato para datos que casi no se consultan.
- Mantener dos buckets implica configurar y vigilar el acceso de dos lugares en lugar de uno.

### Qué habría que revisar más adelante

- Si la transición a Standard-IA realmente ahorra algo en el bucket del sitio: sus archivos son pequeños, y S3 aplica un tamaño mínimo de facturación (y por defecto un tamaño mínimo para las transiciones), por lo que el efecto puede ser mínimo.
- Cuando crezca el volumen de `respaldos/`, definir una regla de ciclo de vida para el bucket privado, evaluando Glacier Instant Retrieval para datos que se consultan poco pero deben estar disponibles de inmediato.
- Si 30 días son suficientes para eliminar versiones no vigentes, según cuánto se tarde en la práctica en detectar un error.
- Aplicar políticas de acceso por prefijo en el bucket privado cuando existan usuarios distintos (aplicación, administrador, equipo de desarrollo).
