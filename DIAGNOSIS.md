# Technical Challenge - Diagnosis and Implementation Log

**Project**: NestJS E-commerce Backend Evolution  
**Objective**: Transform monolithic architecture into event-driven system with Angular frontend  
**Approach**: Minimal viable changes following "just enough to work" principle

---

## STEP 1: DIAGNOSTIC & ENVIRONMENT SETUP

### Environment Status (✅ Verified)

- **PostgreSQL**: Running in Docker (postgres:16-alpine, port 5432)
- **Dependencies**: All npm packages installed successfully
- **Application**: Compiles and starts without errors
- **Database Migrations**: Executed (all tables created)
- **Seeders**: Initial data loaded (roles, categories, colors, sizes, countries, currencies, admin user)

---

## TOP 5 CRITICAL STRUCTURAL ISSUES

### 1. ❌ Missing Order Module (HIGH PRIORITY - BLOCKING)

**Problem**: The application lacks core e-commerce functionality - no Order or Cart entities exist.

**Evidence**:

- No order-related entities in `src/database/entities/`
- No order module in `src/api/`
- Inventory exists but has no consumption/reservation logic
- Cannot create orders → Cannot demonstrate event-driven architecture

**Impact**:

- Core e-commerce functionality missing
- Cannot implement `OrderCreated` event (required for Step 3)
- No way to link products to purchases
- Inventory management incomplete

**Solution Required**:

- Create `Order` and `OrderItem` entities with relationships to Product/User
- Create Order module (DTOs, services, controllers)
- Implement basic order placement logic with validation

---

### 2. ❌ No Event Infrastructure (HIGH PRIORITY - BLOCKING STEP 3)

**Problem**: No event handling mechanism exists. EventEmitter2 required for decoupled event-driven architecture.

**Evidence**:

- `@nestjs/event-emitter` package not installed
- No event handlers or emitters in codebase
- Modules are tightly coupled through direct service calls

**Technical Justification**:

- **Why EventEmitter2?** Ideal for monolithic apps evolving toward decoupling
- **Benefits**: Low infrastructure overhead (in-process, no external message broker), enables Order → Inventory decoupling without microservices complexity
- **Trade-offs**: Events are synchronous and in-memory (acceptable for MVP, can migrate to message broker later if needed)

**Solution Required**:

- Install `@nestjs/event-emitter` package
- Configure `EventEmitterModule` globally in `app.module.ts`
- Create domain events (e.g., `OrderCreatedEvent`, `OrderCancelledEvent`)
- Implement event listeners for decoupled operations

---

### 3. ⚠️ Incomplete Product API (MEDIUM PRIORITY)

**Problem**: No product listing endpoint - only individual product retrieval exists.

**Evidence**:

- `ProductController` only exposes `GET /product/:id`
- No pagination, filtering, or "get all products" endpoint
- Frontend cannot display product catalog without this

**Impact**:

- Angular frontend (Step 4) cannot show product list
- No way to browse available inventory
- Missing basic e-commerce UX requirement

**Solution Required**:

- Add `GET /products` endpoint with pagination support
- Add query filters (category, active status, search)
- Return products with inventory availability info
- Implement DTOs for pagination parameters

---

### 4. ⚠️ Missing Inventory Management Logic (MEDIUM PRIORITY)

**Problem**: `Inventory` entity exists but has no service layer for stock operations.

**Evidence**:

- No `InventoryService` or `InventoryModule`
- No stock validation before order placement
- No stock update mechanism after purchase
- Potential race conditions on concurrent orders

**Impact**:

- Orders can be placed regardless of stock availability
- Cannot demonstrate event-driven stock updates
- Data integrity issues possible

**Solution Required**:

- Create `InventoryModule` with service layer
- Implement methods: `checkAvailability()`, `reserveStock()`, `releaseStock()`
- Add event listener for `OrderCreatedEvent` to update stock
- Add database transactions for stock operations

---

### 5. ⚠️ Frontend Integration Blockers (MEDIUM PRIORITY)

**Problem**: Configuration prevents Angular frontend integration.

**Evidence**:

- Port hardcoded in `main.ts` (should use `ConfigService`)
- No CORS configuration (blocks browser requests from Angular dev server)
- No API prefix/versioning

