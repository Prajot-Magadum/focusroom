const http = require('http');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRouter = require('./routes/health');
const roomRoutes = require('./routes/roomRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/rooms', roomRoutes);

const io = initSocket(server);
app.set('io', io);

app.use(notFound);
app.use(errorHandler);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));