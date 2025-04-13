import express, { NextFunction, Request, Response } from "express";
import AppError from "./utils/errorFactory";
import globalErrorHandler from "./controllers/errorsController";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";

import apiRoutes from "./routes/apiRoutes";
import viewsRoutes from "./routes/viewsRoutes";

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//CORS configuration
app.use(cors());
//
const allowSpecificIPs = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.clientIp);
  next();
};
// Limit requests
app.use(requestIp.mw());
const limiter = rateLimit({
  max: 60,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
  keyGenerator: (req, res) => {
    return req.clientIp || "unknown";
  },
});
app.use("/api", limiter);

// Development logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
// ROUTES
app.use("/api/v1", allowSpecificIPs, apiRoutes);
app.use("/", viewsRoutes);
// Catch all other routes
app.all("/{*splat}", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
