import express, { Express, Request, Response } from "express";
import router from "./routes";
import bodyParser from "body-parser";
import cors from "./middleware/cors";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import PinoHttp from "pino-http";
import logger from "./lib/utils/logger";
import { authMiddleware } from "./middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const expressLogger = PinoHttp({ logger });

app.use(expressLogger);

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());

// implement routes for API endpoints
const NODE_ENV = process.env.NODE_ENV || "development";
app.use(`/${NODE_ENV}/question/api`, authMiddleware, router);

app.all("*", (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

const PORT = process.env.SERVICE_PORT || 5100;
const LOG_LEVEL = process.env.LOG_LEVEL || "debug";

app.listen(PORT, () => {
  logger.info(
    `Server running at port[${PORT}] build[${NODE_ENV}] log[${LOG_LEVEL}]`
  );
});
