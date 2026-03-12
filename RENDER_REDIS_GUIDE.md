# 🎯 Guía Paso a Paso: Configurar Redis en Render

## Paso 1: Crear el Servicio Key Value (Redis)

### 1.1 Acceder al Menú de Creación

1. Ve a tu **Dashboard de Render**: https://dashboard.render.com
2. Click en el botón **"New +"** (esquina superior derecha)
3. Del menú desplegable, selecciona: **"Key Value"** ⬅️ Este es el servicio de Redis

![Menu Options](https://docs.render.com/docs/key-value-stores)

### 1.2 Configurar el Servicio

En la página de configuración:

**Configuración Básica:**

```
Name: ecommerce-redis
```

- Nombre descriptivo para identificar el servicio

**Region:**

```
🔴 IMPORTANTE: Selecciona la MISMA región que tu backend
```

- Si tu backend está en "Oregon (US West)" → Redis en "Oregon (US West)"
- Si tu backend está en "Frankfurt (EU Central)" → Redis en "Frankfurt (EU Central)"
- **Por qué:** Menor latencia y sin cargos de transferencia entre regiones

**Plan:**

Para desarrollo/pruebas:

```
✓ Free
  - 25MB de almacenamiento
  - Ideal para desarrollo
  - Puede "dormir" después de inactividad
  - Sin persistencia garantizada
```

Para producción (recomendado):

```
✓ Starter - $7/month
  - 256MB de almacenamiento
  - Sin "sleep"
  - Persistencia AOF (append-only file)
  - Mejor rendimiento
```

**Eviction Policy:**

```
Dejar por defecto: noeviction
```

- Esto evita que Redis elimine datos cuando se llena

### 1.3 Crear el Servicio

1. Click en **"Create Key Value Store"**
2. Esperar 1-2 minutos mientras Render provisiona el servicio
3. Verás una pantalla con "🟢 Live" cuando esté listo

---

## Paso 2: Obtener la URL de Conexión

### 2.1 Copiar la Connection String

Una vez creado el servicio, verás:

```
Internal Connection String:
redis://red-abc123xyz.oregon-postgres.render.com:6379
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        Esta es la URL que necesitas
```

**Componentes de la URL:**

- `redis://` → Protocolo
- `red-abc123xyz` → ID único de tu instancia
- `.oregon-postgres.render.com` → Hostname interno de Render
- `:6379` → Puerto de Redis

**🔴 IMPORTANTE:**

- Usa la **Internal Connection String** (NO la External)
- Solo servicios dentro de Render pueden acceder a la Internal
- Es más rápida y segura

### 2.2 Guardar la URL Temporalmente

Copia esta URL, la necesitarás en el siguiente paso.

Ejemplo completo:

```
redis://red-cth1a2b3c4d5e6f7.oregon-postgres.render.com:6379
```

---

## Paso 3: Configurar Variables de Entorno en el Backend

### 3.1 Ir a tu Web Service del Backend

1. Dashboard → Click en tu servicio backend (ej. "ecommerce-backend")
2. En el menú lateral izquierdo, click en **"Environment"**
3. Click en **"Add Environment Variable"**

### 3.2 Agregar Variables de Redis

**Opción A - URL Completa (MÁS SIMPLE):**

Agregar solo esta variable:

```
Key:   REDIS_URL
Value: redis://red-abc123xyz.oregon-postgres.render.com:6379
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       Pegar la Internal Connection String del Paso 2
```

**✅ RECOMENDADO:** Esta opción requiere modificar el código (ver Paso 4)

---

**Opción B - Host y Puerto Separados:**

Agregar dos variables:

```
Key:   REDIS_HOST
Value: red-abc123xyz.oregon-postgres.render.com
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       Solo el hostname (sin redis:// ni :6379)

Key:   REDIS_PORT
Value: 6379
```

**✅ Funciona sin cambios de código** (configuración actual)

---

### 3.3 Guardar Cambios

1. Click en **"Save Changes"** en cada variable
2. Render mostrará un mensaje: "Environment variables updated"

---

## Paso 4: (Solo si usas Opción A) Modificar Configuración del Backend

### 4.1 Actualizar config/index.ts

Si elegiste usar `REDIS_URL` (Opción A recomendada), necesitas actualizar el código:

**Archivo:** `backend/src/config/index.ts`

**Buscar:**

```typescript
redis: {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
}
```

**Reemplazar con:**

```typescript
redis: process.env.REDIS_URL
	? process.env.REDIS_URL
	: {
			host: process.env.REDIS_HOST || 'localhost',
			port: parseInt(process.env.REDIS_PORT, 10) || 6379,
		};
```

**Commit y push:**

```bash
git add backend/src/config/index.ts
git commit -m "Support REDIS_URL environment variable"
git push
```

Render automáticamente re-desplegará tu backend.

---

## Paso 5: Verificar CORS (Importante para WebSocket)

### 5.1 Verificar Variable CORS_ORIGINS

En el mismo panel de Environment del backend:

```
Key:   CORS_ORIGINS
Value: https://itr-challenge.onrender.com,http://localhost:5173
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       Debe incluir la URL de tu frontend en Render
```

**Separar múltiples URLs con comas (sin espacios)**

Si no existe esta variable, agrégala.

---

## Paso 6: Re-Deploy del Backend

### 6.1 Trigger Manual Deploy

1. En la página de tu backend, click en **"Manual Deploy"** (botón superior derecho)
2. Selecciona **"Deploy latest commit"**
3. Click **"Deploy"**

### 6.2 Monitorear el Deploy

1. Verás logs en tiempo real del deployment
2. Buscar estos mensajes de éxito:

```
✅ Installing dependencies...
✅ Building application...
✅ Starting application...
✅ Application is running on: https://ecommerce-back-xxx.onrender.com/api
```

**Si ves errores de Redis:**

```
❌ Error: getaddrinfo ENOTFOUND redis
```

→ Variable `REDIS_HOST` mal configurada (verifica el hostname)

```
❌ Error: connect ECONNREFUSED
```

→ Redis no está en la misma región o no está activo

---

## Paso 7: Verificar que Todo Funciona

### 7.1 Verificar Logs del Backend

En los logs del backend, buscar:

```
✅ BullModule initialized
✅ Redis connected
✅ WebSocket gateway initialized
```

**Líneas que indican éxito:**

- No debe haber errores de "ECONNREFUSED" o "ENOTFOUND"
- Debe decir "Nest application successfully started"

### 7.2 Verificar en el Frontend

1. Abre tu frontend: https://itr-challenge.onrender.com
2. Abre **DevTools** (F12)
3. Ve a la pestaña **Console**
4. Deberías ver:

```javascript
✅ WebSocket connected: abc123xyz
📝 Registering user: 1
```

### 7.3 Prueba Funcional Completa

**Test 1: Crear Orden**

1. Login con admin@admin.com / 12345678
2. Ve a "Create Order"
3. Agrega productos y crea una orden
4. Deberías ver la secuencia:

```
⏳ Creating order...
🔄 Processing order... Reserving inventory...
✅ Order confirmed! Redirecting...
```

**Test 2: Activar/Desactivar Producto (Multi-usuario)**

1. Abre 2 navegadores (o modo incógnito)
2. En navegador A: Login como admin
3. En navegador B: Login como usuario normal, abre "Products"
4. En navegador A: Activa o desactiva un producto
5. En navegador B: Deberías ver un toast instantáneo:

```
🟢 Product "MacBook Pro" is now active
```

---

## 🔴 Troubleshooting

### Error: "ECONNREFUSED" en Backend Logs

**Causa:** Redis no está accesible

**Soluciones:**

1. Verificar que Redis está "Live" (🟢) en Render Dashboard
2. Verificar `REDIS_HOST` no tiene `redis://` ni puerto
3. Verificar que backend y redis están en la **misma región**

### Error: "Module not found: @nestjs/bull"

**Causa:** Dependencias no instaladas

**Solución:**

```bash
# En local
cd backend
npm install

# Commit y push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### WebSocket no conecta en Frontend

**Causa:** CORS mal configurado

**Solución:**

1. Backend → Environment → Verificar `CORS_ORIGINS`
2. Debe incluir: `https://tu-frontend.onrender.com`
3. Re-deploy backend

### Redis consume mucha memoria (Free tier)

**Causa:** Jobs completados se acumulan

**Solución temporal:**

- Redis Free tier tiene 25MB
- Bull Queue guarda historial de jobs
- Considera upgrade a Starter ($7/mo) con 256MB

**Solución permanente (código):**

```typescript
// backend/src/app.module.ts
BullModule.forRootAsync({
  // ... configuración actual
  defaultJobOptions: {
    removeOnComplete: 100,  // Solo mantener últimos 100 jobs
    removeOnFail: 50,
  },
}),
```

---

## ✅ Checklist Final

- [ ] Servicio Key Value (Redis) creado en Render
- [ ] Internal Connection String copiado
- [ ] Variables REDIS_HOST y REDIS_PORT agregadas al backend (o REDIS_URL)
- [ ] CORS_ORIGINS incluye URL del frontend
- [ ] Backend re-desplegado manualmente
- [ ] Logs del backend sin errores de Redis
- [ ] Frontend muestra "WebSocket connected" en console
- [ ] Prueba de crear orden funciona con estados async
- [ ] Prueba de activar producto muestra toast en tiempo real

---

## 💡 Próximos Pasos

Una vez que todo funcione:

1. **Monitorear uso de Redis:**
   - Dashboard → Redis → Metrics
   - Vigilar uso de memoria

2. **Considerar upgrade a Starter:**
   - Si vas a producción
   - Mejor rendimiento
   - Persistencia garantizada

3. **Configurar alertas:**
   - Render puede enviar emails si servicios caen
   - Settings → Notifications

---

## 📞 Ayuda Adicional

Si sigues teniendo problemas:

1. **Revisar logs completos:**

   ```bash
   # En Render Dashboard
   Backend → Logs → Last 100 lines
   ```

2. **Verificar status de servicios:**

   ```
   Dashboard → All services → Buscar 🟢 "Live"
   ```

3. **Documentación oficial de Render:**
   - Key Value Stores: https://render.com/docs/key-value-stores
   - Web Services: https://render.com/docs/web-services

4. **Comunidad:**
   - Render Community: https://community.render.com

---

**Tiempo estimado total:** 15-20 minutos  
**Costo:** $0 (Free tier) o $7/mo (Starter recomendado)

¡Éxito! 🚀
