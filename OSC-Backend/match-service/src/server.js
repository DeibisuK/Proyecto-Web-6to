import app from './app.js';

const PORT = process.env.MATCH_SERVICE_PORT || 3005;

app.listen(PORT, () => {
  console.log(`Match service is running on http://localhost:${PORT}`);
});
