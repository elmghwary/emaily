// errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppErrorInterface } from "../utils/errorFactory";

const sendError = (err: AppErrorInterface, req: Request, res: Response) => {
  // API Error Response
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Log error for non-API routes
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const globalErrorHandler = (
  err: AppErrorInterface,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  sendError(err, req, res);
  // if (process.env.NODE_ENV === "development") {
  // } else {
  //   res.status(err.statusCode).json({
  //     status: err.status,
  //     message: err.message,
  //   });
  // }
};

export default globalErrorHandler;
