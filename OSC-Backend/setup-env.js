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
            ? `${prompt} [${defaultValue}]: `
            : `${prompt}: `;
        
        rl.question(displayPrompt, (answer) => {
            // SUPER LIMPIEZA: Remover TODO tipo de espacios y saltos de línea
            let cleaned = answer || defaultValue;
            
            // Remover saltos de línea, retornos de carro, tabs, etc.
            cleaned = cleaned.replace(/[\r\n\t]/g, '');
            
            // Remover espacios al inicio y final
            cleaned = cleaned.trim();
            
            // Si después de limpiar está vacío, usar default
            if (!cleaned && defaultValue) {
                cleaned = defaultValue;
            }
            
            console.log(`${colors.yellow}[DEBUG] Valor recibido: "${cleaned}"${colors.reset}`);
            resolve(cleaned);
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
                // Limpiar password de caracteres extraños
                const cleaned = password.replace(/[\r\n\t]/g, '').trim();
                resolve(cleaned);
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
            
            // Ignorar caracteres de control excepto los que queremos
            if (char.charCodeAt(0) < 32 && char !== '\n' && char !== '\r') {
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
        console.log(`${colors.yellow}💡 Tip: Copia y pega los valores desde tu panel de DigitalOcean${colors.reset}`);
        console.log(`${colors.yellow}💡 Presiona ENTER después de pegar cada valor${colors.reset}`);
        console.log('');
        
        // DB_HOST con validación
        let attempts = 0;
        while (!config.DB_HOST && attempts < 5) {
            attempts++;
            config.DB_HOST = await question('DB_HOST (ej: db-postgresql-xxx.ondigitalocean.com)');
            
            if (!config.DB_HOST) {
                console.log(`${colors.red}❌ DB_HOST no puede estar vacío. Intento ${attempts}/5${colors.reset}`);
            }
        }
        
        if (!config.DB_HOST) {
            throw new Error('No se pudo configurar DB_HOST después de 5 intentos');
        }
        console.log(`${colors.green}✓ DB_HOST configurado: ${config.DB_HOST}${colors.reset}\n`);
        
        // DB_PORT
        config.DB_PORT = await question('DB_PORT', '25060');
        console.log(`${colors.green}✓ DB_PORT configurado: ${config.DB_PORT}${colors.reset}\n`);
        
        // DB_USER con validación
        attempts = 0;
        while (!config.DB_USER && attempts < 5) {
            attempts++;
            config.DB_USER = await question('DB_USER (ej: doadmin)');
            
            if (!config.DB_USER) {
                console.log(`${colors.red}❌ DB_USER no puede estar vacío. Intento ${attempts}/5${colors.reset}`);
            }
        }
        
        if (!config.DB_USER) {
            throw new Error('No se pudo configurar DB_USER después de 5 intentos');
        }
        console.log(`${colors.green}✓ DB_USER configurado: ${config.DB_USER}${colors.reset}\n`);
        
        // DB_PASSWORD con validación
        attempts = 0;
        while (!config.DB_PASSWORD && attempts < 5) {
            attempts++;
            config.DB_PASSWORD = await questionPassword('DB_PASSWORD');
            
            if (!config.DB_PASSWORD) {
                console.log(`${colors.red}❌ DB_PASSWORD no puede estar vacío. Intento ${attempts}/5${colors.reset}`);
            }
        }
        
        if (!config.DB_PASSWORD) {
            throw new Error('No se pudo configurar DB_PASSWORD después de 5 intentos');
        }
        console.log(`${colors.green}✓ DB_PASSWORD configurado (${config.DB_PASSWORD.length} caracteres)${colors.reset}\n`);
        
        // DB_NAME con validación
        attempts = 0;
        while (!config.DB_NAME && attempts < 5) {
            attempts++;
            config.DB_NAME = await question('DB_NAME (ej: bd_orosports)');
            
            if (!config.DB_NAME) {
                console.log(`${colors.red}❌ DB_NAME no puede estar vacío. Intento ${attempts}/5${colors.reset}`);
            }
        }
        
        if (!config.DB_NAME) {
            throw new Error('No se pudo configurar DB_NAME después de 5 intentos');
        }
        console.log(`${colors.green}✓ DB_NAME configurado: ${config.DB_NAME}${colors.reset}\n`);
        
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
        console.log(`   DB_PASSWORD: ${'*'.repeat(Math.min(config.DB_PASSWORD.length, 20))}`);
        console.log(`   DB_NAME: ${config.DB_NAME}`);
        console.log('');
        
        console.log(`${colors.blue}📌 Archivos .env creados:${colors.reset}`);
        for (const service of services) {
            const servicePath = path.join(__dirname, service.folder);
            if (fs.existsSync(servicePath)) {
                console.log(`   ✓ ${service.folder}/.env`);
            }
        }
        console.log('');
        console.log(`${colors.blue}📌 Próximos pasos:${colors.reset}`);
        console.log('   1. Revisa los archivos .env generados');
        console.log('   2. Verifica que las credenciales sean correctas');
        console.log('   3. NUNCA subas los archivos .env a GitHub (ya están en .gitignore)');
        console.log('   4. Inicia los servicios con: npm start');
        console.log('');
        console.log(`${colors.yellow}⚠️  IMPORTANTE:${colors.reset}`);
        console.log('   • Los archivos .env contienen información sensible');
        console.log('   • Comparte las credenciales solo por canales seguros');
        console.log('   • Los archivos .env.example SÍ están en GitHub (sin datos reales)');
        console.log('');
        
    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}\n💡 Sugerencia: Verifica que estés pegando correctamente los valores${colors.reset}`);
    } finally {
        rl.close();
        process.exit(0);
    }
}

setup();