import express, { Express, Request, Response } from "express";
import router from "./routes";
import bodyParser from "body-parser";
import cors from "./middleware/cors";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import dotenv from "dotenv";
import PinoHttp from "pino-http";
import logger from "./lib/utils/logger";

dotenv.config();

const app = express();
const expressLogger = PinoHttp({ logger });

app.use(expressLogger);

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());

// implement routes for API endpoints
app.use("/api", router);

app.all("*", (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});


const PORT = process.env.SERVICE_PORT || 5100;
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

app.listen(PORT, () => {
  logger.info(`Question service running on port ${PORT} with log_level:${LOG_LEVEL}.`);
});
