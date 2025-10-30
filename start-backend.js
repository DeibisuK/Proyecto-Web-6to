const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// New layout: services live inside OSC-Backend/micro-servicios
const oscBackendRoot = path.join(__dirname, 'OSC-Backend');
const servicesRoot = path.join(oscBackendRoot, 'micro-servicios');

let services = [];
if (fs.existsSync(servicesRoot)) {
  services = fs.readdirSync(servicesRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
} else if (fs.existsSync(oscBackendRoot)) {
  // Fallback for older layout where services were directly under OSC-Backend
  services = fs.readdirSync(oscBackendRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
    .map(dirent => dirent.name);
}

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
    // Use spawn with shell so node scripts behave correctly across platforms
    const process = spawn(command, [], {
      cwd,
      stdio: 'inherit', // inherit for interactive input
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
    const servicePath = fs.existsSync(servicesRoot) ? path.join(servicesRoot, service) : path.join(oscBackendRoot, service);
    const envPath = path.join(servicePath, '.env');
    const envExamplePath = path.join(servicePath, '.env.example');

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
    await runInteractiveCommand('node setup-env.js', oscBackendRoot, 'env-setup');
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
    const servicePath = fs.existsSync(servicesRoot) ? path.join(servicesRoot, service) : path.join(oscBackendRoot, service);
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
    const servicePath = fs.existsSync(servicesRoot) ? path.join(servicesRoot, service) : path.join(oscBackendRoot, service);

    // pick start command intelligently
    let commandParts = null;
    const pkgPath = path.join(servicePath, 'package.json');
    try {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.scripts && pkg.scripts.dev) commandParts = ['npm', 'run', 'dev'];
        else if (pkg.scripts && pkg.scripts.start) commandParts = ['npm', 'start'];
      }
    } catch (e) {
      console.error(`[${service}-ERROR] Failed to read package.json: ${e.message}`);
    }

    if (!commandParts) {
      if (fs.existsSync(path.join(servicePath, 'src', 'server.js'))) commandParts = ['node', 'src/server.js'];
      else if (fs.existsSync(path.join(servicePath, 'server.js'))) commandParts = ['node', 'server.js'];
    }

    if (!commandParts) {
      console.log(`- Skipping ${service}: no start script or server file found.`);
      return;
    }

    const child = spawn(commandParts[0], commandParts.slice(1), { cwd: servicePath, shell: true });

    child.stdout.on('data', (data) => {
      console.log(`[${service}] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (!msg.toLowerCase().includes('warn')) {
        console.error(`[${service}-ERROR] ${msg}`);
      }
    });

    child.on('close', (code) => {
      if (code !== 0) console.error(`\n❌ ${service} exited with code ${code}`);
    });
  });

  console.log('\n✅ All backend services are running!');
  console.log('📍 Services started (ports depend on each service .env/config). Started services:');
  console.log(`   - ${services.join('\n   - ')}`);
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