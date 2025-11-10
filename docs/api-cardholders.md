# API - Vinculacion de tarjeta fisica

Este documento describe los endpoints necesarios para habilitar el flujo **"Ya tengo tarjeta fisica"** en el frontend. La funcionalidad permite que una persona con tarjeta emitida, pero sin credenciales digitales, valide su CURP y cree un usuario/contraseña para ingresar a la plataforma.

## 1. `POST /api/v1/cardholders/lookup`

Valida que la CURP pertenezca a una tarjeta activa y devuelve los datos minimos para mostrar en la UI.

- **Auth**: No requiere token (flujo previo al login).
- **Body**:

```json
{
  "curp": "ABCD001122HDFRRN07"
}
```

- **Response 200**:

```json
{
  "curp": "ABCD001122HDFRRN07",
  "nombres": "Nombre ejemplo",
  "apellidos": "Apellidos ejemplo",
  "municipio": "Toluca",
  "hasAccount": false
}
```

- **Errores esperados**:
  - `404` cuando la CURP no existe o la tarjeta no esta activa. El frontend redirige al formulario de registro completo.
  - `409` si la CURP ya tiene credenciales generadas (`hasAccount: true` se recomienda en el cuerpo cuando aplique).
  - `422` si el formato del CURP es invalido.
  - Respuestas deben incluir `{"message":"texto descriptivo"}` para mostrarse en la UI.

## 2. `POST /api/v1/cardholders/{curp}/account`

Crea el usuario y la contraseña asociados a la tarjeta previamente verificada.

- **Auth**: No requiere token (flujo previo al login).
- **Body**:

```json
{
  "username": "usuario.tj",
  "password": "contraseña_segura"
}
```

- **Response 201**:

```json
{
  "message": "Cuenta creada. Ya puedes iniciar sesion."
}
```

- **Errores esperados**:
  - `400/422` si la contraseña no cumple las reglas (min. 8 caracteres, coincidencia con confirmación).
  - `404` si el CURP no pasa la validacion previa (ej. se intento saltar el flujo).
  - `409` si ya existe un usuario asociado a esa CURP.

## 3. Reglas de negocio recomendadas

- Limitar intentos fallidos de validacion (rate-limit) para evitar abuso.
- Expirar la ventana de creacion de cuenta (por ejemplo 15 minutos despues del lookup exitoso) para impedir uso de datos stale.
- Registrar auditoria de quien genero las credenciales (CURP, IP, timestamp).
- Permitir reenvio de credenciales solo mediante flujo de recuperacion (no desde este endpoint).
