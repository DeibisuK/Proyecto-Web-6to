import app from './app.js';

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Court service is running on http://localhost:${PORT}`);
});
