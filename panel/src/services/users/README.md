# Users Service

Servicios para gestión de usuarios del sistema, implementando validaciones estrictas según las reglas del backend.

## Reglas de Validación

### Email
- **Formato**: Validación básica de formato email (regex)
- **Longitud**: Máximo 254 caracteres
- **Normalización**: Backend convierte a lowercase automáticamente
- **Unicidad**: Backend valida case-insensitive

### Active Status
- **Tipo**: Siempre boolean
- **Create**: Default `true` si no se especifica
- **Update**: Solo se envía si está presente en el input

### Roles
- **Valores permitidos**: `"admin" | "ops" | "courier" | "freelance"`
- **Validación**: Backend valida contra enum

## Endpoints

- `GET /users` - Listar usuarios con filtros
- `GET /users/:id` - Obtener usuario por ID
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

## Uso

```typescript
import { createUser, updateUser, listUsers } from "@/services/users";

// Crear usuario
const user = await createUser({
  user: {
    email: "user@example.com",
    role: "courier",
    name: "John Doe",
    password: "securePassword123"
  }
});

// Actualizar usuario
const updated = await updateUser(user.id, {
  user: { active: false }
});

// Listar usuarios
const users = await listUsers({ role: "courier", active: true });
```
