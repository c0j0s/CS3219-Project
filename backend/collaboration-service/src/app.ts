import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import cors, { corsOptions } from "./middleware/cors";
import { SocketEvent } from "./lib/enums/SocketEvent";
import { SocketHandler } from "./controllers";
import { createServer } from "http";
import { Server } from "socket.io";
import logger from './lib/utils/logger'; 
import pinoHttp from "pino-http";


dotenv.config();

const app = express();
const expressLogger = pinoHttp({ logger });

app.use(cors);
app.use(expressLogger);

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

export { io };



