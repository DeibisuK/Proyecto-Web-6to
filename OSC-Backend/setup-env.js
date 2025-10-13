// Script de configuración automática de variables de entorno
// OSC Backend - Microservices Setup

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

console.log(`${colors.blue}🚀 Configuración de Variables de Entorno - OSC Backend${colors.reset}`);
console.log('='.repeat(60));
console.log('');

const services = [
    { folder: 'api-gateway', name: 'API Gateway', port: 3000, portVar: 'PORT', hasDB: false },
    { folder: 'user-service', name: 'User Service', port: 3001, portVar: 'USER_SERVICE_PORT', hasDB: true },
    { folder: 'products-service', name: 'Products Service', port: 3002, portVar: 'USER_SERVICE_PORT', hasDB: true },
    { folder: 'buy-service', name: 'Buy Service', port: 3003, portVar: 'USER_SERVICE_PORT', hasDB: true },
    { folder: 'court-service', name: 'Court Service', port: 3004, portVar: 'USER_SERVICE_PORT', hasDB: true },
    { folder: 'match-service', name: 'Match Service', port: 3005, portVar: 'USER_SERVICE_PORT', hasDB: true }
];

const config = {
    DB_HOST: '',
    DB_PORT: '25060',
    DB_USER: '',
    DB_PASSWORD: '',
    DB_NAME: ''
};

function question(prompt, defaultValue = '') {
    return new Promise((resolve) => {
        const displayPrompt = defaultValue 
            ? `${prompt} (${defaultValue}): `
            : `${prompt}: `;
        
        rl.question(displayPrompt, (answer) => {
            // Limpiar la respuesta de espacios en blanco y caracteres invisibles
            const cleanAnswer = answer.trim();
            resolve(cleanAnswer || defaultValue);
        });
    });
}

function questionPassword(prompt) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        
        stdout.write(`${prompt}: `);
        
        // Intentar usar modo raw, pero con fallback si falla
        let rawModeEnabled = false;
        try {
            stdin.setRawMode(true);
            rawModeEnabled = true;
        } catch (err) {
            // Si falla raw mode, usar el método normal
            console.log(`${colors.yellow}(Usando modo de entrada estándar)${colors.reset}`);
        }
        
        stdin.resume();
        stdin.setEncoding('utf8');
        
        let password = '';
        
        const onData = function(char) {
            char = char.toString('utf8');
            
            // Manejar diferentes caracteres de fin de línea
            if (char === '\n' || char === '\r' || char === '\u0004') {
                if (rawModeEnabled) {
                    stdin.setRawMode(false);
                }
                stdin.pause();
                stdin.removeListener('data', onData);
                stdout.write('\n');
                resolve(password.trim());
                return;
            }
            
            // Ctrl+C para salir
            if (char === '\u0003') {
                if (rawModeEnabled) {
                    stdin.setRawMode(false);
                }
                stdout.write('\n');
                console.log(`${colors.yellow}\nConfiguración cancelada${colors.reset}`);
                process.exit(0);
            }
            
            // Backspace
            if (char === '\u007f' || char === '\b') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    if (rawModeEnabled) {
                        stdout.clearLine();
                        stdout.cursorTo(0);
                        stdout.write(`${prompt}: ${'*'.repeat(password.length)}`);
                    }
                }
                return;
            }
            
            // Agregar carácter a la contraseña
            password += char;
            if (rawModeEnabled) {
                stdout.write('*');
            }
        };
        
        stdin.on('data', onData);
    });
}

