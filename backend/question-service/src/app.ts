import express, { Express, Request, Response } from "express";
import router from "./routes";
import bodyParser from "body-parser";
import cors from "./middleware/cors";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

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

app.listen(process.env.SERVICE_PORT, () => {
  console.log(`Server running on port ${process.env.SERVICE_PORT}`);
});
