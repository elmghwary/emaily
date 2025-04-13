import { RequestHandler, Request, Response, NextFunction } from "express";

type AsyncRequestHandler<T = void> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

const asyncHandler = <T>(fn: AsyncRequestHandler<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
