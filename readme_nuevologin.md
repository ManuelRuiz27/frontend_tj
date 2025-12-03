# Proceso de registro con validación externa

Este flujo reemplaza el formulario anterior y centraliza todos los pasos en una sola experiencia respaldada por APIs externas y el backend principal.

## Variables de entorno relevantes

- `VITE_ID_VALIDATION_URL`: URL absoluta del endpoint que recibe ambos lados de la INE y devuelve los datos prellenados. Debe aceptar `multipart/form-data` con los campos `ine_front`, `ine_back` y `privacy_acceptance`.
- `VITE_API_URL`: Base URL del backend de Tarjeta Joven para insertar el registro final.

## Paso a paso del nuevo flujo

1. **Validación de identidad**
   - El usuario carga su INE por ambos lados en formato JPG/PNG/PDF (máximo 2 MB).
   - Confirma el Aviso de privacidad antes de continuar.
   - Al enviar, se forma una sola solicitud `POST` al endpoint configurado en `VITE_ID_VALIDATION_URL`.
   - La API responde con un JSON que contiene los datos personales y de domicilio detectados (`nombres`, `apellidos`, `fechaNacimiento`, `curp`, `calle`, `numero`, `cp`, `colonia`).

2. **Confirmación de datos**
   - Se muestra al usuario la información recibida.
   - Existe un “Corregir mi domicilio” que habilita la edición manual de calle, número, CP y colonia con sus validaciones correspondientes.
   - El usuario confirma para avanzar únicamente si los datos son válidos.

3. **Creación de cuenta**
   - Se capturan correo, contraseña y la aceptación de términos/aviso.
   - Con esos datos y los personales confirmados se envía un `POST /cardholders` al backend principal (`VITE_API_URL`).
   - El backend registra la cuenta; en caso de éxito se muestra el snackbar con la confirmación, en caso de error se comunica el mensaje devuelto por la API.

## Consideraciones adicionales

- Se normaliza la CURP antes de enviarla al backend (`normalizeCurp`).
- Las validaciones client-side aseguran formatos básicos, tamaños de archivo y reglas de contraseña (mínimo 8 caracteres con mezcla de mayúsculas, minúsculas y números).
- El formulario impide avanzar entre pasos si faltan documentos, el aviso de privacidad no está aceptado o si hay datos inválidos.

## Entorno de pruebas sugerido

Para validar el flujo sin depender de los servicios productivos:

1. Levanta un mock del endpoint `VITE_ID_VALIDATION_URL` (puedes usar el incluido en este repo en `http://localhost:4100/mock-ine`).
2. Configura `VITE_API_URL` a un backend local o mock (por ejemplo `http://localhost:4100/api/v1`) que acepte el `POST /cardholders`.
3. Utiliza archivos dummy (PDF o JPG pequeños) para la carga de INE.

### Mock local incluido

Se agregó un mock básico en `mocks/mock-new-login-server.js`. Para usarlo:

1. Ajusta tu `.env.local` (o `.env`) con:
   ```
   VITE_ID_VALIDATION_URL=http://localhost:4100/mock-ine
   VITE_API_URL=http://localhost:4100/api/v1
   ```
2. Ejecuta `npm run mock:new-login` en una terminal para iniciar el servidor (usa `MOCK_NEW_LOGIN_PORT` para cambiar el puerto).
3. En otra terminal corre `npm run dev` para el frontend.

El mock responde a:
- `POST /mock-ine`: devuelve el JSON de ejemplo con los campos `nombre`, `apellido_paterno`, `apellido_materno`, `curp`, `discapacidad`, `id_ine`, `municipio`, `seccional`, `calle`, `numero_ext`, `numero_int`, `colonia`.
- `POST /api/v1/cardholders`: acepta el payload final y lo guarda en memoria para consulta.
- `GET /api/v1/cardholders`: lista los registros almacenados durante la sesión.
- `GET /health`: simple verificación de estado.

### Datos de respuesta del mock de INE

El mock debe responder con el mismo esquema que usa la API real. Un ejemplo completo:

```json
{
  "nombre": "MARIA GUADALUPE",
  "apellido_paterno": "SANCHEZ",
  "apellido_materno": "PEREZ",
  "curp": "SAPM900101MBCNRR06",
  "discapacidad": false,
  "id_ine": "0000000000123",
  "municipio": "Tijuana",
  "seccional": "0456",
  "calle": "Av. Siempre Viva",
  "numero_ext": "742",
  "numero_int": "3B",
  "colonia": "Centro"
}
```

Puedes preparar variaciones:

- **Caso exento**: `discapacidad: true` para validar que la UI conserve ese dato en la confirmación.
- **Corrección de domicilio**: devuelve `numero_ext` vacío o un CP incorrecto para activar “Corregir mi domicilio”.
- **Error controlado**: responde con HTTP 422 y payload `{ "message": "INE ilegible" }` para revisar los mensajes de error.

Con este entorno puedes simular los tres pasos completos antes de integrar con los servicios definitivos, sin modificar la estructura del proyecto.

Este documento debe mantenerse sincronizado con las futuras iteraciones del flujo de registro para facilitar la coordinación con backend y QA.

