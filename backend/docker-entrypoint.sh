#!/bin/sh
set -e

echo "🚀 Starting E-commerce Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until nc -z "$DATABASE_HOST" 5432 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]
do
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "Waiting for database connection... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to connect to database after $MAX_RETRIES attempts"
  exit 1
fi

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "📦 Running database migrations..."
if npm run migration:run; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migrations failed or no pending migrations (continuing anyway)"
fi

# Run database seeders
echo "🌱 Running database seeders..."
if npm run seed:run; then
  echo "✅ Seeders completed successfully"
else
  echo "⚠️  Seeders failed or data already exists (continuing anyway)"
fi

echo "✅ Database initialization complete!"
echo "🎉 Starting application..."

# Start the application
exec "$@"
