# frontend_tj

Frontend del proyecto Tarjeta Joven construido con React, TypeScript y Vite. Este paquete proporciona la interfaz de usuario para consumir el backend y exponer las funcionalidades principales del programa.

## Requisitos previos
- Node.js 18 o superior.
- npm 9 o superior (se instala junto a Node).

## Instalación
```bash
npm install
```

## Configuración de entorno
1. Copia el archivo `.env.example` a `.env`.
2. Ajusta las variables según el entorno:
   - `VITE_API_URL`: URL base del backend (por ejemplo `http://localhost:8080/api/v1` en desarrollo).
   - `VITE_MAPS_URL`: URL de Google MyMaps que se embeberá en la vista de mapa.

Recuerda que `.env` ya está ignorado por Git y no se versiona.

## Scripts disponibles
- `npm run dev`: levanta el servidor de desarrollo con recarga en caliente.
- `npm run build`: compila el proyecto para producción.
- `npm run preview`: sirve la versión compilada para verificación local.

## Estructura principal
- `src/`: código fuente de la aplicación.
- `public/`: archivos estáticos que Vite sirve sin procesar.
- `dist/`: salida generada después de ejecutar `npm run build` (no se versiona).

## Contribución
Antes de abrir un Pull Request asegúrate de:
- Actualizar dependencias y scripts si añadiste nuevas herramientas.
- Ejecutar los comandos de compilación correspondientes (`npm run build`) para verificar que no haya errores.
