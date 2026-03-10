# Checklist de Deployment para Render

Usa esta checklist antes de desplegar a Render.

## ✅ Pre-Deployment Checklist

### Backend

- [ ] Variables de entorno configuradas en `.env.example`
- [ ] CORS configurado correctamente para producción
- [ ] Scripts de build y start funcionando localmente
- [ ] Migraciones de base de datos creadas
- [ ] Seed de datos funcional
- [ ] JWT_SECRET generado y fuerte

### Frontend

- [ ] `environment.prod.ts` actualizado con URL del backend
- [ ] Build de producción funciona: `npm run build:prod`
- [ ] Configuración de Angular optimizada

### Base de Datos

- [ ] PostgreSQL creado en Render
- [ ] Credenciales guardadas de forma segura
- [ ] Variables de entorno del backend apuntan a la DB de Render

---

## 📋 Orden de Deployment

1. **Crear Base de Datos PostgreSQL** en Render
2. **Desplegar Backend** (NestJS Web Service)
   - Configurar variables de entorno
   - Ejecutar migraciones
   - Ejecutar seed
3. **Actualizar `environment.prod.ts`** con URL del backend
4. **Hacer commit y push** de los cambios
5. **Desplegar Frontend** (Angular Static Site)
6. **Actualizar CORS** en backend con URL del frontend
7. **Verificar funcionamiento** completo

---

## 🔑 Variables de Entorno Críticas

### Backend (Web Service)

```
NODE_ENV=production
PORT=3000
BASE_URL=https://tu-backend.onrender.com
DATABASE_HOST=<internal-db-host>
DATABASE_PORT=5432
DATABASE_NAME=ecommercedb
DATABASE_USER=<db-user>
DATABASE_PASSWORD=<db-password>
DATABASE_ENTITIES=dist/**/*.entity.js
JWT_SECRET=<secret-aleatorio-fuerte>
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=<password-fuerte>
CORS_ORIGINS=https://tu-frontend.onrender.com
```

---

## 🧪 Testing Post-Deployment

- [ ] Frontend accesible vía HTTPS
- [ ] Backend responde en `/api`
- [ ] Login exitoso con credenciales admin
- [ ] Listado de productos funciona
- [ ] Creación de productos (Admin/Merchant)
- [ ] Creación de órdenes
- [ ] Gestión de roles (Admin)
- [ ] CORS funciona sin errores

---

## 📝 Comandos Útiles

### Local Testing

```bash
# Backend
cd backend
npm install
npm run build
npm run start:prod

# Frontend
cd frontend
npm install
npm run build:prod
```

### Render Shell (una vez desplegado)

```bash
# Ejecutar migraciones
npm run migration:run

# Ejecutar seed
npm run seed:run

# Ver estado
npm run typeorm -- query "SELECT * FROM users LIMIT 5"
```

---

## 🚨 Troubleshooting Rápido

**Error 503**: Servicio despertando (esperar 30-60s)

**CORS Error**: Verificar `CORS_ORIGINS` en backend

**DB Connection Failed**: Verificar credenciales de PostgreSQL

**Build Failed**: Revisar logs en Render Dashboard

---

Para instrucciones detalladas, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)
