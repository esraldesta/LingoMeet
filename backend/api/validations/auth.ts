import { body, ContextRunner } from "express-validator";

export const GoogleSignInUP: ContextRunner[] = [
  body("credential")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Bad request!"),
  body("clientId").isString().isLength({ min: 3 }).withMessage("Bad request!"),
];