**Impact**:

- Angular app on `http://localhost:4200` cannot call backend on `http://localhost:3000`
- CORS errors block all API calls from browser
- Unclear API routing

**Status**: ✅ **FIXED in Step 2 - Task 1** (see below)

---

## STEP 2: MINIMAL BACKEND FIXES

### Task 1: Frontend Integration Fix ✅ COMPLETED

**Files Modified**: `src/main.ts`, `README.md`

#### Change 1: Enable CORS (CRITICAL)

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:4201',
  ],
  credentials: true,
});
```

**Technical Justification**:

- **Problem**: Browsers block HTTP requests from one origin (e.g., `http://localhost:4200` - Angular) to another (e.g., `http://localhost:3000` - NestJS) due to Same-Origin Policy
- **Solution**: CORS (Cross-Origin Resource Sharing) headers tell browsers to allow cross-origin requests
- **Allowed Origins**:
  - `3000`: Frontend served from same port (optional scenario)
  - `4200`: Default Angular CLI dev server port
  - `4201`: Angular CLI fallback port when 4200 is occupied
- **credentials: true**: Required to send cookies/authorization headers (needed for JWT authentication)

**Verification**:

```bash
curl -i -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST"
```

Response includes: `Access-Control-Allow-Origin: http://localhost:4200`

---

#### Change 2: Configurable Port (BEST PRACTICE)

```typescript
const configService = app.get(ConfigService);
const port = configService.get<number>('port');
await app.listen(port);
```

**Technical Justification**:

- **Before**: Port hardcoded as `3000` → Cannot change without modifying code
- **After**: Reads from `src/common/envs/development.env` where `PORT=3000` is defined
- **Benefits**:
  - Different ports for dev/prod/test environments without code changes
  - Follows 12-factor app principle (config in environment variables)
  - Leverages existing `ConfigModule` setup

**Trade-offs**: None - this is pure improvement with no downsides

---

#### Change 3: Global API Prefix (ORGANIZATION)

```typescript
app.setGlobalPrefix('api');
```

**Technical Justification**:

- **Before**: `http://localhost:3000/auth/login`
- **After**: `http://localhost:3000/api/auth/login`

**Reasons**:

1. **Separation of Concerns**: If serving static files (frontend) from same port, `/api/*` routes are backend, `/*` routes are frontend
2. **Future Versioning**: Enables `/api/v1/` and `/api/v2/` without massive refactor
3. **Industry Standard**: Most REST APIs follow this pattern (GitHub, Stripe, Twilio, etc.)
4. **Developer Experience**: URL clearly indicates it's an API call

**Impact on Existing Code**: All routes automatically prefixed - no controller changes needed

---

### Decisions NOT Made (and why)

❌ **Rate Limiting**: Not critical for local development, can add in production deployment  
❌ **Helmet Security Headers**: Important for production but doesn't block MVP functionality  
❌ **Advanced Logging**: NestJS built-in logging sufficient for development phase  
❌ **Swagger/OpenAPI Documentation**: Useful but not required for minimal viable product

These follow the "just enough to work" principle - we can add them later if needed.

---

### Task 2: Product Listing Endpoint ✅ COMPLETED

**Files Modified**: `src/api/product/controllers/product.controller.ts`, `src/api/product/services/product.service.ts`  
**Files Created**: `src/common/dto/pagination.dto.ts`

#### Change: Add GET /api/product endpoint with pagination

**Problem Addressed**: Frontend cannot display product catalog without a listing endpoint.

**Implementation** (Minimal Viable):

1. **Pagination DTO** (`pagination.dto.ts`):

```typescript
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Default page 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Default 10 items, max 100
}
```

2. **Service Method** (`product.service.ts`):

```typescript
async getProducts(query: PaginationQueryDto) {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [products, total] = await this.entityManager.findAndCount(Product, {
    where: { isActive: true },  // Only active products
    skip,
    take: limit,
    order: { createdAt: 'DESC' },  // Newest first
  });

  return {
    data: products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
}
```

3. **Controller Endpoint** (`product.controller.ts`):

```typescript
@Get()
async getProducts(@Query() query: PaginationQueryDto) {
  return this.productService.getProducts(query);
}
```

**Technical Decisions**:

