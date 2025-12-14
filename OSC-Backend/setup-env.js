// Script de configuración automática de variables de entorno
// OSC Backend - Microservices Setup

import fs from "fs";
import path from "path";
import readline from "readline";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname as _dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colores para consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

console.log(
  `${colors.blue}🚀 Configuración de Variables de Entorno - osc backend${colors.reset}`
);
console.log(
  `${colors.yellow}📝 Nuevo formato: .env raíz + .env específicos por servicio${colors.reset}`
);
console.log("=".repeat(60));
console.log("");

const services = [
  {
    folder: "api-gateway",
    name: "API Gateway",
    port: 3000,
    portVar: "PORT",
    hasDB: false,
    isGateway: true, // Marca especial para API Gateway
  },
  {
    folder: "user-service",
    name: "User Service",
    port: 3001,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "products-service",
    name: "Products Service",
    port: 3002,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "buy-service",
    name: "Buy Service",
    port: 3003,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "court-service",
    name: "Court Service",
    port: 3004,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "match-service",
    name: "Match Service",
    port: 3005,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "cloudinary-service",
    name: "Cloudinary Service",
    port: 3006,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "subscription-service",
    name: "Subscription Service",
    port: 3007,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "notification-service",
    name: "Notification Service",
    port: 3008,
    portVar: "PORT",
    hasDB: true,
  },
  {
    folder: "report-service",
    name: "Report Service",
    port: 3009,
    portVar: "PORT",
    hasDB: true,
  },
];

const config = {
  DB_HOST: "",
  DB_PORT: "25060",
  DB_USER: "doadmin",
  DB_PASSWORD: "",
  DB_NAME: "bd_orosports",
};

// Additional service credentials
const extra = {
  GOOGLE_APPLICATION_CREDENTIALS: "",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_API_SECRET: "",
};

function question(prompt, defaultValue = "") {
  return new Promise((resolve) => {
    const displayPrompt = defaultValue
      ? `${prompt} [${defaultValue}]: `
      : `${prompt}: `;

    rl.question(displayPrompt, (answer) => {
      // SUPER LIMPIEZA: Remover TODO tipo de espacios y saltos de línea
      let cleaned = answer || defaultValue;

      // Remover saltos de línea, retornos de carro, tabs, etc.
      cleaned = cleaned.replace(/[\r\n\t]/g, "");

      // Remover espacios al inicio y final
      cleaned = cleaned.trim();

      // Si después de limpiar está vacío, usar default
      if (!cleaned && defaultValue) {
        cleaned = defaultValue;
      }

      console.log(
        `${colors.yellow}[DEBUG] Valor recibido: "${cleaned}"${colors.reset}`
      );
      resolve(cleaned);
    });
  });
}

function questionPassword(prompt) {
  return new Promise((resolve) => {
    // USAR MÉTODO SIMPLE SIN RAW MODE (más compatible)
    rl.question(`${prompt}: `, (answer) => {
      // Limpiar password de caracteres extraños
      const cleaned = answer.replace(/[\r\n\t]/g, "").trim();
      console.log(
        `${colors.green}✓ Password recibido (${cleaned.length} caracteres)${colors.reset}`
      );
      resolve(cleaned);
    });
  });
}

function createRootEnvFile() {
  const rootEnvPath = path.join(__dirname, ".env");

  if (fs.existsSync(rootEnvPath)) {
    console.log(
      `${colors.yellow}⚠️  Ya existe .env raíz (se sobrescribirá)${colors.reset}`
    );
  }

  let envContent = `# Variables comunes para todos los microservicios
# Database configuration
DB_HOST=${config.DB_HOST}
DB_PORT=${config.DB_PORT}
DB_USER=${config.DB_USER}
DB_PASSWORD=${config.DB_PASSWORD}
DB_NAME=${config.DB_NAME}
`;

  // Agregar GOOGLE si se proporcionó
  if (extra.GOOGLE_APPLICATION_CREDENTIALS) {
    envContent += `\nGOOGLE_APPLICATION_CREDENTIALS=${extra.GOOGLE_APPLICATION_CREDENTIALS}\n`;
  }

  // Escribir archivo .env raíz
  fs.writeFileSync(rootEnvPath, envContent);
  console.log(
    `${colors.green}✓ .env raíz creado con variables comunes${colors.reset}`
  );

  return true;
}

