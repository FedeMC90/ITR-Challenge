# Technical Challenge - Diagnosis Report

**Project**: NestJS E-commerce with Event-Driven Architecture  
**Completed**: March 2026  
**Status**: ✅ Full-stack MVP deployed

---

## Live Deployment

🌐 **Frontend (React)**: https://itr-challenge.onrender.com
🌐 **Frontend (Angular - Backup)**: https://ecommerce-front-wmjg.onrender.com  
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

**Files Created**: Complete React 19 + TypeScript application with Vite:

- `src/types/index.ts` → TypeScript interfaces (User, Product, Order, Role, API responses)
- `src/config/axios.ts` → Axios client with JWT interceptors
- `src/context/AuthContext.tsx` → Global authentication state (Context API)
- `src/services/` → API layer (productService, orderService, userService, roleService)
- `src/components/Login.tsx` → Login form with registration modal
- `src/components/ProductList.tsx` → Product grid with active/inactive sorting and toggle
- `src/components/CreateProduct.tsx` → 3-step product creation flow
- `src/components/CreateOrder.tsx` → Two-panel order creation (products + cart)
- `src/components/OrderList.tsx` → Order history with cancel functionality
- `src/components/ManageRoles.tsx` → Admin-only role management interface
- `src/components/ProtectedRoute.tsx` → Route guard with admin checking
- `src/App.tsx` → Main routing configuration
- `.env.production` → Production API URL configuration
- `public/_redirects` → Render SPA routing configuration

**Changes**:

- ✅ **Functional Components + Hooks** → Modern React architecture (useState, useEffect, useContext)
- ✅ **Context API for Auth** → Global state management without external libraries
- ✅ **Axios with Interceptors** → JWT token injection, automatic 401 handling
- ✅ **Protected Routes** → Authentication + role-based access control
- ✅ **Complete Admin Features** → Product management, role assignment, user administration
- ✅ **TypeScript Strict Mode** → Type-safe development with verbatimModuleSyntax
- ✅ **Vite Build System** → Fast development (HMR), optimized production bundle (92 kB gzipped)
- ✅ **Production-Ready** → Environment variables, \_redirects for SPA routing

**Why**: Challenge requirements changed from Angular to React. Provides modern developer experience with functional components, hooks, and optimized build times.

**Technology Stack**:

- React 19.2.0 + React Router DOM 7.13.1
- TypeScript 5.9.3 (strict mode)
- Axios 1.13.6 (HTTP client)
- Vite 7.3.1 (build tool)

---

### 6. Angular Frontend (Backup)

**Directory**: `frontend/`

**Files Created**: Complete Angular 17 standalone application with:

- `auth.service.ts`, `product.service.ts`, `order.service.ts` → API integration
- `login.component.ts`, `product-list.component.ts`, `order-list.component.ts` → UI components
- `auth.interceptor.ts` → JWT token handling
- `environment.prod.ts` → Production API configuration

**Changes**:

- ✅ **Standalone components** → Modern Angular 17 architecture (no NgModules)
- ✅ **JWT authentication** → Login, token storage, protected routes
- ✅ **Product browsing** → Paginated product list with inventory display
- ✅ **Order creation** → Shopping cart → place orders → view order history
- ✅ **Order cancellation** → Cancel orders → auto stock release

**Status**: Kept as backup; original implementation before framework migration.

**Why**: Demonstrates full-stack integration; validates backend API functionality.

---

## Audit: Additional Improvements (Not Implemented)

### Security Enhancements

- 🔒 **Rate limiting** → Prevent API abuse (not critical for MVP)
- 🔒 **Helmet middleware** → Security headers for production
- 🔒 **Password hashing strength** → Increase bcrypt rounds to 12+
- 🔒 **Input sanitization** → HTML/SQL injection prevention
- 🔒 **HTTPS enforcement** → Redirect HTTP to HTTPS in production

### Performance Optimizations

