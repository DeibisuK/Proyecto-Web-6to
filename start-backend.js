const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'OSC-Backend');
const services = fs.readdirSync(backendPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${services.length} services: ${services.join(', ')}`);

// Función para ejecutar un comando en un directorio
function runCommand(command, cwd, serviceName) {
  return new Promise((resolve, reject) => {
    console.log(`Running "${command}" in ${serviceName}...`);
    const process = exec(command, { cwd });

    process.stdout.on('data', (data) => {
      console.log(`[${serviceName}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${serviceName}-ERROR] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`"${command}" in ${serviceName} completed successfully.`);
        resolve();
      } else {
        console.error(`"${command}" in ${serviceName} failed with code ${code}.`);
        reject(new Error(`Failed to run "${command}" in ${serviceName}`));
      }
    });
  });
}

// 1. Instalar dependencias en todos los servicios en secuencia
async function installAll() {
  for (const service of services) {
    const servicePath = path.join(backendPath, service);
    if (fs.existsSync(path.join(servicePath, 'package.json'))) {
      await runCommand('npm install', servicePath, service);
    }
  }
}

// 2. Iniciar todos los servicios en paralelo
function startAll() {
  const startPromises = services.map(service => {
    const servicePath = path.join(backendPath, service);
    // Usamos 'npm run dev' que generalmente usa nodemon para desarrollo
    return runCommand('npm run dev', servicePath, service);
  });

  Promise.all(startPromises)
    .then(() => {
      console.log('All backend services are running.');
    })
    .catch(error => {
      console.error('Failed to start one or more services.', error);
      process.exit(1);
    });
}

// Ejecutar el flujo
installAll()
  .then(() => {
    console.log('All dependencies installed. Starting services...');
    startAll();
  })
  .catch(error => {
    console.error('Failed to install dependencies.', error);
    process.exit(1);
  });
