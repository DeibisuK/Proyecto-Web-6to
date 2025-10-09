import app from './app.js';

const PORT = process.env.USER_SERVICE_PORT || 3001;

app.listen(PORT, () => {
  console.log(`User service is running on http://localhost:${PORT}`);
});
