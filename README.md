# Sistema de reservas de eventos

Aplicación web para reservar eventos y equipos (sonido, proyector, luces) con control de horarios: la API rechaza reservas que superan las 12 horas o que chocan con otra del mismo recurso.

## Integrantes

| Nombre completo | A qué se dedicó |
|---|---|
| Mateo David Vargas Aguas | Back-end Node/Express, reglas de negocio y pruebas |
| Andrés David Bustamante Heredia | Front-end en React |
| Juan Manuel Bruzón | Despliegue en AWS, seguridad y documentación |

## Tecnologías

React (Vite), Node.js, Express, Vitest, AWS S3 y EC2, Git y GitHub.

## Cómo levantarlo en local

```
git clone https://github.com/juanmanuelbruzon217-cpu/buenaspracticasproyecto1.git
cd buenaspracticasproyecto1
```

API (puerto 3000):
```
cd api
npm install
npm run dev
```

Front (en otra terminal, http://localhost:5173):
```
cd front
npm install
npm run dev
```

Variables de entorno:
- Front: `VITE_API_URL` en `front/.env.development` (copiar de `front/.env.example`). En local vale `http://localhost:3000`.
- API: `PORT` (por defecto 3000) y `FRONT_URL`, el origen permitido por CORS. Si no se define, CORS queda abierto, solo para desarrollo.

## Endpoints de la API

| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| GET | /reservas | Lista todas las reservas | 200 · arreglo |
| GET | /reservas/resumen | Total, activas, canceladas y horas reservadas | 200 · objeto |
| POST | /reservas | Crea una reserva. Requiere cliente, recurso, inicio, fin y asistentes | 201 · la creada<br>400 · datos inválidos<br>409 · horario ocupado |
| PATCH | /reservas/:id/cancelar | Cancela una reserva | 200 · la reserva<br>404 · no existe |

## Cómo correr las pruebas

```
cd api
npm test
```

Son 9 pruebas sobre las reglas del negocio, incluidos casos límite.

## Despliegue

- Front: bucket de S3 con sitio web estático, `http://cuc-bp-eq04-bruzon-sitio-2026.s3-website-us-east-1.amazonaws.com`
- API: instancia EC2 con Amazon Linux 2023 (`deploy/user-data.sh`), puerto 80.

Para volver a desplegar:
1. Crear el Security Group con una sola regla de entrada, HTTP 80.
2. Lanzar la EC2 sin key pair y pegar `deploy/user-data.sh` en *User data*.
3. Crear `front/.env.production` con `VITE_API_URL=http://IP-PUBLICA`.
4. `cd front && npm run build` y subir el contenido de `dist/` al bucket del sitio.

### Seguridad

- Validación en el servidor en todas las rutas que reciben datos.
- `.env` fuera de Git; se incluyen `.env.example` en `api/` y `front/`.
- CORS restringido al bucket del front (`FRONT_URL`).
- Security Group con una sola regla de entrada y SSH cerrado.
- `npm audit`: 0 vulnerabilidades en `api` y 0 en `front`.

## Despliegue en AWS

| Integrante | URL del sitio | Bucket del sitio | Bucket privado |
|---|---|---|---|
| Juan Manuel Bruzon | http://cuc-bp-eq04-bruzon-sitio-2026.s3-website-us-east-1.amazonaws.com | cuc-bp-eq04-bruzon-sitio-2026 | cuc-bp-eq04-bruzon-privado-2026 |
| Andrés Bustamante Heredia | http://cuc-bp-eq04-bustamante-sitio-2026.s3-website-us-east-1.amazonaws.com | cuc-bp-eq04-bustamante-sitio-2026 | cuc-bp-eq04-bustamante-privado-2026 |