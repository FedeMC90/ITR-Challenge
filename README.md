# E-commerce Platform - Full Stack Application

Complete e-commerce application with **asynchronous event processing**, **real-time notifications**, and **modern tech stack**.

## 🚀 Features

- ✅ **Authentication & Authorization** - JWT-based with role management (Admin, Merchant, Customer)
- ✅ **Product Management** - CRUD operations with inventory tracking
- ✅ **Order System** - Create, view, and cancel orders
- ✅ **Async Event Processing** - Bull Queue with Redis for background jobs
- ✅ **Real-time Updates** - WebSocket notifications for order status and product changes
- ✅ **Event-Driven Architecture** - Decoupled modules using EventEmitter2
- ✅ **Docker Support** - Complete containerized deployment

## 🛠 Technology Stack

### Backend

- **NestJS** 9.x - Progressive Node.js framework
- **TypeORM** 0.3.x - Database ORM
- **PostgreSQL** 16 - Relational database
- **Redis** 7 - Message broker for Bull Queue
- **Bull** 4.x - Queue system for async jobs
- **Socket.io** - WebSocket for real-time communication
- **JWT** - Authentication tokens

### Frontend

- **React** 19 - UI library
- **TypeScript** 5.9 - Type safety
- **Vite** 7 - Build tool
- **React Router** 7 - Client-side routing
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client

## 📦 Quick Start with Docker

**Recommended for fastest setup:**

```bash
# 1. Clone repository
git clone <repository-url>
cd Challenge-ITR

# 2. Start all services
docker-compose --env-file .env.docker up -d

# 3. Access application
# Frontend: http://localhost
# Backend: http://localhost:3000/api
```

**Default credentials:**

- Email: `admin@admin.com`
- Password: `12345678`

📖 **Full Docker documentation**: [DOCKER.md](./DOCKER.md)

## 🔧 Manual Setup (Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- Redis 7
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit if needed)
cp src/common/envs/development.env.example src/common/envs/development.env

# Start PostgreSQL (Docker)
docker run -d --name ecommerce-postgres \
  -e POSTGRES_USER=hassan \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ecommercedb \
  -p 5432:5432 \
  postgres:16-alpine

# Start Redis (Docker)
docker run -d --name ecommerce-redis \
  -p 6379:6379 \
  redis:7-alpine

# Run migrations
npm run build
npm run migration:run

# Seed database
npm run seed:run

# Start backend
npm run start:dev
```

Backend running at: **http://localhost:3000/api**

### Frontend Setup

```bash
cd frontend-react

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start frontend
npm run dev
```

Frontend running at: **http://localhost:5173**

## 🌐 Live Deployment

**Production URLs:**

- Frontend: https://itr-challenge.onrender.com
- Backend API: https://ecommerce-back-azdg.onrender.com/api

**Render Setup Guide**: [RENDER_SETUP.md](./RENDER_SETUP.md)

## 📁 Project Structure

```
Challenge-ITR/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── api/                # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── user/           # User management
│   │   │   ├── product/        # Product CRUD
│   │   │   ├── order/          # Order system
│   │   │   │   ├── processors/ # Bull Queue workers
│   │   │   │   └── services/   # Business logic
│   │   │   ├── inventory/      # Stock management
│   │   │   └── role/           # Role-based access
│   │   ├── common/
│   │   │   ├── events/         # Domain events
│   │   │   └── gateway/        # WebSocket gateway
│   │   ├── config/             # App configuration
│   │   └── database/
│   │       ├── entities/       # TypeORM entities
│   │       ├── migration/      # DB migrations
│   │       └── seed/           # Seed data
│   ├── Dockerfile
│   └── package.json
│
├── frontend-react/             # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # Context providers (Auth, Socket)
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   ├── nginx.conf              # Production nginx config
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
├── .env.docker                 # Docker environment vars
├── DOCKER.md                   # Docker guide
├── RENDER_SETUP.md             # Render deployment guide
└── DIAGNOSIS.md                # Full technical analysis
```

## 🔄 Event-Driven Architecture

### Async Order Processing Flow

```
User creates order
    ↓
OrderService.createOrder()
    ↓
Adds job to 'orders' queue (Bull + Redis)
    ↓
Returns immediately (status: PENDING)
    ↓
OrderProcessor worker (background)
    ├─ Emits WebSocket: "PROCESSING"
    ├─ Reserves inventory (transactional)
    ├─ Emits WebSocket: "CONFIRMED"
    └─ Or: "FAILED" if insufficient stock
    ↓
Frontend receives updates in real-time
    └─ Shows: "Creating..." → "Processing..." → "✅ Confirmed!"
```

### Real-time Product Updates

```
Admin activates product
    ↓
ProductService.toggleProductStatus()
    ↓
Emits WebSocket event: 'product-activated'
    ↓
All connected clients receive notification
    ↓
Frontend shows toast: "Product X is now active"
    └─ Product appears in list automatically
```

## 🧪 Available Commands

### Backend

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run migration:run      # Run migrations
npm run migration:generate # Generate new migration
npm run seed:run          # Seed database

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Code Quality
npm run lint              # ESLint
npm run format            # Prettier
```

### Frontend

```bash
npm run dev               # Start dev server
npm run build             # Build for production
npm run preview           # Preview production build
npm run lint              # ESLint
```

### Docker

```bash
# Development
docker-compose up -d                           # Start all services
docker-compose logs -f backend                 # View backend logs
docker-compose down                            # Stop services

# Production
docker-compose -f docker-compose.prod.yml up -d

# Utilities
docker exec -it ecommerce-postgres psql -U hassan -d ecommercedb
docker exec -it ecommerce-redis redis-cli
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products

- `GET /api/product` - List products (paginated)
- `GET /api/product/:id` - Get product details
- `POST /api/product` - Create product (Admin/Merchant)
- `PATCH /api/product/:id/toggle-status` - Activate/deactivate (Admin)
- `DELETE /api/product/:id` - Delete product (Admin/Merchant)

### Orders

- `POST /api/order` - Create order
- `GET /api/order` - List user's orders
- `GET /api/order/:id` - Get order details
- `PATCH /api/order/:id/cancel` - Cancel order

### Users & Roles

- `GET /api/user` - List users (Admin)
- `POST /api/role/assign` - Assign role to user (Admin)

## 🔐 Environment Variables

### Backend (.env)

```bash
PORT=3000
DATABASE_HOST=localhost
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
CORS_ORIGINS=http://localhost:5173,http://localhost:4200
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL
docker ps | grep postgres
docker logs ecommerce-postgres

# Check Redis
docker ps | grep redis
redis-cli ping  # Should return PONG
```

### Frontend shows "Network Error"

1. Verify backend is running: `curl http://localhost:3000/api`
2. Check CORS settings in backend `.env`
3. Verify `VITE_API_URL` in frontend `.env`

### WebSocket not connecting

1. Open DevTools → Console
2. Look for WebSocket errors
3. Verify backend logs for Socket.io initialization
4. Check CORS_ORIGINS includes your frontend URL

### Database migrations fail

```bash
cd backend
npm run clean
npm run build
npm run migration:run
```

## 📖 Documentation

- **[DOCKER.md](./DOCKER.md)** - Complete Docker deployment guide
- **[RENDER_SETUP.md](./RENDER_SETUP.md)** - Render/production deployment
- **[DIAGNOSIS.md](./DIAGNOSIS.md)** - Full technical analysis and architecture decisions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational/demonstration purposes.

## 👤 Author

**Federico M.**  
Challenge Implementation - March 2026

---

**⭐ Star this repo if you found it helpful!**
