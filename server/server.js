process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION !! server closing down');
  console.log(err.name);
  console.log(`ERROR : ${err.message}`);
  process.exit(1);
});

const app = require('./app');
const dotenv = require('dotenv');
const { connectDatabase } = require('./src/config/DatabaseConnection');

dotenv.config({ path: './.env' });

connectDatabase();

const PORT = process.env.PORT || 1337;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection !! server closing down');
  console.log(err.name);
  console.log(`ERROR :${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
