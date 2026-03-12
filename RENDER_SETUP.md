# Configuración de Render con Eventos Asíncronos

## 🔴 CAMBIOS CRÍTICOS NECESARIOS EN RENDER

Debido a la implementación de **Bull Queue + WebSocket**, necesitas realizar los siguientes cambios en tu deployment de Render:

---

## 1. ✅ Crear Servicio Redis en Render

### Paso a Paso:

1. **Dashboard de Render** → Click en "New +" → **Key Value** ⬅️ Esta es la opción de Redis

2. **Configuración básica:**
   - **Name**: `ecommerce-redis`
   - **Region**: **Mismo que tu backend** (ej. Oregon - US West, Frankfurt)
   - **Plan**:
     - **Free** (25MB, para desarrollo/pruebas)
     - **Starter ($7/mo)** (256MB RAM, recomendado para producción)
   - **Eviction Policy**: Dejar por defecto (`noeviction`)

3. **Click en "Create"**

4. **Copiar la URL de conexión:**
   - Una vez creado, en la página del servicio verás:
     - **Internal Connection String**: `redis://red-xxx.region.render.com:6379` ⬅️ **Usar esta**
     - Formato: `redis://[hostname]:[port]`
   - **No uses** la External Connection String (es para acceso fuera de Render)

---

## 2. ✅ Actualizar Variables de Entorno del Backend

### En tu Web Service del Backend:

**Dashboard** → **ecommerce-backend** → **Environment** → **Add Environment Variable**

| Key          | Value                                | Notas                             |
| ------------ | ------------------------------------ | --------------------------------- |
| `REDIS_HOST` | `red-xxx.oregon-postgres.render.com` | ⚠️ Extraer del Internal Redis URL |
| `REDIS_PORT` | `6379`                               | Puerto por defecto                |

**Alternativa más simple (recomendada):**

Si Render te da una URL completa tipo `redis://red-xxx:6379`, puedes:

1. Usar solo el hostname de esa URL para `REDIS_HOST`
2. O modificar el código backend para aceptar `REDIS_URL` completo

### Opción A - Usar URL completa (más simple):

**Modificar** `backend/src/config/index.ts`:

```typescript
// Cambiar de:
redis: {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
}

// A:
redis: process.env.REDIS_URL
  ? process.env.REDIS_URL  // URL completa de Render
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    }
```

Y luego en Render:

```
REDIS_URL=redis://red-xxx.oregon-postgres.render.com:6379
```

### Opción B - Usar HOST/PORT (actual):

Extraer el hostname de la URL interna de Redis:

- URL: `redis://red-cth123abc.oregon-postgres.render.com:6379`
- `REDIS_HOST`: `red-cth123abc.oregon-postgres.render.com`
- `REDIS_PORT`: `6379`

---

## 3. ✅ Verificar CORS para WebSocket

### En tu Backend Environment Variables:

Asegúrate de que `CORS_ORIGINS` incluya tu frontend de Render:

```bash
CORS_ORIGINS=https://itr-challenge.onrender.com,http://localhost:5173,http://localhost:4200
```

**⚠️ IMPORTANTE**: WebSocket en Render funciona automáticamente sobre HTTPS, no requiere configuración adicional.

---

## 4. ✅ Actualizar Frontend - Socket URL

### En tu frontend-react Environment Variables:

El frontend necesita conectarse al WebSocket del backend.

**Render** → **ecommerce-frontend** → **Environment**

| Key            | Value                                          |
| -------------- | ---------------------------------------------- |
| `VITE_API_URL` | `https://ecommerce-back-azdg.onrender.com/api` |

El código ya está configurado para extraer la URL base del `VITE_API_URL`:

```typescript
// frontend-react/src/context/SocketContext.tsx
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
// Resultado: https://ecommerce-back-azdg.onrender.com
```

✅ **No necesitas cambios adicionales** - Socket.io automáticamente usa HTTPS cuando detecta producción.

---

## 5. ✅ Redeploy de Servicios

### Orden de deployment:

1. **Primero**: Crear Redis service
2. **Segundo**: Actualizar variables de entorno del backend
3. **Tercero**: Re-deploy backend (Manual Deploy → Deploy latest commit)
4. **Cuarto**: Re-deploy frontend (si cambiaste VITE_API_URL)

### Comandos para forzar re-deploy:

**Backend:**

```bash
# En tu repositorio local
git commit --allow-empty -m "Trigger Render redeploy with Redis"
git push
```

O usar el botón **"Manual Deploy"** en Render Dashboard.

---

## 6. ✅ Verificar Funcionamiento

### 6.1 Backend Conectado a Redis

**Logs del Backend** → Buscar:

```
✅ Application is running on: https://ecommerce-back-azdg.onrender.com/api
```

