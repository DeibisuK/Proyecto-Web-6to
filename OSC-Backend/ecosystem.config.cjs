module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "src/server.js",
      cwd: "./micro-servicios/api-gateway",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "buy-service",
      script: "src/server.js",
      cwd: "./micro-servicios/buy-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "cloudinary-service",
      script: "src/server.js",
      cwd: "./micro-servicios/cloudinary-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "court-service",
      script: "src/server.js",
      cwd: "./micro-servicios/court-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "match-service",
      script: "src/server.js",
      cwd: "./micro-servicios/match-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "notification-service",
      script: "src/server.js",
      cwd: "./micro-servicios/notification-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "products-service",
      script: "src/server.js",
      cwd: "./micro-servicios/products-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "report-service",
      script: "src/server.js",
      cwd: "./micro-servicios/report-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "subscription-service",
      script: "src/server.js",
      cwd: "./micro-servicios/subscription-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "user-service",
      script: "src/server.js",
      cwd: "./micro-servicios/user-service",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
