import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import bodyParser from "body-parser";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import cors from "./middleware/cors";
import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app: Express = express();

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());

// implement routes for API endpoints
const NODE_ENV = process.env.NODE_ENV || "development";
app.use(`/${NODE_ENV}/history/api`, authMiddleware, router);

app.all("*", (_: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

app.listen(process.env.SERVICE_PORT, () => {
  console.log(
    `Server listens on port ${process.env.SERVICE_PORT} running in ${NODE_ENV} environment`
  );
});
