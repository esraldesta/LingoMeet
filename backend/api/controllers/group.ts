import { Request, Response, NextFunction } from "express";
import { Create, GetAll, DeleteOne } from "../services/group";
import { OK, CREATED } from "../../utils/constants";
import { GroupRequestBody } from "../validations/group";

export const create = async (
  req: Request<{}, {}, GroupRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body, "req.body");
    const response = await Create(req.body);
    res.status(CREATED).json({
      data: response,
      success: "SUCCESS",
    });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await GetAll(req);
    res.status(OK).json({
      data: response,
      success: "SUCCESS",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
