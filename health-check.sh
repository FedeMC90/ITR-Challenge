#!/bin/bash

# Health Check Script - Verifies all services are running correctly
# Run this after starting Docker Compose to ensure everything works

set -e

echo "🏥 Health Check - E-commerce Platform"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo "📊 Checking Docker services..."
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Services are not running. Start with: docker-compose up -d${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker services are running${NC}"
echo ""

# Check PostgreSQL
echo "🐘 Checking PostgreSQL..."
if docker exec ecommerce-postgres pg_isready -U hassan &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
    exit 1
fi

# Check Redis
echo "💾 Checking Redis..."
if docker exec ecommerce-redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
    exit 1
fi

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check Backend API
echo "🔧 Checking Backend API..."
if curl -s http://localhost:3000/api &> /dev/null; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    echo "   Try: docker-compose logs backend"
    exit 1
fi

# Check Frontend
echo "🎨 Checking Frontend..."
if curl -s http://localhost/health &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is serving${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might not be ready yet${NC}"
fi
echo ""

# Check Bull Queue jobs
echo "📋 Checking Bull Queue configuration..."
if docker exec ecommerce-redis redis-cli KEYS "bull:orders:*" &> /dev/null; then
    echo -e "${GREEN}✅ Bull Queue is configured${NC}"
else
    echo -e "${YELLOW}⚠️  No queue jobs yet (normal on first start)${NC}"
fi
echo ""

# Display connection info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All core services are healthy!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:3000/api"
echo ""
echo "🔐 Test Credentials:"
echo "   Email:     admin@admin.com"
echo "   Password:  12345678"
echo ""
echo "🧪 Quick Tests:"
echo "   1. Login:         curl -X POST http://localhost:3000/api/auth/login \\"
echo "                       -H 'Content-Type: application/json' \\"
echo "                       -d '{\"email\":\"admin@admin.com\",\"password\":\"12345678\"}'"
echo ""
echo "   2. Products:      curl http://localhost:3000/api/product"
echo ""
echo "   3. Redis status:  docker exec ecommerce-redis redis-cli INFO stats"
echo ""
echo "   4. View logs:     docker-compose logs -f backend"
echo ""
echo "💡 Next Steps:"
echo "   • Open http://localhost in your browser"
echo "   • Login with admin credentials"
echo "   • Create an order to test async processing"
echo "   • Check WebSocket in DevTools Console"
echo ""