function createEnvFile(service) {
  const servicePath = path.join(__dirname, "micro-servicios", service.folder);
  const examplePath = path.join(servicePath, ".env.example");
  const envPath = path.join(servicePath, ".env");

  if (!fs.existsSync(examplePath)) {
    console.log(
      `${colors.yellow}⚠️  No se encontró .env.example en ${service.name}${colors.reset}`
    );
    return false;
  }

  if (fs.existsSync(envPath)) {
    console.log(
      `${colors.yellow}⚠️  ${service.name} ya tiene archivo .env (se sobrescribirá)${colors.reset}`
    );
  }

  // Leer el archivo .env.example
  let envContent = fs.readFileSync(examplePath, "utf8");

  // Reemplazar valores según el servicio
  // Reemplazar PORT
  const portRegex = /^PORT=.*/m;
  if (portRegex.test(envContent)) {
    envContent = envContent.replace(portRegex, `PORT=${service.port}`);
  } else {
    // Si no existe, añadir al inicio
    envContent = `PORT=${service.port}\n` + envContent;
  }

  // Si es API Gateway, las URLs ya están en .env.example con localhost, no necesitamos cambiar

  // Reemplazar claves de Cloudinary si se proporcionaron y es cloudinary-service
  if (service.folder === "cloudinary-service") {
    if (extra.CLOUDINARY_CLOUD_NAME) {
      envContent = envContent.replace(
        /CLOUDINARY_CLOUD_NAME=.*/,
        `CLOUDINARY_CLOUD_NAME=${extra.CLOUDINARY_CLOUD_NAME}`
      );
    }
    if (extra.CLOUDINARY_API_KEY) {
      envContent = envContent.replace(
        /CLOUDINARY_API_KEY=.*/,
        `CLOUDINARY_API_KEY=${extra.CLOUDINARY_API_KEY}`
      );
    }
    if (extra.CLOUDINARY_API_SECRET) {
      envContent = envContent.replace(
        /CLOUDINARY_API_SECRET=.*/,
        `CLOUDINARY_API_SECRET=${extra.CLOUDINARY_API_SECRET}`
      );
    }
  }

  // Escribir archivo .env
  fs.writeFileSync(envPath, envContent);
  console.log(`${colors.green}✓ ${service.name} configurado${colors.reset}`);

  return true;
}

