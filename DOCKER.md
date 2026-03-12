# Docker Deployment Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ available RAM

## Quick Start

### 1. Configure Environment

```bash
# Copy example environment file
cp .env.docker.example .env.docker

# Edit .env.docker with your settings (optional)
nano .env.docker
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Initialize Database

The database will be automatically initialized on first run with:

- All tables created (via migrations)
- Seed data loaded (admin user, categories, etc.)

**Default Admin Credentials:**

- Email: `admin@admin.com`
- Password: `12345678`

### 4. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Service Architecture

```
┌─────────────────┐
│   Frontend      │  Port 80 (nginx)
│   React + Vite  │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│   Backend       │  Port 3000
│   NestJS API    │
└────┬───────┬────┘
     │       │
     │       └──────── WebSocket (Socket.io)
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌─────────┐      ┌─────────┐
│PostgreSQL│      │  Redis  │
│  Port    │      │  Port   │
│  5432    │      │  6379   │
└──────────┘      └─────────┘
     │                 │
     │                 └──── Bull Queue (async jobs)
     │
     └──────────────────── Data persistence
```

## Available Commands

### Start Services

```bash
# Start all services
docker-compose --env-file .env.docker up -d

# Start specific service
docker-compose --env-file .env.docker up -d backend

# Start with build (rebuild images)
docker-compose --env-file .env.docker up -d --build
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it ecommerce-postgres psql -U hassan -d ecommercedb

# Run migrations manually
docker exec -it ecommerce-backend npm run migration:run

# Run seeders manually
docker exec -it ecommerce-backend npm run seed:run

# Backup database
docker exec ecommerce-postgres pg_dump -U hassan ecommercedb > backup.sql

# Restore database
cat backup.sql | docker exec -i ecommerce-postgres psql -U hassan -d ecommercedb
```

### Redis Management

```bash
# Access Redis CLI
docker exec -it ecommerce-redis redis-cli

# Check Redis connection
docker exec -it ecommerce-redis redis-cli ping
# Should return: PONG

# View Bull Queue jobs
docker exec -it ecommerce-redis redis-cli KEYS "bull:orders:*"

# Monitor Redis commands
docker exec -it ecommerce-redis redis-cli MONITOR
```

### Service Health Checks

```bash
# Check all services status
docker-compose ps

# Check backend health
curl http://localhost:3000/api

# Check frontend health
curl http://localhost/health

# Check PostgreSQL health
docker exec ecommerce-postgres pg_isready -U hassan

# Check Redis health
docker exec ecommerce-redis redis-cli ping
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Verify database is ready
docker-compose ps postgres

# Restart backend
docker-compose restart backend
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify credentials in .env.docker
cat .env.docker | grep DATABASE
```

### Redis connection errors

```bash
# Verify Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test connection
docker exec -it ecommerce-redis redis-cli ping
```

### Frontend shows "Network Error"

1. Check backend is running: `docker-compose ps backend`
2. Verify CORS settings in `.env.docker`
3. Rebuild frontend with correct API URL:
   ```bash
   docker-compose up -d --build frontend
   ```

### Clear all data and restart fresh

```bash
# Stop services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose --env-file .env.docker up -d --build
```

## Production Considerations

### Security

1. **Change default passwords** in `.env.docker`:
   - `DATABASE_PASSWORD`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`

2. **Enable HTTPS** using reverse proxy (nginx, Traefik, etc.)

3. **Restrict database access**:
   ```yaml
   # In docker-compose.yml, remove port exposure for postgres
   # ports:
   #   - "5432:5432"  # Comment this out
   ```

### Performance

1. **Set resource limits**:

   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

2. **Configure Redis persistence**:

   ```yaml
   redis:
     command: redis-server --appendonly yes --appendfsync everysec
   ```

3. **Database connection pooling** (already configured in TypeORM)

### Monitoring

1. **Add health check endpoints** (already implemented)
2. **Set up log aggregation** (ELK stack, Loki, etc.)
3. **Configure alerts** for service failures

## Environment Variables Reference

| Variable            | Default                   | Description            |
| ------------------- | ------------------------- | ---------------------- |
| `PORT`              | 3000                      | Backend API port       |
| `DATABASE_HOST`     | postgres                  | PostgreSQL hostname    |
| `DATABASE_NAME`     | ecommercedb               | Database name          |
| `DATABASE_USER`     | hassan                    | Database user          |
| `DATABASE_PASSWORD` | password                  | Database password      |
| `REDIS_HOST`        | redis                     | Redis hostname         |
| `REDIS_PORT`        | 6379                      | Redis port             |
| `JWT_SECRET`        | (random)                  | JWT signing secret     |
| `ADMIN_EMAIL`       | admin@admin.com           | Default admin email    |
| `ADMIN_PASSWORD`    | 12345678                  | Default admin password |
| `VITE_API_URL`      | http://localhost:3000/api | Frontend API URL       |
| `FRONTEND_PORT`     | 80                        | Frontend nginx port    |

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
