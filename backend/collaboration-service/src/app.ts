import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import cors, { corsOptions } from "./middleware/cors";
import { SocketEvent } from "./lib/enums/SocketEvent";
import { SocketHandler } from "./controllers";
import expressPino from 'express-pino-logger';
import { createServer } from "http";
import { Server } from "socket.io";
import logger from './lib/utils/logger'; 

dotenv.config();

const app = express();
const expressLogger = expressPino({ logger });

app.use(expressLogger)

app.use(cors);

const server = createServer(app);

const io = new Server(server, {
    cors: corsOptions,
    path: '/socket/collaboration/'
})

io.on(SocketEvent.CONNECTION, (socket: Socket) => {
    SocketHandler(socket);
})

server.listen(process.env.SERVICE_PORT, () => {
  console.log(`Server running on port ${process.env.SERVICE_PORT}`);
});

export { io };



