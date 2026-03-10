# Deployment Guide - Render

Esta guía te ayudará a desplegar el proyecto E-Commerce completo en Render.

## Arquitectura del Deployment

- **Backend (NestJS)**: Web Service en Render
- **Frontend (Angular)**: Static Site en Render
- **Database**: PostgreSQL Database en Render

---

## Pre-requisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Repositorio de Git (GitHub, GitLab, o Bitbucket)
3. Código subido a tu repositorio

---

## Paso 1: Crear la Base de Datos PostgreSQL

1. Ve a tu Dashboard de Render
2. Click en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `ecommerce-db` (o el nombre que prefieras)
   - **Database**: `ecommercedb`
   - **User**: (se genera automáticamente)
   - **Region**: Elige el más cercano a tu ubicación
   - **Plan**: Free
4. Click en **"Create Database"**
5. **IMPORTANTE**: Guarda las credenciales que aparecen:
   - Internal Database URL
   - External Database URL
   - Hostname
   - Port
   - Database
   - Username
   - Password

---

## Paso 2: Desplegar el Backend (NestJS)

### 2.1 Crear Web Service

1. En el Dashboard, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de Git
3. Configura:
   - **Name**: `ecommerce-backend` (o tu preferencia)
   - **Region**: El mismo que la base de datos
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### 2.2 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
NODE_ENV=production
PORT=3000
BASE_URL=https://ecommerce-backend.onrender.com
DATABASE_HOST=<Internal Database URL Hostname>
DATABASE_PORT=5432
DATABASE_NAME=ecommercedb
DATABASE_USER=<Database Username>
DATABASE_PASSWORD=<Database Password>
DATABASE_ENTITIES=dist/**/*.entity.js
JWT_SECRET=<genera-un-secret-aleatorio-fuerte-aqui>
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=<cambia-esto-en-produccion>
CORS_ORIGINS=https://your-frontend-name.onrender.com
```

**Importante**:

- Reemplaza `<Database Username>`, `<Database Password>`, etc. con los valores reales de tu base de datos
- `BASE_URL` debe ser la URL de tu backend (se mostrará después del deploy)
- `CORS_ORIGINS` debe ser la URL de tu frontend (lo configurarás en el siguiente paso)
- Genera un JWT_SECRET fuerte (puedes usar: `openssl rand -base64 32`)

### 2.3 Deploy

1. Click en **"Create Web Service"**
2. Espera a que complete el build (puede tardar 5-10 minutos)
3. Una vez completado, verás la URL de tu backend: `https://ecommerce-backend.onrender.com`

### 2.4 Ejecutar Migraciones y Seed (Opcional pero Recomendado)

**Opción 1: Usar la Shell de Render**

1. En tu servicio backend, ve a la pestaña **"Shell"**
2. Ejecuta:

```bash
npm run migration:run
npm run seed:run
```

**Opción 2: Configurar Build Command con Seed**
Modifica el Build Command para incluir el seed:

```bash
npm install && npm run build && npm run migration:run && npm run seed:run
```

---

## Paso 3: Desplegar el Frontend (Angular)

### 3.1 Actualizar environment.prod.ts

Antes de desplegar, actualiza el archivo `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ecommerce-backend.onrender.com/api', // URL de tu backend
};
```

Haz commit y push de este cambio.

### 3.2 Crear Static Site

1. En el Dashboard, click en **"New +"** → **"Static Site"**
2. Conecta tu repositorio de Git
3. Configura:
   - **Name**: `ecommerce-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build:prod`
   - **Publish Directory**: `dist/ecommerce-frontend/browser` (verificar en angular.json)

### 3.3 Deploy

1. Click en **"Create Static Site"**
2. Espera el build (5-10 minutos)
3. Tu frontend estará disponible en: `https://ecommerce-frontend.onrender.com`

---

## Paso 4: Actualizar CORS

Ahora que tienes la URL del frontend, actualiza la variable CORS en el backend:

1. Ve a tu servicio **backend** en Render
2. En **"Environment"**, edita `CORS_ORIGINS`
3. Cambia el valor a la URL real de tu frontend:
   ```
   https://ecommerce-frontend.onrender.com
   ```
4. Guarda los cambios
5. El servicio se re-desplegará automáticamente

---

## Paso 5: Verificar el Deployment

1. Abre tu frontend: `https://ecommerce-frontend.onrender.com`
2. Verifica que puedas hacer login con las credenciales del admin
3. Prueba las funcionalidades principales:
   - Ver productos
   - Crear producto (Admin/Merchant)
   - Crear orden
   - Gestionar roles (Admin)

---

## Notas Importantes

### Enlaces Útiles

- **Frontend**: https://your-frontend-name.onrender.com
- **Backend**: https://your-backend-name.onrender.com/api
- **API Docs** (si implementas): https://your-backend-name.onrender.com/api/docs

### Plan Free de Render

- Los servicios se "duermen" después de 15 minutos de inactividad
- La primera solicitud después de "despertar" puede tardar 30-60 segundos
- 750 horas de uso gratis al mes

### Troubleshooting

**Error 503 Service Unavailable**

- El servicio está despertando. Espera 30-60 segundos y recarga

**CORS Error**

- Verifica que `CORS_ORIGINS` en el backend tenga la URL correcta del frontend
- No incluyas `/` al final de la URL

**Database Connection Error**

- Verifica que las credenciales de la base de datos sean correctas
- Usa el "Internal Database URL" para mejor rendimiento

**Build Failed**

- Revisa los logs en Render para ver el error específico
- Verifica que el código compila correctamente en local

---

## Actualizar el Deployment

Cada vez que hagas push a tu rama principal (`main`), Render automáticamente:

1. Detecta los cambios
2. Hace rebuild del servicio
3. Despliega la nueva versión

---

## Monitoreo

Render provee:

- Logs en tiempo real
- Métricas de uso (CPU, RAM)
- Alertas por email si el servicio falla

Accede a estos desde la pestaña **"Logs"** y **"Metrics"** de cada servicio.

---

## Costos

Plan Free incluye:

- 750 horas/mes de Web Services
- 90 días de retención de PostgreSQL
- Ancho de banda ilimitado
- TLS/SSL gratis

Para producción real, considera los planes pagos para:

- Sin sleep automático
- Mayor RAM/CPU
- Backups automáticos de DB
- Soporte prioritario

---

## Seguridad en Producción

Antes de usar en producción real:

1. ✅ Cambia `ADMIN_PASSWORD` a una contraseña fuerte
2. ✅ Genera un nuevo `JWT_SECRET` aleatorio y fuerte
3. ✅ Configura backups de la base de datos
4. ✅ Habilita HTTPS (Render lo hace automáticamente)
5. ✅ Revisa y actualiza paquetes npm regularmente
6. ✅ Configura rate limiting en el backend
7. ✅ Implementa logging y monitoreo

---

## Comandos Útiles

### Ver Logs del Backend

En la pestaña "Logs" del servicio backend, o vía CLI de Render.

### Conectarse a la Base de Datos

Usa el "External Database URL" con cualquier cliente PostgreSQL:

```bash
psql "postgresql://user:password@host:port/database"
```

### Ejecutar Comandos en el Backend

Ve a la pestaña "Shell" del servicio backend.

---

¿Tienes problemas? Revisa la [documentación oficial de Render](https://render.com/docs) o abre un issue en el repositorio.
