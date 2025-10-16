const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'osc-backend');
const services = fs.readdirSync(backendPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== 'cloudinary-service')
  .map(dirent => dirent.name);

console.log(`\n🚀 osc backend Startup Script`);
console.log(`Found ${services.length} services: ${services.join(', ')}\n`);

// Función para ejecutar comando NO interactivo
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
        console.log(`✓ "${command}" in ${serviceName} completed successfully.`);
        resolve();
      } else {
        console.error(`✗ "${command}" in ${serviceName} failed with code ${code}.`);
        reject(new Error(`Failed to run "${command}" in ${serviceName}`));
      }
    });
  });
}

// Función para ejecutar comando INTERACTIVO (para setup-env.js)
function runInteractiveCommand(command, cwd, serviceName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Running interactive setup for ${serviceName}...\n`);
    
    // Usar spawn con stdio: 'inherit' para permitir interacción directa
    const process = spawn(command, [], {
      cwd,
      stdio: 'inherit', // ← CLAVE: Heredar stdin/stdout/stderr del proceso padre
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✓ Interactive setup completed successfully.\n`);
        resolve();
      } else {
        console.error(`\n✗ Interactive setup failed with code ${code}.\n`);
        reject(new Error(`Failed to run interactive setup`));
      }
    });

    process.on('error', (error) => {
      console.error(`\n✗ Error running interactive setup:`, error.message);
      reject(error);
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
  console.log('🔧 Starting interactive environment setup...');
  console.log('💡 You will need to provide database credentials from DigitalOcean\n');

  try {
    // USAR runInteractiveCommand en lugar de runCommand
    await runInteractiveCommand('node setup-env.js', backendPath, 'env-setup');
    console.log('✅ Environment files configured successfully!\n');
  } catch (error) {
    console.error('\n❌ Failed to setup environment files.');
    console.error('Please run "node osc-backend/setup-env.js" manually.\n');
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
  
  services.forEach(service => {
    const servicePath = path.join(backendPath, service);
    const serviceProcess = exec('npm run dev', { cwd: servicePath });
    
    serviceProcess.stdout.on('data', (data) => {
      console.log(`[${service}] ${data.toString().trim()}`);
    });
    
    serviceProcess.stderr.on('data', (data) => {
      // Ignorar warnings de npm, solo mostrar errores reales
      const msg = data.toString().trim();
      if (!msg.includes('npm') && !msg.includes('warn')) {
        console.error(`[${service}-ERROR] ${msg}`);
      }
    });
    
    serviceProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ ${service} exited with code ${code}`);
      }
    });
  });

  console.log('\n✅ All backend services are running!');
  console.log('📍 Services available at:');
  console.log('   - API Gateway: http://localhost:3000');
  console.log('   - User Service: http://localhost:3001');
  console.log('   - Products Service: http://localhost:3002');
  console.log('   - Buy Service: http://localhost:3003');
  console.log('   - Court Service: http://localhost:3004');
  console.log('   - Match Service: http://localhost:3005');
  console.log('\n💡 To start the frontend, open a new terminal and run:');
  console.log('   cd osc-frontend && npm install && ng serve --open\n');
  console.log('⚠️  Press Ctrl+C to stop all services\n');
}

// Ejecutar el flujo completo
async function main() {
  try {
    console.log('═'.repeat(60));
    console.log('  osc backend - Automated Startup');
    console.log('═'.repeat(60) + '\n');
    
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
    console.error('For manual setup, run: node osc-backend/setup-env.js\n');
    process.exit(1);
  }
}

// Iniciar el proceso
main();