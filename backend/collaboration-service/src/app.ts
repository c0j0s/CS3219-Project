import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket, Server } from "socket.io";
import cors, { corsOptions } from "./middleware/cors";
import { SocketEvent } from "./lib/enums/SocketEvent";
import { SocketHandler, PubSubHandler } from "./controllers";
import { createServer } from "http";
import logger from './lib/utils/logger'; 
import pinoHttp from "pino-http";
import { eventBus } from "./models/event_bus";

dotenv.config();

const app = express();
const expressLogger = pinoHttp({ logger });

const channel = 'matching-collaboration'

eventBus.subscribe(channel, (err) => {
  if (err) {
    logger.error(`Error subscribing to ${channel}: ${err}`)
    // Should exit because the service will not work properly
    process.exit(0);
  }
  logger.info(`Subscribed to ${channel} channel successfully.`)
})

eventBus.on("message", (channel, message) => {
  PubSubHandler.handleRedisMessage(channel, message);
})

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
    path: '/socket/collaboration/',
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


