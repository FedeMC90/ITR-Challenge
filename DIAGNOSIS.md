# Technical Challenge - Diagnosis Report

**Project**: NestJS E-commerce with Event-Driven Architecture  
**Completed**: March 2026  
**Status**: ✅ Full-stack MVP deployed

---

## Live Deployment

🌐 **Frontend (React)**: https://itr-challenge.onrender.com
🔧 **Backend API**: https://ecommerce-back-azdg.onrender.com/api  
📦 **Database**: PostgreSQL on Render

**Test Credentials**:

- Email: `admin@admin.com`
- Password: `12345678`

---

## Main Modifications Implemented

### 1. Backend API Enhancements

**Files Modified**: `main.ts`, `product.controller.ts`, `product.service.ts`, `pagination.dto.ts`

**Changes**:

- ✅ **CORS enabled** → Allows frontend (localhost:4200 / Render) to call backend
- ✅ **Global API prefix** (`/api`) → Organized routing and versioning support
- ✅ **Configurable port** → Reads from environment variables for flexibility
- ✅ **Product listing endpoint** → GET `/api/product` with pagination (page, limit)

**Why**: Frontend cannot call backend APIs without CORS; product browsing requires a listing endpoint.

---

### 2. Order Management System

**Files Created**: `order.entity.ts`, `order-item.entity.ts`, `order.module.ts`, `order.service.ts`, `order.controller.ts`, `create-order.dto.ts`

**Changes**:

- ✅ **Order & OrderItem entities** → Proper relationships with Product, User, ProductVariation
- ✅ **Create order endpoint** → POST `/api/order` with validation (user, items, quantities)
- ✅ **List orders** → GET `/api/order` with user-specific filtering
- ✅ **Cancel order** → PATCH `/api/order/:id/cancel` with status update
- ✅ **Order status enum** → Pending, Processing, Shipped, Delivered, Cancelled

**Why**: Core e-commerce functionality missing; needed to implement event-driven architecture.

---

### 3. Event-Driven Architecture

**Files Created**: `order-created.event.ts`, `order-cancelled.event.ts`, `inventory.listener.ts`

**Changes**:

- ✅ **EventEmitter2 integration** → In-process event handling for decoupled modules
- ✅ **OrderCreated event** → Emitted when order is placed → triggers inventory reservation
- ✅ **OrderCancelled event** → Emitted when order is cancelled → triggers stock release
- ✅ **Inventory listeners** → Subscribe to events and update stock automatically

**Why**: Decouples Order and Inventory modules; enables async operations without tight coupling.

---

### 4. Inventory Management

**Files Created**: `inventory.module.ts`, `inventory.service.ts`

**Changes**:

- ✅ **Stock reservation** → `reserveStock()` method with database transactions
- ✅ **Stock release** → `releaseStock()` method for cancelled orders
- ✅ **Stock validation** → Prevents orders when inventory insufficient
- ✅ **Event-driven updates** → Listens to OrderCreated/Cancelled events

**Why**: Ensures data integrity and prevents overselling; demonstrates event-driven patterns.

---

### 5. React Frontend (Primary)

**Directory**: `frontend-react/`

Complete React 19 + TypeScript application with Vite:

**Changes**:

- ✅ **Functional Components + Hooks** → Modern React architecture (useState, useEffect, useContext)
- ✅ **Context API for Auth** → Global state management without external libraries
- ✅ **Axios with Interceptors** → JWT token injection, automatic 401 handling
- ✅ **Protected Routes** → Authentication + role-based access control
- ✅ **Complete Admin Features** → Product management, role assignment, user administration
- ✅ **TypeScript Strict Mode** → Type-safe development with verbatimModuleSyntax
- ✅ **Vite Build System** → Fast development (HMR), optimized production bundle (92 kB gzipped)
- ✅ **Production-Ready** → Environment variables, \_redirects for SPA routing

**Why**: Challenge requirements. Provides modern developer experience with functional components, hooks, and optimized build times.

**Technology Stack**:

- React 19.2.0 + React Router DOM 7.13.1
- TypeScript 5.9.3 (strict mode)
- Axios 1.13.6 (HTTP client)
- Vite 7.3.1 (build tool)
- Socket.io Client 4.8.3 (WebSocket)

---

### 6. Asynchronous Events & Real-Time Notifications

**Files Created**: `order.processor.ts`, `events.gateway.ts`, `SocketContext.tsx`  
**Files Modified**: `order.service.ts`, `product.service.ts`, `CreateOrder.tsx`, `ProductList.tsx`

**Backend Changes**:

- ✅ **Bull Queue + Redis** → Asynchronous order processing with job queue
- ✅ **OrderProcessor** → Background worker that processes orders and updates status
- ✅ **Socket.io Gateway** → WebSocket server for real-time notifications
- ✅ **Order events via queue** → `createOrder` → Bull job → async processing → status updates
- ✅ **Product notifications** → Broadcast product activation/deactivation to connected clients