- ⚡ **Redis caching** → Cache product catalog and reduce DB load
- ⚡ **Database indexing** → Optimize queries on `createdAt`, `userId`, `productId`
- ⚡ **Connection pooling** → Configure TypeORM pool size for concurrency
- ⚡ **CDN for static assets** → Faster frontend load times
- ⚡ **Lazy loading** → Angular modules for better initial load

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
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd Challenge-ITR
```

### 2. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker run --name ecommerce-db -e POSTGRES_USER=hassan -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ecommercedb -p 5432:5432 -d postgres:16-alpine

# Or use local PostgreSQL and create database
createdb ecommercedb
```

### 3. Backend Setup

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

# Run migrations and seed
npm run build
npm run migration:run
npm run seed:run

# Start backend
npm run start:dev
```

Backend running at: `http://localhost:3000/api`

### 4. Frontend Setup (React - Primary)

```bash
cd frontend-react
npm install

# Configure environment (frontend-react/.env)
VITE_API_URL=http://localhost:3000/api

# Start frontend
npm run dev
```

Frontend running at: `http://localhost:5173`

**Alternative: Angular Frontend (Backup)**

```bash
cd frontend
npm install

# Configure environment (frontend/src/environments/environment.ts)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

# Start frontend
npm start
```

Frontend running at: `http://localhost:4200`

### 5. Test the Application

1. **Login**: Use `admin@admin.com` / `12345678`
2. **Browse Products**: View paginated product list
3. **Create Order**: Select products, specify quantities
4. **View Orders**: See order history
5. **Cancel Order**: Cancel an order → stock automatically released

---

## Technology Stack

| Layer                  | Technology    | Version |
| ---------------------- | ------------- | ------- |
| **Backend**            | NestJS        | 9.x     |
|                        | TypeORM       | 0.3.x   |
|                        | PostgreSQL    | 16      |
|                        | EventEmitter2 | 2.0.4   |
| **Frontend (Primary)** | React         | 19.2.0  |
|                        | Vite          | 7.3.1   |
|                        | Axios         | 1.13.6  |
|                        | React Router  | 7.13.1  |
|                        | TypeScript    | 5.9.3   |
| **Frontend (Backup)**  | Angular       | 17.x    |
|                        | TypeScript    | 5.x     |
|                        | RxJS          | 7.x     |
| **Deployment**         | Render        | Cloud   |

---

## Project Status

✅ **MVP Complete** - Full-stack event-driven e-commerce application

---

## Migration Notes

### Angular → React Framework Migration

**Date**: March 2026  
**Reason**: Challenge requirements changed post-submission from Angular to React  
**Approach**: Parallel development (kept Angular as backup)

**Migration Details**:

1. **Created New React Project** (`frontend-react/`)
   - Vite + React 19 + TypeScript 5.9
   - Migrated all 7 components maintaining feature parity
   - Replaced Angular services with axios + Context API
   - Production build: 284.52 kB (92.21 kB gzipped)

2. **Component Mapping**:
   - Login → Login.tsx (with registration modal)
   - ProductList → ProductList.tsx (grid + toggle active/inactive)
   - CreateProduct → CreateProduct.tsx (3-step flow)
   - CreateOrder → CreateOrder.tsx (cart system)
   - OrderList → OrderList.tsx (cancel functionality)
   - ManageRoles → ManageRoles.tsx (Admin only)
   - ProtectedRoute → Route guards with admin checking

3. **State Management Migration**:
   - Angular Services + RxJS → React Context API + useState/useEffect
   - AuthService → AuthContext.tsx (login, register, logout, hasRole)
   - Product/Order/User/Role Services → axios-based service functions

4. **Build & Deployment**:
   - Development: Vite dev server (port 5173)
   - Production: Optimized bundle with environment variables
   - Render: Static Site with `_redirects` for SPA routing

5. **Key Differences**:
   - No dependency injection (React doesn't need it)
   - Functional components + hooks (vs. class-based components)
   - JSX instead of Angular templates
   - Manual subscription management replaced by useEffect cleanup

**Current Status**: React build successful, ready for deployment. Angular remains as backup.
✅ **Production Deployed** - Live on Render with PostgreSQL  
✅ **Core Features** - Auth, Products, Orders, Inventory, Events  
✅ **Event-Driven** - Decoupled Order/Inventory modules

**Demo Flow**: Login → Browse → Order → Cancel → Stock Update
