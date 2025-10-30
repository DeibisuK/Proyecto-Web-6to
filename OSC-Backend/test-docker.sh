#!/bin/bash

# Script para probar la configuración de Docker
# Uso: ./test-docker.sh

echo "🐳 Probando configuración de Docker para OSC Backend"
echo "=================================================="

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde https://docker.com"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ No se encuentra docker-compose.yml. Ejecuta desde OSC-Backend/"
    exit 1
fi

# Verificar archivos .env
echo ""
echo "📋 Verificando archivos de configuración..."

if [ ! -f ".env" ]; then
    echo "❌ Falta archivo .env en la raíz"
    echo "   Ejecuta: node setup-env.js"
    exit 1
else
    echo "✅ .env raíz encontrado"
fi

services=("api-gateway" "user-service" "products-service" "buy-service" "court-service" "match-service" "cloudinary-service")

for service in "${services[@]}"; do
    if [ ! -f "micro-servicios/$service/.env" ]; then
        echo "❌ Falta .env en $service"
        echo "   Ejecuta: node setup-env.js"
        exit 1
    else
        echo "✅ .env de $service encontrado"
    fi
done

echo ""
echo "🔨 Probando construcción de imágenes..."

# Probar construcción de un servicio pequeño primero
echo "Construyendo user-service..."
if docker-compose build user-service; then
    echo "✅ user-service construido correctamente"
else
    echo "❌ Error al construir user-service"
    exit 1
fi

echo ""
echo "🚀 Probando inicio de servicios..."

# Probar iniciar servicios
if docker-compose up -d user-service; then
    echo "✅ user-service iniciado correctamente"

    # Esperar un poco y verificar que esté corriendo
    sleep 5

    if docker-compose ps user-service | grep -q "Up"; then
        echo "✅ user-service está ejecutándose"

        # Probar conexión básica
        if curl -f http://localhost:3001 > /dev/null 2>&1; then
            echo "✅ user-service responde correctamente"
        else
            echo "⚠️  user-service no responde (puede ser normal si necesita configuración adicional)"
        fi
    else
        echo "❌ user-service no está ejecutándose"
        docker-compose logs user-service
        exit 1
    fi

    # Detener el servicio de prueba
    docker-compose down
    echo "✅ Servicio de prueba detenido"
else
    echo "❌ Error al iniciar user-service"
    exit 1
fi

echo ""
echo "🎉 ¡Configuración de Docker verificada correctamente!"
echo ""
echo "📝 Próximos pasos:"
echo "   - Ejecuta: docker-compose up --build  (para todos los servicios)"
echo "   - O: docker-compose up -d --build  (en segundo plano)"
echo "   - Ver logs: docker-compose logs -f"
echo ""
echo "📖 Lee README-Docker.md para más información"