#!/bin/bash

# Script de configuración automática de variables de entorno
# OSC Backend - Microservices Setup

echo "🚀 Configuración de Variables de Entorno - OSC Backend"
echo "======================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear .env desde .env.example
create_env_from_example() {
    local service_path=$1
    local service_name=$2
    
    if [ -f "$service_path/.env.example" ]; then
        if [ -f "$service_path/.env" ]; then
            echo -e "${YELLOW}⚠️  $service_name ya tiene archivo .env${NC}"
            read -p "¿Deseas sobrescribirlo? (s/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                echo -e "${BLUE}   Manteniendo .env existente${NC}"
                return
            fi
        fi
        
        cp "$service_path/.env.example" "$service_path/.env"
        echo -e "${GREEN}✓ $service_name configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  No se encontró .env.example en $service_name${NC}"
    fi
}

# Solicitar configuración de base de datos
echo -e "${BLUE}📝 Configuración de Base de Datos PostgreSQL (DigitalOcean)${NC}"
echo -e "${YELLOW}💡 Tip: Copia estos valores desde tu panel de DigitalOcean${NC}"
echo ""

read -p "DB_HOST (ej: db-postgresql-...ondigitalocean.com): " DB_HOST

read -p "DB_PORT (25060): " DB_PORT
DB_PORT=${DB_PORT:-25060}

read -p "DB_USER (ej: doadmin): " DB_USER

read -sp "DB_PASSWORD: " DB_PASSWORD
echo ""

read -p "DB_NAME (ej: bd_orosports): " DB_NAME

echo ""
echo -e "${BLUE}📦 Creando archivos .env...${NC}"
echo ""

# Array de servicios con sus rutas (folder:name:hasDB)
declare -a services=(
    "api-gateway:API Gateway:false"
    "user-service:User Service:true"
    "products-service:Products Service:true"
    "buy-service:Buy Service:true"
    "court-service:Court Service:true"
    "match-service:Match Service:true"
)

# Crear .env para cada servicio
for service in "${services[@]}"; do
    IFS=':' read -r service_folder service_name has_db <<< "$service"
    service_path="$service_folder"
    
    if [ -d "$service_path" ]; then
        create_env_from_example "$service_path" "$service_name"
        
        # Actualizar valores en el .env (solo para servicios con BD)
        if [ -f "$service_path/.env" ] && [ "$has_db" = "true" ]; then
            sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" "$service_path/.env"
            sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" "$service_path/.env"
            sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" "$service_path/.env"
            sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$service_path/.env"
            sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" "$service_path/.env"
        fi
    else
        echo -e "${YELLOW}⚠️  Directorio $service_folder no encontrado${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📌 Archivos .env creados en todos los servicios${NC}"
echo ""
echo -e "${BLUE}📌 Próximos pasos:${NC}"
echo "   1. Revisa los archivos .env generados"
echo "   2. Verifica que las credenciales sean correctas"
echo "   3. NUNCA subas los archivos .env a GitHub (ya están en .gitignore)"
echo "   4. Ejecuta tu script de inicio: node start-backend.js"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   • Los archivos .env contienen información sensible"
echo "   • Comparte las credenciales solo por canales seguros"
echo "   • Los archivos .env.example SÍ están en GitHub (sin datos reales)"
echo ""
