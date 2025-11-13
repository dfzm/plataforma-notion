# Setup Instructions

## Solución al problema de verificación de email

Hay dos formas de solucionar el problema de verificación de email:

### Opción 1: Deshabilitar verificación de email (Recomendado para desarrollo)

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** → **Providers** → **Email**
3. Desactiva la opción **"Confirm email"**
4. Guarda los cambios

Ahora puedes registrarte normalmente sin necesidad de verificar el email.

### Opción 2: Crear usuario demo con script

1. Asegúrate de tener las variables de entorno configuradas
2. Ejecuta el script desde la terminal:

\`\`\`bash
node scripts/004_create_demo_user.js
\`\`\`

Esto creará un usuario demo con:
- **Email:** demo@notion.com
- **Password:** Demo123456!

### Opción 3: Configurar redirect URL correctamente

El problema del link expirado puede ser por la URL de redirección. Para solucionarlo:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** → **URL Configuration**
3. Agrega estas URLs a **Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback`
   - Tu URL de producción cuando la tengas

4. En **Site URL**, asegúrate de tener:
   - `http://localhost:3000` (para desarrollo)

## Después de solucionar el problema

Una vez que puedas iniciar sesión, podrás:
- Crear páginas y subpáginas
- Editar contenido con bloques
- Ver tus páginas recientes en el dashboard
- Buscar páginas en la barra lateral
- Todo se guarda automáticamente en Supabase
