import app from './app.js';

const PORT = process.env.ROL_SERVICE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`Role service is running on http://localhost:${PORT}`);
});