- **Public Endpoint**: No `@Auth()` decorator → Anyone can view products (standard e-commerce behavior)
- **Active Products Only**: `where: { isActive: true }` → Don't show drafts/inactive products to customers
- **Standardized Response**: Includes `meta` object with pagination info for frontend consumption
- **Order**: `createdAt: 'DESC'` → Show newest products first (common UX pattern)
- **Reusable DTO**: Created in `common/dto/` for use across other modules (users, orders, etc.)

**What Was NOT Implemented** (Following "minimal viable" principle):
❌ Search/filtering by category, price, name (can add later if needed)  
❌ Sorting options (currently hardcoded to newest first)  
❌ Product relations/joins (category, variations) - keeps response lightweight  
❌ Caching (not needed for MVP)

**Verification**:

```bash
curl http://localhost:3000/api/product
# Response: {"isSuccess":true,"message":"success","data":{"data":[],"meta":{"total":0,"page":1,"limit":10,"totalPages":0}}}
```

Empty array is expected - no active products exist yet. Angular frontend can now consume this endpoint.

---

### Task 3: Order Module Creation ✅ COMPLETED

**Files Created**:

- `src/database/entities/order.entity.ts` - Order entity
- `src/database/entities/order-item.entity.ts` - OrderItem entity
- `src/api/order/dto/order.dto.ts` - DTOs for order creation
- `src/api/order/services/order.service.ts` - Order business logic
- `src/api/order/controllers/order.controller.ts` - Order endpoints
- `src/api/order/order.module.ts` - Order module configuration
- `src/database/migration/history/1773073661822-create-order-tables.ts` - Database migration

**Files Modified**:

- `src/api/api.module.ts` - Added OrderModule import

#### Implementation (Minimal Viable)

**1. Entities** (Following existing patterns):

```typescript
// Order entity
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'int' })
  public userId: number;

  @ManyToOne(() => User)
  public user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  public items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  public totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  public status: OrderStatus; // PENDING | CONFIRMED | CANCELLED
}

// OrderItem entity
@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => Order, (order) => order.items)
  public order: Order;

  @ManyToOne(() => Product)
  public product: Product;

  @Column({ type: 'int' })
  public quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  public price: number; // Price at time of purchase (historical record)
}
```

**2. DTOs** (Simple validation):

```typescript
export class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
```

**3. Service** (Transaction-based):

```typescript
async createOrder(userId: number, createOrderDto: CreateOrderDto) {
  return await this.entityManager.transaction(async (manager) => {
    // Create order
    const order = manager.create(Order, { userId, status: OrderStatus.PENDING });
    await manager.save(order);

    // Create items and calculate total
    const orderItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await manager.findOne(Product, {
          where: { id: item.productId, isActive: true }
        });
        if (!product) throw new NotFoundException(...);

        return manager.create(OrderItem, { ...item, orderId: order.id });
      })
    );

    await manager.save(orderItems);
    order.totalAmount = /* calculate total */;
    await manager.save(order);

    return order;
  });
}
```

**4. Controller** (Authenticated endpoints):

```typescript
@Controller('order')
export class OrderController {
  @Auth() // Requires authentication
  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.orderService.createOrder(user.id, dto);
  }

  @Auth()
  @Get()
  async getMyOrders(@CurrentUser() user: User) {
    return this.orderService.getOrdersByUser(user.id);
  }
}
```

**Routes Created**:

- `POST /api/order` - Create new order (authenticated)
- `GET /api/order` - Get user's orders (authenticated)

**Database Migration Executed**:

```sql
CREATE TABLE "order" (...);
CREATE TABLE "order_item" (...);
ALTER TABLE "order" ADD CONSTRAINT FK_userId;
ALTER TABLE "order_item" ADD CONSTRAINT FK_orderId;
ALTER TABLE "order_item" ADD CONSTRAINT FK_productId;
```

#### Technical Decisions

**Why Transaction?**

- Ensures atomicity: either entire order is created or nothing happens
- Prevents orphaned order items if order creation fails
- Critical for data integrity in e-commerce

**Why OrderStatus enum?**

- Simple state machine: PENDING → CONFIRMED (or CANCELLED)
- Extensible for future states (SHIPPED, DELIVERED, REFUNDED)
- Type-safe in TypeScript

