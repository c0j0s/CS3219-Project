import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import bodyParser from "body-parser";
import HttpStatusCode from "./common/HttpStatusCode";
import cors from "./middleware/cors";
import passport from "passport";
import cookieParser from "cookie-parser";

dotenv.config();
import "./config/passport";

const app: Express = express();

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());
app.use(cookieParser());

app.use(passport.initialize());

// implement routes for API endpoints
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use(`/auth/api`, router);

app.all("*", (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

app.listen(process.env.SERVICE_PORT, () => {
  console.log(`Server listens on port ${process.env.SERVICE_PORT} build[${NODE_ENV}] gateway[${process.env.GATEWAY}]`);
});
