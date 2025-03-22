import express, { NextFunction, Request, Response } from "express";
import { GoogleSignInUP } from "../validations/auth";
import { OAuth2Client } from "google-auth-library";
import { validate } from "../../middleware/validation";
import { sign_in_up_google } from "../services/auth";

const multer = require("multer");

const upload = multer();

const router = express.Router();

const client = new OAuth2Client();
router
  .route("/google")
  .get((req: Request, res: Response) => {
    res.status(200).json({ message: "Hello" });
  })
  .post(
    validate(GoogleSignInUP),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { credential, clientId } = req.body;

        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        const payload = ticket.getPayload();

        if (!payload) {
          res.status(400).json({ error: "Bad request!" });
        }

        const { email, given_name, family_name } = payload!;

        req.body.userData = { email, given_name, family_name, clientId };

        next();
      } catch (err: any) {
        res.status(400).json({ error: err.message || "Google Auth Failed" });
      }
    },
    async (req: Request, res: Response) => {
      sign_in_up_google(req.body.userData);
    }
  );

export default router;
