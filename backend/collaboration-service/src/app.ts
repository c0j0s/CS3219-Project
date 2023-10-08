import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import cors, { corsOptions } from "./middleware/cors";
import { SocketEvent } from "./lib/enums/SocketEvent";
import { SocketHandler } from "./controllers";
import { Redis } from 'ioredis';

dotenv.config();

const app: Express = express();
const http = require('http');
const { Server } = require("socket.io");

app.use(cors);

const server = http.createServer(app);

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




