# Dockerfile para API Gateway
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto del API Gateway
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]