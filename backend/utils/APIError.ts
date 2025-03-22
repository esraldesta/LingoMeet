import { INTERNAL_SERVER_ERROR } from "./constants";

export default class APIError extends Error {
  public errors: any[];
  public status: number;

  constructor({
    message,
    stack,
    errors = [],
    status = INTERNAL_SERVER_ERROR,
  }: {
    message: string;
    stack?: string;
    errors?: any[];
    status?: number;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.stack = stack;
  }
}
export class APIPrivateError extends Error {
  public errors: any[];
  public status: number;

  constructor({
    message,
    stack,
    errors = [],
    status = INTERNAL_SERVER_ERROR,
  }: {
    message: string;
    stack: string;
    errors: any[];
    status: number;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.stack = stack;
  }
}