**Why store `price` in OrderItem?**

- **Historical accuracy**: Product prices change over time
- Order should reflect price at time of purchase, not current price
- Prevents discrepancies in financial records
- Simplified for MVP (would normally come from ProductVariation pricing)

**What Was NOT Implemented** (Following "minimal viable"):
❌ Stock validation (will be handled by events in Step 3)  
❌ Payment processing  
❌ Shipping address  
❌ Order status transitions/workflow  
❌ Product variations pricing (simplified to 0 for MVP)  
❌ Order cancellation endpoint  
❌ Admin order management

**Critical for Next Step**:
This Order module is **decoupled** - it doesn't directly call InventoryService. This sets up the foundation for event-driven architecture where creating an order will emit an `OrderCreatedEvent` that InventoryService listens to.

---

## Next Steps

### Pending Tasks (Step 2)

- [x] **Task 1**: Frontend Integration (CORS, API prefix, configurable port) ✅
- [x] **Task 2**: Add `GET /api/products` endpoint with pagination ✅
- [x] **Task 3**: Create Order module (entities, DTOs, basic service) ✅
- [ ] **Task 4**: Install and configure EventEmitter2
- [ ] **Task 5**: Create Inventory service with stock management

### Step 3: Event-Driven Implementation

- [ ] Implement `OrderCreatedEvent` and `OrderCancelledEvent`
- [ ] Create event listeners for inventory updates
- [ ] Ensure Order module does not depend on Inventory module (decoupled via events)

### Step 4: Angular 17 Frontend MVP

- [ ] Product listing page consuming `GET /api/products`
- [ ] Basic order placement form
- [ ] Simple stock update reflection (polling or RxJS observables)

---

## Technical Debt & Known Issues

1. **Mixed Language in Code**: Some Spanish comments/variable names exist - should standardize to English
2. **EntityManager vs Repository Pattern**: Using `EntityManager` directly instead of Repository pattern (acceptable but not ideal)
3. **Incomplete Validation**: Some DTOs lack comprehensive validators
4. **No Pagination DTOs**: Need standardized pagination request/response DTOs
5. **Database Logging in Production**: `logging: true` in TypeORM config should be disabled for production

---

## Key Architectural Decisions

### Why Monolithic with Events vs Microservices?

- **Context**: Challenge requires evolution from monolith toward decoupling
- **Decision**: Use EventEmitter2 (in-process events) instead of message broker
- **Rationale**:
  - Lower infrastructure complexity for MVP
  - Easier to debug and test locally
  - Can migrate to RabbitMQ/Redis later if needed
  - Maintains monolithic deployment simplicity while achieving logical decoupling

### Why NestJS Built-in Tools vs External Libraries?

- **CORS**: Using NestJS `enableCors()` instead of separate middleware
- **Validation**: Using `class-validator` already integrated
- **Config**: Using `@nestjs/config` already set up
- **Rationale**: Leverage existing dependencies, reduce package bloat, maintain consistency

### Why Angular 17 vs React for Frontend?

- **Decision**: Use Angular 17 Standalone Components instead of React
- **Rationale**:
  1. **TypeScript Consistency**: Both NestJS and Angular are TypeScript-first frameworks, providing end-to-end type safety
  2. **Architectural Similarity**: Both use dependency injection, decorators, and modular structure → Easier mental model for fullstack development
  3. **RxJS Native Integration**: Angular's built-in RxJS support perfect for handling async events (stock updates, polling)
  4. **HttpClient Advantages**: More robust than fetch/axios with interceptors for JWT, error handling, retry logic
  5. **Standalone Components (Angular 17)**: Eliminates NgModule boilerplate, lighter bundle size similar to React
  6. **Signals (Angular 17)**: New reactive primitives competitive with React hooks
- **Trade-offs**:
  - Slightly larger initial bundle size than React (acceptable for MVP)
  - Less flexibility than React (but more structure, which fits with NestJS backend)
- **CORS Update Required**: Changed allowed origins from `5173/5174` (Vite/React) to `4200/4201` (Angular CLI)

---

**Last Updated**: March 9, 2026  
**Status**: Step 2 - Tasks 1-3 Complete (Frontend + Products API + Order Module), Ready for Event-Driven Implementation
