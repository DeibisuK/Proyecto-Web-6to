# Dockerfile para Cloudinary Service
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto del Cloudinary Service
EXPOSE 3006

# Comando para iniciar la aplicación
CMD ["npm", "start"]