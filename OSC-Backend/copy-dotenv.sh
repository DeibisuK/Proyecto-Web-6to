#!/bin/bash

# Script para copiar dotenv.js a todos los servicios
# Uso: ./copy-dotenv.sh

echo "📋 Copiando dotenv.js a todos los servicios..."

SERVICES=(
    "api-gateway"
    "user-service"
    "products-service"
    "buy-service"
    "court-service"
    "match-service"
    "cloudinary-service"
)

for service in "${SERVICES[@]}"; do
    echo "Copiando a $service..."
    cp config/dotenv.js "micro-servicios/$service/src/dotenv.js"
    echo "✅ $service actualizado"
done

echo ""
echo "🎉 Todos los servicios tienen dotenv.js actualizado"
echo "💡 Recuerda hacer commit de estos cambios"