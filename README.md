# frontend_tj

Frontend del proyecto Tarjeta Joven construido con React, TypeScript y Vite. La aplicacion consume el backend oficial y expone las funcionalidades principales del programa para las personas usuarias.

## Requisitos previos
- Node.js 18 o superior.
- npm 9 o superior (incluido con Node).

## Instalacion
```bash
npm install
```

## Configuracion de entorno
1. Copia el archivo `.env.example` a `.env` si aun no existe.
2. Ajusta las variables segun el entorno objetivo:
   - `VITE_API_URL`: URL base del backend. En desarrollo local usa `http://localhost:8080/api/v1`. Tambien puedes definir `/api/v1` para aprovechar el proxy que expone Vite y evitar configuraciones de CORS.
   - `VITE_MAPS_URL`: URL publica de Google MyMaps que se muestra en la vista de mapa.

Las peticiones se envian con `credentials: include` y cabeceras `Authorization` cuando hay una sesion activa. Si el backend responde con un `401` la sesion local se limpia de forma automatica.

## Autenticacion
- `useAuth` administra los tokens (`accessToken`, `refreshToken`), persiste el estado en `localStorage` y expone `login`, `logout`, `authenticateWithTokens` y `refreshProfile`. La funcion `login` envia `{ curp, password }` a `POST /api/v1/auth/login`, normalizando la CURP a mayusculas antes de enviarla. Tras autenticar obtiene el perfil desde `GET /api/v1/me` y limpia la sesion ante errores `401`.
- El formulario de `src/pages/Login.tsx` captura CURP y contrasena, valida que la CURP cumpla con el formato oficial y que la contrasena tenga al menos 8 caracteres, y muestra estados de carga o errores segun la respuesta del backend.
- `useOTP` continua disponible para flujos que requieran envio y verificacion de codigos OTP mediante los endpoints `POST /api/v1/auth/otp/send` y `POST /api/v1/auth/otp/verify`.

## Desarrollo y verificacion
- `npm run dev`: levanta el servidor de desarrollo en `http://localhost:3000` con proxy hacia `http://localhost:8080` para rutas que comienzan con `/api`.
- `npm run build`: compila el proyecto para produccion (ejecuta `tsc` y `vite build`). Este comando se ejecuto tras los ultimos cambios.
- `npm run preview`: sirve la build generada para validacion local.

Durante el desarrollo valida el flujo de catalogo y autenticacion apuntando el backend a `http://localhost:8080`. Comprueba que puedas iniciar sesion con una CURP valida y que al cerrar sesion se limpie el estado almacenado.

## Estructura principal
- `src/`: codigo fuente de la aplicacion.
- `public/`: archivos estaticos servidos sin procesamiento por Vite.
- `dist/`: salida generada despues de `npm run build` (no se versiona).

## Contribucion
Antes de abrir un Pull Request asegurate de:
- Probar los comandos principales (`npm run dev` y `npm run build`).
- Documentar cualquier nueva variable de entorno requerida.
- Anadir pruebas o pasos de verificacion manual cuando apliquen.