**Sin errores** de conexión a Redis.

### 6.2 WebSocket Funcionando

**Frontend Console** (DevTools):

```javascript
✅ WebSocket connected: [socket-id]
📝 Registering user: [userId]
```

### 6.3 Prueba End-to-End

1. **Login** en frontend
2. **Crear orden** → Debería mostrar:
   - "Creating order..."
   - "Processing... Reserving inventory..."
   - "✅ Order confirmed!"
3. **Admin activa/desactiva producto** → Otros usuarios ven toast notification

---

## 7. 🔧 Troubleshooting Render

### Error: "ECONNREFUSED" - Backend no conecta a Redis

**Causa**: Variables de entorno incorrectas

**Solución**:

1. Verifica `REDIS_HOST` y `REDIS_PORT` en backend
2. Asegúrate de que Redis esté en la **misma región** que backend
3. Usa **Internal Redis URL** (no External)

### Error: WebSocket no conecta

**Causa**: CORS o URL incorrecta

**Solución**:

1. Verifica `CORS_ORIGINS` incluye el frontend
2. Verifica `VITE_API_URL` en frontend
3. Abre DevTools → Network → WS → Ver si intenta conectar

### Error: "Service Unavailable" después de deploy

**Causa**: Backend crasheó al iniciar

**Solución**:

1. Render Dashboard → Backend → Logs
2. Buscar error de inicio (generalmente Redis connection)
3. Verificar todas las variables de entorno

### Redis consume mucho memoria en plan Free

**Causa**: Bull Queue acumula jobs completados

**Solución** (implementar después):

```typescript
// backend/src/app.module.ts
BullModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    redis: { ... },
    defaultJobOptions: {
      removeOnComplete: 100,  // Mantener solo últimos 100 jobs
      removeOnFail: 50,       // Mantener solo últimos 50 fallidos
    },
  }),
}),
```

---

## 8. 📊 Monitoreo Post-Deploy

### Métricas a vigilar en Render Dashboard:

1. **Backend**:
   - CPU Usage < 50%
   - Memory < 512MB
   - Response Time < 1s

2. **Redis**:
   - Memory Usage (free plan: 25MB limit)
   - Connected Clients
   - Commands/sec

3. **Frontend**:
   - Build Success
   - No 404 errors en static assets

---

## 9. ⚠️ Limitaciones del Plan Free de Render

### Redis Free Tier:

- ✅ 25MB RAM
- ✅ TLS/SSL incluido
- ✅ Backup automático (limited)
- ❌ No persistence garantizada (puede perder data en restart)
- ❌ Sleeps después de 15 min inactividad

**Recomendación para Producción**: Upgrade a **Starter Plan ($7/mo)** para:

- 256MB RAM
- Persistence AOF
- Sin sleep
- Mejor performance

### Backend Free Tier:

- ✅ 512MB RAM, 0.1 CPU
- ❌ Sleeps después de 15 min inactividad
- ❌ Restart al hacer push

**WebSocket Consideration**: Si el backend duerme, las conexiones WebSocket se pierden. Los clientes deben reconectar automáticamente (Socket.io lo hace por defecto).

---

## 10. ✅ Checklist de Deployment

- [ ] Redis service creado en Render
- [ ] `REDIS_HOST` y `REDIS_PORT` configurados en backend
- [ ] `CORS_ORIGINS` incluye frontend URL
- [ ] Backend re-deployed después de agregar Redis vars
- [ ] Frontend tiene `VITE_API_URL` correcto
- [ ] Logs del backend no muestran errores de Redis
- [ ] WebSocket conecta correctamente (ver console)
- [ ] Prueba crear orden → Ver estados async
- [ ] Prueba activar producto → Ver toast en tiempo real

---

## 11. 🚀 Próximos Pasos (Opcional)

### Para mejorar la experiencia en Render:

1. **Agregar Health Checks personalizados**:

   ```typescript
   // backend/src/app.controller.ts
   @Get('health')
   healthCheck() {
     return {
       status: 'ok',
       redis: this.redisClient.status === 'ready',
       timestamp: new Date().toISOString(),
     };
   }
   ```

2. **Configurar Auto-Deploy** en Render:
   - Settings → Build & Deploy → Auto-Deploy: Yes
   - Se re-deploya automáticamente con cada push a main

3. **Habilitar Preview Environments**:
   - Para branches de feature
   - Testing antes de merge a main

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs en Render Dashboard**
2. **Verificar variables de entorno** (typos muy comunes)
3. **Test local primero** con Docker Compose
4. **Render Documentation**: https://render.com/docs

---

**Última actualización**: Marzo 2026  
**Autor**: Implementación de Bull Queue + WebSocket para Challenge ITR
