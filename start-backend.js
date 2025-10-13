const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'OSC-Backend');
const services = fs.readdirSync(backendPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
  .map(dirent => dirent.name);

console.log(`\n🚀 OSC Backend Startup Script`);
console.log(`Found ${services.length} services: ${services.join(', ')}\n`);

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

// Verificar si ya existen archivos .env
function checkEnvFiles() {
  const missingEnv = [];
  
  for (const service of services) {
    const envPath = path.join(backendPath, service, '.env');
    const envExamplePath = path.join(backendPath, service, '.env.example');
    
    if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
      missingEnv.push(service);
    }
  }
  
  return missingEnv;
}

// Configurar archivos .env automáticamente
async function setupEnvFiles() {
  const missingEnv = checkEnvFiles();
  
  if (missingEnv.length === 0) {
    console.log('✅ All .env files already exist. Skipping configuration.\n');
    return;
  }

  console.log('\n⚠️  Missing .env files detected in:', missingEnv.join(', '));
  console.log('🔧 Running automatic environment setup...\n');

  try {
    // Ejecutar el script de configuración automática
    await runCommand('node setup-env.js', backendPath, 'env-setup');
    console.log('\n✅ Environment files configured successfully!\n');
  } catch (error) {
    console.error('\n❌ Failed to setup environment files.');
    console.error('Please run "node OSC-Backend/setup-env.js" manually.\n');
    throw error;
  }
}

// Instalar dependencias en todos los servicios en secuencia
async function installAll() {
  console.log('📦 Installing dependencies in all services...\n');
  
  for (const service of services) {
    const servicePath = path.join(backendPath, service);
    if (fs.existsSync(path.join(servicePath, 'package.json'))) {
      await runCommand('npm install', servicePath, service);
    }
  }
  
  console.log('\n✅ All dependencies installed successfully!\n');
}

// Iniciar todos los servicios en paralelo
function startAll() {
  console.log('🚀 Starting all backend services...\n');
  
  const startPromises = services.map(service => {
    const servicePath = path.join(backendPath, service);
    // Usamos 'npm run dev' que generalmente usa nodemon para desarrollo
    return runCommand('npm run dev', servicePath, service);
  });

  Promise.all(startPromises)
    .then(() => {
      console.log('\n✅ All backend services are running!');
      console.log('📍 Services available at:');
      console.log('   - API Gateway: http://localhost:3000');
      console.log('   - User Service: http://localhost:3001');
      console.log('   - Products Service: http://localhost:3002');
      console.log('   - Buy Service: http://localhost:3003');
      console.log('   - Court Service: http://localhost:3004');
      console.log('   - Match Service: http://localhost:3005\n');
    })
    .catch(error => {
      console.error('\n❌ Failed to start one or more services.', error);
      process.exit(1);
    });
}

// Ejecutar el flujo completo
async function main() {
  try {
    console.log('=' .repeat(60));
    console.log('  OSC Backend - Automated Startup');
    console.log('=' .repeat(60) + '\n');
    
    // Paso 1: Verificar y configurar archivos .env
    console.log('📋 Step 1/3: Checking environment configuration...');
    await setupEnvFiles();
    
    // Paso 2: Instalar dependencias
    console.log('📋 Step 2/3: Installing dependencies...');
    await installAll();
    
    // Paso 3: Iniciar servicios
    console.log('📋 Step 3/3: Starting services...');
    startAll();
    
  } catch (error) {
    console.error('\n❌ Failed to start backend:', error.message);
    console.error('\nPlease check the error above and try again.');
    console.error('For manual setup, run: node OSC-Backend/setup-env.js\n');
    process.exit(1);
  }
}

// Iniciar el proceso
main();
