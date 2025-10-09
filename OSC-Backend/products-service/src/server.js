import app from './app.js';

const PORT = process.env.PRODUCTS_SERVICE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`Products service is running on http://localhost:${PORT}`);
});
