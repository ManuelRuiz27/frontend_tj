# frontend_tj

Frontend del proyecto Tarjeta Joven construido con React, TypeScript y Vite. La aplicacion consume el backend oficial y expone las funcionalidades principales del programa para las personas usuarias.

## Requisitos previos
- Node.js 22.x.
- npm 10 o superior (incluido con Node 22).

## Instalacion
```bash
npm install
```

## Configuracion de entorno
1. Copia el archivo `.env.example` a `.env` si aun no existe.
2. Ajusta las variables segun el entorno objetivo:
   - `VITE_API_URL`: URL base del backend. En desarrollo local usa `http://localhost:8080/api/v1`. Tambien puedes definir `/api/v1` para aprovechar el proxy que expone Vite y evitar configuraciones de CORS.
   - `VITE_MAPS_URL`: URL publica de Google MyMaps que se muestra en la vista de mapa.
   - `VITE_ANALYTICS_URL`: endpoint HTTP al que se envian los eventos de analitica. Dejalo vacio para deshabilitar el envio (se mantendra el log en localStorage).
   - `VITE_SENTRY_DSN`: DSN publico del proyecto en Sentry para capturar errores en frontend.
   - `VITE_SENTRY_RELEASE`: identificador de release que veras en Sentry. Si no se define se tomara `VITE_APP_VERSION` o `VITE_COMMIT_SHA` (con el prefijo `frontend_tj@`) y, en ultima instancia, el `mode` de Vite.
   - `VITE_APP_VERSION` / `VITE_COMMIT_SHA`: valores opcionales que se propagan a Sentry y ayudan a identificar la version desplegada.

El archivo `src/config/env.ts` centraliza la lectura de estas variables, define valores por defecto seguros para desarrollo y facilita su consulta desde cualquier modulo.

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

## Despliegue en Vercel
### Deploy automatizado mediante GitHub
1. Sube el proyecto a GitHub (por ejemplo a la rama `main`) y verifica que la configuracion en `vercel.json` y `package.json` este versionada.
2. En Vercel selecciona **Add New > Project** y elige **Import Git Repository**. Autoriza el acceso al repositorio si es la primera vez.
3. Cuando el asistente detecte el framework deja el preset `Vite`. Valida que el comando de build sea `npm run build` y el directorio de salida `dist` (se toman de `package.json` y `vercel.json` respectivamente).
4. En la seccion **Environment Variables** agrega los valores documentados en el apartado anterior (`VITE_API_URL`, `VITE_MAPS_URL`, `VITE_ANALYTICS_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `VITE_APP_VERSION`, `VITE_COMMIT_SHA`). Puedes reutilizar un Environment Group para compartirlas entre `Production`, `Preview` y `Development`.
5. Define la rama de produccion (por ejemplo `main`) y habilita deploys previos automaticos para las demas ramas que necesites revisar.
6. Haz clic en **Deploy**. Vercel instalara dependencias, ejecutara `npm run build` y publicara la primera version productiva.
7. A partir de este punto cada `git push` generara un deploy de Preview y los cambios que lleguen a la rama de produccion ejecutaran un deploy productivo sin intervencion manual.

El archivo `vercel.json` ya incluye la configuracion de SPA (`index.html` como fallback) y secciona los rewrites para la API. Ajusta las reglas si deseas apuntar `/api` hacia otro dominio o si necesitas cabeceras adicionales.

### Deploy manual con CLI
1. Instala el CLI (`npm i -g vercel`) y autenticate con `vercel login`.
2. Configura las variables de entorno con `vercel env pull`/`vercel env add` o desde el panel web.
3. Ejecuta `vercel` para generar una Preview y `vercel --prod` cuando desees promover la build a produccion.

## Estructura principal
- `src/`: codigo fuente de la aplicacion.
- `public/`: archivos estaticos servidos sin procesamiento por Vite.
- `dist/`: salida generada despues de `npm run build` (no se versiona).

## Contribucion
Antes de abrir un Pull Request asegurate de:
- Probar los comandos principales (`npm run dev` y `npm run build`).
- Documentar cualquier nueva variable de entorno requerida.
- Anadir pruebas o pasos de verificacion manual cuando apliquen.