async function setup() {
  try {
    console.log(
      `${colors.blue}📝 Configuración de Base de Datos PostgreSQL (DigitalOcean)${colors.reset}`
    );
    console.log(
      `${colors.yellow}💡 Tip: Copia y pega los valores desde tu panel de DigitalOcean${colors.reset}`
    );
    console.log(
      `${colors.yellow}💡 Presiona ENTER después de pegar cada valor${colors.reset}`
    );
    console.log("");

    // DB_HOST con validación
    let attempts = 0;
    while (!config.DB_HOST && attempts < 5) {
      attempts++;
      config.DB_HOST = await question(
        "DB_HOST (ej: db-postgresql-xxx.ondigitalocean.com)"
      );

      if (!config.DB_HOST) {
        console.log(
          `${colors.red}❌ DB_HOST no puede estar vacío. Intento ${attempts}/5${colors.reset}`
        );
      }
    }

    if (!config.DB_HOST) {
      throw new Error("No se pudo configurar DB_HOST después de 5 intentos");
    }
    console.log(
      `${colors.green}✓ DB_HOST configurado: ${config.DB_HOST}${colors.reset}\n`
    );

    // DB_PORT
    config.DB_PORT = await question("DB_PORT", "25060");
    console.log(
      `${colors.green}✓ DB_PORT configurado: ${config.DB_PORT}${colors.reset}\n`
    );

    // DB_USER con validación
    attempts = 0;
    while (!config.DB_USER && attempts < 5) {
      attempts++;
      config.DB_USER = await question("DB_USER (ej: doadmin)");

      if (!config.DB_USER) {
        console.log(
          `${colors.red}❌ DB_USER no puede estar vacío. Intento ${attempts}/5${colors.reset}`
        );
      }
    }

    if (!config.DB_USER) {
      throw new Error("No se pudo configurar DB_USER después de 5 intentos");
    }
    console.log(
      `${colors.green}✓ DB_USER configurado: ${config.DB_USER}${colors.reset}\n`
    );

    // DB_PASSWORD con validación
    attempts = 0;
    while (!config.DB_PASSWORD && attempts < 5) {
      attempts++;
      config.DB_PASSWORD = await questionPassword("DB_PASSWORD");

      if (!config.DB_PASSWORD) {
        console.log(
          `${colors.red}❌ DB_PASSWORD no puede estar vacío. Intento ${attempts}/5${colors.reset}`
        );
      }
    }

    if (!config.DB_PASSWORD) {
      throw new Error(
        "No se pudo configurar DB_PASSWORD después de 5 intentos"
      );
    }
    console.log(
      `${colors.green}✓ DB_PASSWORD configurado (${config.DB_PASSWORD.length} caracteres)${colors.reset}\n`
    );

    // DB_NAME con validación
    attempts = 0;
    while (!config.DB_NAME && attempts < 5) {
      attempts++;
      config.DB_NAME = await question("DB_NAME (ej: bd_orosports)");

      if (!config.DB_NAME) {
        console.log(
          `${colors.red}❌ DB_NAME no puede estar vacío. Intento ${attempts}/5${colors.reset}`
        );
      }
    }

    if (!config.DB_NAME) {
      throw new Error("No se pudo configurar DB_NAME después de 5 intentos");
    }
    console.log(
      `${colors.green}✓ DB_NAME configurado: ${config.DB_NAME}${colors.reset}\n`
    );

    // Preguntar por credenciales opcionales
    extra.GOOGLE_APPLICATION_CREDENTIALS = await question(
      "GOOGLE_APPLICATION_CREDENTIALS (ruta a JSON, opcional)",
      ""
    );
    extra.CLOUDINARY_CLOUD_NAME = await question(
      "CLOUDINARY_CLOUD_NAME (opcional)",
      ""
    );
    extra.CLOUDINARY_API_KEY = await question(
      "CLOUDINARY_API_KEY (opcional)",
      ""
    );
    extra.CLOUDINARY_API_SECRET = await question(
      "CLOUDINARY_API_SECRET (opcional)",
      ""
    );

    console.log("");

    console.log(`${colors.blue}📦 Creando archivos .env...${colors.reset}`);
    console.log("");

    // Crear .env raíz primero
    createRootEnvFile();

    console.log("");

    // Crear .env para cada servicio
    for (const service of services) {
      const servicePath = path.join(
        __dirname,
        "micro-servicios",
        service.folder
      );

      if (fs.existsSync(servicePath)) {
        createEnvFile(service);
      } else {
        console.log(
          `${colors.yellow}⚠️  Directorio ${service.folder} no encontrado${colors.reset}`
        );
      }
    }

    console.log("");
    console.log(`${colors.green}✅ Configuración completada!${colors.reset}`);
    console.log("");

    // Mostrar resumen de configuración (sin password)
    console.log(`${colors.blue}📋 Resumen de configuración:${colors.reset}`);
    console.log(`   DB_HOST: ${config.DB_HOST}`);
    console.log(`   DB_PORT: ${config.DB_PORT}`);
    console.log(`   DB_USER: ${config.DB_USER}`);
    console.log(
      `   DB_PASSWORD: ${"*".repeat(Math.min(config.DB_PASSWORD.length, 20))}`
    );
    console.log(`   DB_NAME: ${config.DB_NAME}`);
    if (extra.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(
        `   GOOGLE_APPLICATION_CREDENTIALS: ${extra.GOOGLE_APPLICATION_CREDENTIALS}`
      );
    }
    console.log("");

    console.log(`${colors.blue}📌 Archivos .env creados:${colors.reset}`);
    console.log(`   ✓ .env (raíz - variables comunes)`);
    for (const service of services) {
      const servicePath = path.join(
        __dirname,
        "micro-servicios",
        service.folder
      );
      if (fs.existsSync(servicePath)) {
        console.log(`   ✓ ${service.folder}/.env`);
      }
    }
    console.log("");
    console.log(`${colors.blue}📌 Próximos pasos:${colors.reset}`);
    console.log("   1. Revisa los archivos .env generados");
    console.log("   2. Verifica que las credenciales sean correctas");
    console.log(
      "   3. NUNCA subas los archivos .env a GitHub (ya están en .gitignore)"
    );
    console.log("   4. Inicia los servicios con: npm start");
    console.log("");
    console.log(`${colors.yellow}⚠️  IMPORTANTE:${colors.reset}`);
    console.log("   • Los archivos .env contienen información sensible");
    console.log("   • Comparte las credenciales solo por canales seguros");
    console.log(
      "   • Los archivos .env.example SÍ están en GitHub (sin datos reales)"
    );
    console.log("");
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    console.log(
      `${colors.yellow}\n💡 Sugerencia: Verifica que estés pegando correctamente los valores${colors.reset}`
    );
    rl.close();
    process.exit(1);
  }

  // Cerrar readline solo al final exitoso
  rl.close();
  process.exit(0);
}

setup();
