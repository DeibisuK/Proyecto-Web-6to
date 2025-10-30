#!/bin/bash

# Script de despliegue automatizado para DigitalOcean Droplet
# Uso: ./deploy.sh

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue en DigitalOcean Droplet"
echo "==============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    print_error "Este script está diseñado para Ubuntu/Debian"
    exit 1
fi

# Verificar si somos root
if [[ $EUID -ne 0 ]]; then
    print_error "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

print_status "Actualizando sistema..."
apt update && apt upgrade -y

print_status "Instalando dependencias básicas..."
apt install -y curl wget git htop ufw

# Instalar Docker si no está instalado
if ! command -v docker &> /dev/null; then
    print_status "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    print_success "Docker instalado"
else
    print_success "Docker ya está instalado"
fi

# Instalar Docker Compose si no está instalado
if ! command -v docker-compose &> /dev/null; then
    print_status "Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado"
else
    print_success "Docker Compose ya está instalado"
fi

# Instalar Node.js si no está instalado (para setup-env.js)
if ! command -v node &> /dev/null; then
    print_status "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js instalado"
else
    print_success "Node.js ya está instalado"
fi

# Configurar firewall básico
print_status "Configurando firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 80
ufw allow 443
print_success "Firewall configurado"

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    print_status "Instalando Nginx..."
    apt install -y nginx
    systemctl enable nginx
    print_success "Nginx instalado"
else
    print_success "Nginx ya está instalado"
fi

# Crear directorio de la aplicación
APP_DIR="/opt/osc-backend"
if [ ! -d "$APP_DIR" ]; then
    print_status "Creando directorio de aplicación..."
    mkdir -p $APP_DIR
    chown $SUDO_USER:$SUDO_USER $APP_DIR
fi

print_status "Despliegue básico completado!"
print_success "Servidor listo para la aplicación"
echo ""
print_warning "Próximos pasos manuales:"
echo "1. Subir tu código a $APP_DIR"
echo "2. Configurar variables de entorno: cd $APP_DIR && node setup-env.js"
echo "3. Desplegar: docker-compose up -d --build"
echo "4. Configurar Nginx (ver DEPLOY-DigitalOcean.md)"
echo "5. Configurar SSL con Certbot"
echo ""
print_status "Comandos útiles:"
echo "  Ver logs: docker-compose logs -f"
echo "  Reiniciar: docker-compose restart"
echo "  Ver estado: docker-compose ps"
echo "  Monitoreo: htop"