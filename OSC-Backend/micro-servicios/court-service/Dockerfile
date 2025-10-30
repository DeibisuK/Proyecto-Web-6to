# Dockerfile para Court Service
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto del Court Service
EXPOSE 3004

# Comando para iniciar la aplicación
CMD ["npm", "start"]