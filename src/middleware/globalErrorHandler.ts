import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const globalHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  // known error — use its status code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // unknown error — 500
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return res.status(500).json({
    success: false,
    message,
  });
};

export default globalHandler;