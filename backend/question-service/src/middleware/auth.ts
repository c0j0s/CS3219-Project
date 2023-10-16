import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../lib/enums/HttpStatusCode";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.url === "/health") {
    next();
    return;
  }

  // Only allow GET requests to /api/questions to pass through with just user rights
  const authEndpoint =
    req.method === "GET"
      ? process.env.AUTH_ENDPOINT || "http://localhost:5050/api/auth/validate"
      : process.env.AUTH_ADMIN_ENDPOINT ||
        "http://localhost:5050/api/auth/validateAdmin";

  const authRes = await fetch(authEndpoint, {
    method: "POST",
    headers: {
      ...(req.headers as HeadersInit), // Pass headers from the incoming request
      "content-length": "0", // Override content-length to 0
    },
  });

  if (authRes.status === HttpStatusCode.OK) {
    next();
  }

  if (authRes.status === HttpStatusCode.UNAUTHORIZED) {
    const message = await authRes.text();
    res.status(authRes.status).json({
      error: message,
      message,
    });
    return;
  }

  if (authRes.status === HttpStatusCode.FORBIDDEN) {
    const message = await authRes.json();
    res.status(authRes.status).json(message);
    return;
  }
};
