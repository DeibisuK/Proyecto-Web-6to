const app = require('./app');
require('dotenv').config();

const PORT = process.env.USER_SERVICE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`User service is running on http://localhost:${PORT}`);
});
