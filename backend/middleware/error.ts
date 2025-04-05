import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";

// Optional: If you use a validation library, import the type
// Replace with the correct one you're using
import { ValidationError } from "joi"; // or any other library

export const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let _message = "";

  if (err.stack && err.stack.includes("MongoServer")) {
    const _err = err.message.split(" ");
    const type = _err[_err.indexOf("index:") + 1];
    const coll = _err.slice(1, _err.indexOf("collection:") - 1).join(" ");
    _message = `${coll} ${type}`;
  }

  const response: {
    code: number;
    message: string;
    errors?: any;
    stack?: any;
  } = {
    code: err.status || 500,
    message: _message || err.message || err.name,
    errors: err.errors,
    stack: err.stack,
  };

  delete response.stack;

  console.error(response.message);
  res.status(response.code).json(response);
};

export const ConvertError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let ConvertedError = err;

  if (err instanceof ValidationError) {
    const errors: any[] = [];
    const entries = Object.entries(err.details);
    for (let i = 0; i < entries.length; i++) {
      const [key, value]: [string, any] = entries[i];
      errors.push(
        ...value.map((e: any) => ({
          location: key,
          messages: e.message.replace(/[^\w\s]/gi, ""),
          field: e.path[0],
        }))
      );
    }

    ConvertedError = new APIError({
      message: "Validation Error",
      // status: err.statusCode || 400,
      status: 400,
      errors,
    });
  } else if (!(err instanceof APIError)) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      ConvertedError = new APIError({
        message: "Validation error",
        status: 400,
        errors: [
          {
            field,
            location: "body",
            messages: `This ${field} is already taken`,
          },
        ],
      });
    } else {
      ConvertedError = new APIError({
        message: err.message,
        status: err.status || 500,
        stack: err.stack,
      });
    }
  }

  return ErrorHandler(ConvertedError, req, res, next);
};

export const NotFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new APIError({
    message: "Resource Not Found",
    status: 404,
  });

  return ErrorHandler(err, req, res, next);
};

export const RateLimitHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new APIError({
    message: "Rate limit exceeded, please try again later.",
    status: 429,
  });

  return ErrorHandler(err, req, res, next);
};