function createEnvFile(service) {
    const servicePath = path.join(__dirname, service.folder);
    const examplePath = path.join(servicePath, '.env.example');
    const envPath = path.join(servicePath, '.env');
    
    if (!fs.existsSync(examplePath)) {
        console.log(`${colors.yellow}⚠️  No se encontró .env.example en ${service.name}${colors.reset}`);
        return false;
    }
    
    if (fs.existsSync(envPath)) {
        console.log(`${colors.yellow}⚠️  ${service.name} ya tiene archivo .env (se sobrescribirá)${colors.reset}`);
    }
    
    // Leer el archivo .env.example
    let envContent = fs.readFileSync(examplePath, 'utf8');
    
    // Reemplazar valores según el servicio
    envContent = envContent.replace(new RegExp(`${service.portVar}=\\d+`), `${service.portVar}=${service.port}`);
    
    // Solo reemplazar configuración de BD si el servicio la necesita
    if (service.hasDB) {
        envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${config.DB_HOST}`);
        envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${config.DB_PORT}`);
        envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${config.DB_USER}`);
        envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${config.DB_PASSWORD}`);
        envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${config.DB_NAME}`);
    }
    
    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);
    console.log(`${colors.green}✓ ${service.name} configurado${colors.reset}`);
    
    return true;
}

async function setup() {
    try {
        console.log(`${colors.blue}📝 Configuración de Base de Datos PostgreSQL (DigitalOcean)${colors.reset}`);
        console.log(`${colors.yellow}💡 Tip: Copia estos valores desde tu panel de DigitalOcean${colors.reset}`);
        console.log(`${colors.yellow}💡 IMPORTANTE: Si pegas texto con saltos de línea, solo se tomará la primera línea${colors.reset}`);
        console.log('');
        
        // DB_HOST con validación
        while (!config.DB_HOST) {
            const input = await question('DB_HOST (ej: db-postgresql-...ondigitalocean.com)');
            // Limpia saltos de línea y espacios
            config.DB_HOST = input.trim().split('\n')[0].trim();
            
            if (!config.DB_HOST) {
                console.log(`${colors.red}❌ DB_HOST no puede estar vacío. Inténtalo de nuevo.${colors.reset}`);
            }
        }
        console.log(`${colors.green}✓ DB_HOST configurado${colors.reset}\n`);
        
        // DB_PORT
        const portInput = await question('DB_PORT', '25060');
        config.DB_PORT = portInput.trim().split('\n')[0].trim() || '25060';
        console.log(`${colors.green}✓ DB_PORT configurado: ${config.DB_PORT}${colors.reset}\n`);
        
        // DB_USER con validación
        while (!config.DB_USER) {
            const input = await question('DB_USER (ej: doadmin)');
            config.DB_USER = input.trim().split('\n')[0].trim();
            
            if (!config.DB_USER) {
                console.log(`${colors.red}❌ DB_USER no puede estar vacío. Inténtalo de nuevo.${colors.reset}`);
            }
        }
        console.log(`${colors.green}✓ DB_USER configurado${colors.reset}\n`);
        
        // DB_PASSWORD con validación
        while (!config.DB_PASSWORD) {
            const input = await questionPassword('DB_PASSWORD');
            config.DB_PASSWORD = input.trim().split('\n')[0].trim();
            
            if (!config.DB_PASSWORD) {
                console.log(`${colors.red}❌ DB_PASSWORD no puede estar vacío. Inténtalo de nuevo.${colors.reset}`);
            }
        }
        console.log(`${colors.green}✓ DB_PASSWORD configurado${colors.reset}\n`);
        
        // DB_NAME con validación
        while (!config.DB_NAME) {
            const input = await question('DB_NAME (ej: bd_orosports)');
            config.DB_NAME = input.trim().split('\n')[0].trim();
            
            if (!config.DB_NAME) {
                console.log(`${colors.red}❌ DB_NAME no puede estar vacío. Inténtalo de nuevo.${colors.reset}`);
            }
        }
        console.log(`${colors.green}✓ DB_NAME configurado${colors.reset}\n`);
        
        console.log('');
        console.log(`${colors.blue}📦 Creando archivos .env...${colors.reset}`);
        console.log('');
        
        // Crear .env para cada servicio
        for (const service of services) {
            const servicePath = path.join(__dirname, service.folder);
            
            if (fs.existsSync(servicePath)) {
                createEnvFile(service);
            } else {
                console.log(`${colors.yellow}⚠️  Directorio ${service.folder} no encontrado${colors.reset}`);
            }
        }
        
        console.log('');
        console.log(`${colors.green}✅ Configuración completada!${colors.reset}`);
        console.log('');
        
        // Mostrar resumen de configuración (sin password)
        console.log(`${colors.blue}📋 Resumen de configuración:${colors.reset}`);
        console.log(`   DB_HOST: ${config.DB_HOST}`);
        console.log(`   DB_PORT: ${config.DB_PORT}`);
        console.log(`   DB_USER: ${config.DB_USER}`);
        console.log(`   DB_PASSWORD: ${'*'.repeat(config.DB_PASSWORD.length)}`);
        console.log(`   DB_NAME: ${config.DB_NAME}`);
        console.log('');
        
        console.log(`${colors.blue}📌 Archivos .env creados:${colors.reset}`);
        for (const service of services) {
            console.log(`   ✓ ${service.folder}/.env`);
        }
        console.log('');
        console.log(`${colors.blue}📌 Próximos pasos:${colors.reset}`);
        console.log('   1. Revisa los archivos .env generados');
        console.log('   2. Verifica que las credenciales sean correctas');
        console.log('   3. NUNCA subas los archivos .env a GitHub (ya están en .gitignore)');
        console.log('   4. Los servicios se iniciarán automáticamente');
        console.log('');
        console.log(`${colors.yellow}⚠️  IMPORTANTE:${colors.reset}`);
        console.log('   • Los archivos .env contienen información sensible');
        console.log('   • Comparte las credenciales solo por canales seguros');
        console.log('   • Los archivos .env.example SÍ están en GitHub (sin datos reales)');
        console.log('');
        
    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    } finally {
        rl.close();
    }
}

setup();
