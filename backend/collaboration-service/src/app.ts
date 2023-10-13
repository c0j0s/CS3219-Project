import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket, Server } from "socket.io";
import cors, { corsOptions } from "./middleware/cors";
import { SocketEvent } from "./lib/enums/SocketEvent";
import { SocketHandler } from "./controllers";
import { createServer } from "http";
import logger from './lib/utils/logger'; 
import pinoHttp from "pino-http";

dotenv.config();

const app = express();
const expressLogger = pinoHttp({ logger });

app.use(expressLogger)

app.use(cors);
app.use(expressLogger);

/**
 * To close the HTTP and Socket.IO server
 * Helps reduce active listeners in running in processes.
 */
async function closeServer() {
  try {

    io.close();
    logger.info('Socket.IO server closed.');

    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP server closed.');
        resolve();
      });
    });
  } catch (error) {
    logger.error('Error while closing the server:', error);
  }
}

const server = createServer(app);

const io = new Server(server, {
    cors: corsOptions,
    path: '/socket/collaboration/'
})

io.on(SocketEvent.CONNECTION, (socket: Socket) => {
    SocketHandler(socket);
})

server.listen(process.env.SERVICE_PORT, () => {
  logger.info(`Server running on port ${process.env.SERVICE_PORT}`);
});

process.on('SIGINT', async () => {
  await closeServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeServer();
  process.exit(0);
});

export { io };


