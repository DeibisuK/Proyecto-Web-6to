# Dockerfile para User Service
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto del User Service
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]