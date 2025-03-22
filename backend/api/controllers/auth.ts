import { Request, Response, NextFunction } from "express";
import { OK, CREATED } from "../../utils/constants";
import { SignUpGoogleDTO } from "../../types/auth";
import { sign_in_up_google } from "../services/auth";

export const create = async (
  req: Request<{}, {}, SignUpGoogleDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await sign_in_up_google(req.body);
    res.status(CREATED).json({
      values: response,
      errors: {},
      success: "SUCCESS",
    });
  } catch (err) {
    next(err);
  }
};
