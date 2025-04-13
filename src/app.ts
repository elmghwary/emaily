import express, { NextFunction, Request, Response } from "express";
import apiRoutes from "./routes/apiRoutes";
import bodyParser from "body-parser";
import AppError from "./utils/errorFactory";
import globalErrorHandler from "./controllers/errorsController";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//CORS configuration
app.use(cors());
app.options("/{*splat}", cors());
const allowCrossDomain = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
app.use(allowCrossDomain);

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
  validate: {
    ip: false,
    xForwardedForHeader: false,
  },
});
app.use("/api", limiter);

// Development logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
// ROUTES
app.use("/api/v1", apiRoutes);
// Catch all other routes
app.all("/{*splat}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