**Frontend Changes**:

- ✅ **SocketContext** → Global WebSocket connection management
- ✅ **Real-time order status** → UI shows "Creating → Processing → Confirmed" states
- ✅ **Product update toasts** → Instant notifications when products are activated/deactivated
- ✅ **User registration** → Automatic WebSocket room subscription for personalized events

**Why**: Demonstrates true async architecture with job queues; enables real-time user experience without polling.

---

## Audit: Additional Improvements (Not Implemented)

### Security Enhancements

- 🔒 **Rate limiting** → Prevent API abuse (not critical for MVP)
- 🔒 **Helmet middleware** → Security headers for production
- 🔒 **Password hashing strength** → Increase bcrypt rounds to 12+
- 🔒 **Input sanitization** → HTML/SQL injection prevention
- 🔒 **HTTPS enforcement** → Redirect HTTP to HTTPS in production

### Performance Optimizations

- ⚡ **Database indexing** → Optimize queries on `createdAt`, `userId`, `productId`
- ⚡ **Connection pooling** → Configure TypeORM pool size for concurrency
- ⚡ **CDN for static assets** → Faster frontend load times
- ⚡ **Response caching** → Cache product catalog with Redis to reduce DB load

### Testing & Quality

- 🧪 **Unit tests** → Services, controllers (Jest for backend, Jasmine for frontend)
- 🧪 **E2E tests** → Critical user flows (login, create order, cancel order)
- 🧪 **Integration tests** → Database operations, event listeners
- 🧪 **Load testing** → k6 or Artillery for stress testing
- 🧪 **Code coverage** → Minimum 80% coverage target

### DevOps & Monitoring

- 📊 **Logging service** → Winston or Pino with log aggregation
- 📊 **Error tracking** → Sentry or Rollbar for production errors
- 📊 **Health checks** → `/health` endpoint for uptime monitoring
- 📊 **CI/CD pipeline** → GitHub Actions for automated testing/deployment
- 📊 **Database backups** → Automated daily backups on Render

### User Experience

- 🎨 **Product search** → Full-text search by name, description
- 🎨 **Filtering** → By category, price range, availability
- 🎨 **Sorting** → Price, date, popularity
- 🎨 **Shopping cart persistence** → Save cart between sessions
- 🎨 **Email notifications** → Order confirmation, shipping updates

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16
- Redis 7+
- Git

### 1. Clone Repository

```bash
git clone https://github.com/FedeMC90/ITR-Challenge.git
cd Challenge-ITR
```

### 2. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker run --name ecommerce-db -e POSTGRES_USER=hassan -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ecommercedb -p 5432:5432 -d postgres:16-alpine

# Or use local PostgreSQL and create database
createdb ecommercedb
```

### 3. Redis Setup

```bash
# Start Redis (if using Docker)
docker run --name ecommerce-redis -p 6379:6379 -d redis:7-alpine

# Or use local Redis
redis-server
```

### 4. Backend Setup

```bash
cd backend
npm install

# Configure environment (backend/src/common/envs/development.env)
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_ENTITIES=dist/**/*.entity.js
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
REDIS_HOST=localhost
REDIS_PORT=6379

# Run migrations and seed
npm run build
npm run migration:run
npm run seed:run

# Start backend
npm run start:dev
```

Backend running at: `http://localhost:3000/api`

### 5. Frontend Setup

```bash
cd frontend-react
npm install

# Configure environment (frontend-react/.env)
VITE_API_URL=http://localhost:3000/api

# Start frontend
npm run dev
```

Frontend running at: `http://localhost:5173`

### 6. Test the Application

1. **Login**: Use `admin@admin.com` / `12345678`
2. **Browse Products**: View paginated product list
3. **Create Order**: Select products, specify quantities → See real-time status updates
4. **View Orders**: See order history
5. **Cancel Order**: Cancel an order → stock automatically released
6. **Activate Product**: Toggle product status → See instant toast notification

---

## Technology Stack

| Layer                  | Technology       | Version |
| ---------------------- | ---------------- | ------- |
| **Backend**            | NestJS           | 9.x     |
|                        | TypeORM          | 0.3.x   |
|                        | PostgreSQL       | 16      |
|                        | Redis            | 7.x     |
|                        | Bull             | 4.12.x  |
|                        | Socket.io        | 4.8.x   |
|                        | EventEmitter2    | 2.0.4   |
| **Frontend (Primary)** | React            | 19.2.0  |
|                        | Vite             | 7.3.1   |
|                        | Axios            | 1.13.6  |
|                        | Socket.io Client | 4.8.3   |
|                        | React Router     | 7.13.1  |
|                        | TypeScript       | 5.9.3   |
| **Deployment**         | Render           | Cloud   |

---

## Project Status

✅ **MVP Complete** - Full-stack event-driven e-commerce application with async processing and real-time notifications

---

**Demo Flow**: Login → Browse → Order (async) → Real-time Status → Cancel → Stock Update → Product Notification
