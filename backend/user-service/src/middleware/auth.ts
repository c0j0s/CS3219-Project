import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../lib/enums/HttpStatusCode";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.bypass) {
    const serviceSecret = process.env.SERVICE_SECRET || "secret";
    // bypass auth for calls from auth service
    if (req.headers.bypass === serviceSecret) {
      next();
      return;
    }
  }

  if (req.url === "/health") {
    next();
    return;
  }

  const authEndpoint =
    process.env.AUTH_ENDPOINT || "http://localhost:5050/api/auth/validate";
  const authRes = await fetch(authEndpoint, {
    method: "POST",
    headers: {
      ...(req.headers as HeadersInit), // Pass headers from the incoming request
      "content-length": "0", // Override content-length to 0
    },
  });

  if (authRes.status !== HttpStatusCode.OK) {
    const message = await authRes.text();
    res.status(authRes.status).json({
      error: message,
      message,
    });
    return;
  }

  next();
};
