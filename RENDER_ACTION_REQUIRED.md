# 🚨 ACCIÓN REQUERIDA - Configuración de Render

## Resumen Ejecutivo

Con los cambios de eventos asíncronos (Bull Queue + WebSocket), **DEBES actualizar tu deployment en Render** para que funcione correctamente.

---

## ✅ Checklist Rápido

### 1. Crear Redis Instance en Render

- [ ] Dashboard → "New +" → **Key Value** (este es el servicio Redis)
- [ ] Name: `ecommerce-redis`
- [ ] Region: **Igual que tu backend** (ej. Oregon - US West)
- [ ] Plan: **Free** (desarrollo) o **Starter $7/mo** (producción)
- [ ] Copiar la **Internal Connection String**

### 2. Configurar Variables de Entorno en Backend

Dashboard → Backend Service → Environment → Add:

```
REDIS_HOST=red-xxxxx.oregon-postgres.render.com
REDIS_PORT=6379
```

**O más simple:**

```
REDIS_URL=redis://red-xxxxx.oregon-postgres.render.com:6379
```

⚠️ Si usas `REDIS_URL`, debes modificar `backend/src/config/index.ts` (ver RENDER_SETUP.md)

### 3. Verificar CORS

Asegurar que incluya tu frontend:

```
CORS_ORIGINS=https://itr-challenge.onrender.com,http://localhost:5173
```

### 4. Re-Deploy

- [ ] Backend → Manual Deploy → "Deploy latest commit"
- [ ] Esperar 2-3 minutos
- [ ] Verificar logs: no errores de Redis
- [ ] Frontend automáticamente conectará al WebSocket

---

## 🔍 Verificación

### ✅ Todo funciona si ves:

**Backend Logs:**

```
✅ Application is running on: https://...onrender.com/api
✅ Redis connected
```

**Frontend Console (DevTools):**

```
✅ WebSocket connected: [socket-id]
📝 Registering user: [user-id]
```

**Prueba funcional:**

1. Login
2. Crear orden → Ver "Creating..." → "Processing..." → "✅ Confirmed!"
3. Admin activa producto → Otros usuarios ven toast

---

## 📖 Documentación Completa

- **Render paso a paso**: [RENDER_SETUP.md](./RENDER_SETUP.md)
- **Docker local**: [DOCKER.md](./DOCKER.md)
- **README general**: [README.md](./README.md)

---

**Tiempo estimado**: 10-15 minutos  
**Costo adicional**: $0 (plan free) o $7/mo (recomendado para producción)
