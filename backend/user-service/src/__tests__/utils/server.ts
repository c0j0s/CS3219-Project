import express, { Request, Response } from "express";
import cors from "../../middleware/cors";
import bodyParser from "body-parser";
import router from "../../routes";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { authMiddleware } from "../../middleware/auth";

export function createIntegrationTestServer() {
  const app = express();

  // implement cors for CORS protection
  app.use(cors);

  // implement body-parser for parsing request body
  app.use(bodyParser.json());

  // implement routes for API endpoints with auth middleware
  app.use(`/user/api`, authMiddleware, router);

  app.all("*", (_: Request, res: Response) => {
    res.status(HttpStatusCode.NOT_FOUND).json({
      error: "NOT FOUND",
      message: "The requested resource could not be found.",
    });
  });

  return app;
}

export default function createUnitTestServer() {
  const app = express();

  // implement cors for CORS protection
  app.use(cors);

  // implement body-parser for parsing request body
  app.use(bodyParser.json());

  // implement routes for API endpoints
  app.use(`/user/api`, router);

  return app;
}
