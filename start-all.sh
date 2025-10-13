#!/bin/bash

echo "============================================================"
echo "  OSC Project - Start Backend and Frontend"
echo "============================================================"
echo ""

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar que Node.js esté instalado
if ! command_exists node; then
    echo "❌ Error: Node.js no está instalado"
    echo "   Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"
echo ""

# Iniciar backend en terminal separada
echo "🚀 Starting Backend..."
if command_exists gnome-terminal; then
    gnome-terminal -- bash -c "npm run start:backend; exec bash"
elif command_exists xterm; then
    xterm -e "npm run start:backend; bash" &
elif command_exists konsole; then
    konsole -e "npm run start:backend; bash" &
else
    echo "⚠️  No se encontró emulador de terminal compatible"
    echo "   Iniciando backend en esta terminal..."
    npm run start:backend &
    BACKEND_PID=$!
fi

# Esperar un momento para que el backend inicie
echo "⏳ Waiting for backend to start..."
sleep 5

# Iniciar frontend en terminal separada
echo "🎨 Starting Frontend..."
if command_exists gnome-terminal; then
    gnome-terminal --working-directory="$PWD/OSC-Frontend-Angular" -- bash -c "npm install && ng serve --open; exec bash"
elif command_exists xterm; then
    xterm -e "cd OSC-Frontend-Angular && npm install && ng serve --open; bash" &
elif command_exists konsole; then
    konsole --workdir "$PWD/OSC-Frontend-Angular" -e "npm install && ng serve --open; bash" &
else
    echo "⚠️  No se encontró emulador de terminal compatible"
    echo "   Inicia el frontend manualmente con:"
    echo "   cd OSC-Frontend-Angular && npm install && ng serve --open"
fi

echo ""
echo "============================================================"
echo "  ✅ Both processes started!"
echo "  📍 Backend: http://localhost:3000"
echo "  📍 Frontend: http://localhost:4200"
echo "============================================================"
echo ""
echo "💡 Para detener los servicios, cierra las ventanas de terminal"
echo ""
