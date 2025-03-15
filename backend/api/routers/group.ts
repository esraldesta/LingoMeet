import express from "express";
import { validate } from "express-validation";
import { getAll, create } from "../controllers/group";
import { createGroup } from "../validations/group";
const multer = require("multer");

const upload = multer();

const router = express.Router();

router.route("/").get(getAll).post(
  upload.none(),
  // (req, res, next) => {
  //   console.log(req.body);
  //   next();
  // }

  validate(createGroup, {}, {}),
  create
);

export default router;
