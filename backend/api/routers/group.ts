import express from "express";
import { getAll, create } from "../controllers/group";
import { createGroup } from "../validations/group";
import { validate } from "../../middleware/validation";
const multer = require("multer");

const upload = multer();

const router = express.Router();

router
  .route("/")
  .get(getAll)
  .post(upload.none(), validate(createGroup), create);

export default router;
