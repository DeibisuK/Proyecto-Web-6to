# Guía de Despliegue en DigitalOcean

## 🚀 Opciones de Despliegue

### Opción 1: Droplet con Docker (Recomendado)
Ideal para tu arquitectura de microservicios con control total.

### Opción 2: App Platform
Más simple pero limitado para múltiples servicios.

---

## 🐳 Opción 1: Droplet con Docker

### 1. Crear un Droplet

1. Ve a [DigitalOcean Dashboard](https://cloud.digitalocean.com/)
2. Click "Create" → "Droplets"
3. Elige:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Al menos 2GB RAM ($12/mes) para microservicios
   - **Datacenter**: El mismo que tu base de datos
   - **Authentication**: SSH Key (recomendado) o Password

### 2. Conectar al Droplet

```bash
# Conectar via SSH
ssh root@TU_IP_DROPLET
```

### 3. Instalar Docker y Docker Compose

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión
exit
ssh root@TU_IP_DROPLET
```

### 4. Subir y configurar tu proyecto

```bash
# Instalar Git
sudo apt install git -y

# Clonar tu repositorio
git clone https://github.com/DeibisuK/Proyecto-Web-6to.git
cd Proyecto-Web-6to/OSC-Backend

# Configurar variables de entorno
node setup-env.js
# (Ingresa tus credenciales de DB y servicios)
```

### 5. Configurar firewall

```bash
# Configurar UFW
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 6. Desplegar con Docker

```bash
# Construir e iniciar servicios
docker-compose up -d --build

# Verificar que estén corriendo
docker-compose ps
docker-compose logs
```

**Nota importante**: Si encuentras errores de "Cannot find module '/config/dotenv.js'", ejecuta:
```bash
# Copiar configuración de entorno a todos los servicios
./copy-dotenv.sh
# Luego reconstruir
docker-compose up -d --build
```

### 7. Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración para API Gateway
sudo nano /etc/nginx/sites-available/osc-backend
```

Contenido del archivo `/etc/nginx/sites-available/osc-backend`:

```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/osc-backend /etc/nginx/sites-enabled/

# Remover configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 8. Configurar SSL (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtener certificado SSL gratis
sudo certbot --nginx -d TU_DOMINIO
```

---

## 📱 Opción 2: App Platform (Más simple)

### Limitaciones:
- Solo despliega desde GitHub
- Difícil manejar múltiples servicios
- Menos control sobre configuración

### Pasos básicos:

1. Ve a [App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" → "GitHub"
3. Selecciona tu repositorio
4. Configura:
   - **Source Directory**: `OSC-Backend`
   - **Environment**: Variables de entorno
   - **Run Command**: `docker-compose up --build`
5. Despliega

**Nota**: App Platform puede no ser ideal para tu arquitectura compleja de microservicios.

---

## 🔧 Configuración de Producción

### Variables de entorno para producción:

Asegúrate de que en producción:

```bash
# En .env raíz
DB_HOST=tu-db-cluster-url.digitalocean.com
NODE_ENV=production

# URLs absolutas en api-gateway/.env
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
# ... etc
```

### Monitoreo básico:

```bash
# Ver logs
docker-compose logs -f

# Ver uso de recursos
docker stats

# Reiniciar servicios
docker-compose restart
```

### Backup y mantenimiento:

```bash
# Backup de configuración
tar -czf backup-config.tar.gz OSC-Backend/.env OSC-Backend/docker-compose.yml

# Actualizar aplicación
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 🚨 Consideraciones de Seguridad

1. **Nunca subas archivos .env a Git**
2. **Usa SSH keys, no passwords**
3. **Configura firewall (UFW)**
4. **Mantén el sistema actualizado**
5. **Usa HTTPS en producción**
6. **Configura monitoring y alertas**

---

## 💰 Costos aproximados

- **Droplet (2GB RAM)**: $12/mes
- **Base de datos**: $15-50/mes (dependiendo del plan)
- **Dominio**: $10-15/año
- **SSL**: Gratis con Let's Encrypt

¿Necesitas ayuda con algún paso específico?