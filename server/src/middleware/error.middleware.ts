// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Use the status code from the error if it exists, otherwise default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error for debugging
  console.error("--- UNHANDLED ERROR ---");
  // If 'err' is not a standard Error object, stringify it
  console.error(err instanceof Error ? err.stack : JSON.stringify(err));
  console.error("-----------------------");

  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;