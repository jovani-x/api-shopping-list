import type { Request, Response } from "express";
import {
  generateToken,
  decodeToken,
  isAuthToken,
  ACCESS_TOKEN_NAME,
  addUser,
  getUserByName,
  findUserByEmail,
  isUserAuthentic,
  getAccessDeniedResponse,
  expiredTokenCookie,
  prepareTokenCookie,
} from "@/services/authServices.js";
import { isDevMode } from "@/../app.js";
import { t } from "i18next";

const userController = {
  signup: async (req: Request, res: Response) => {
    const newUser = req.body.user;
    const { userName, password, confirmPassword, email } = newUser;

    if (!userName || password !== confirmPassword || !email) {
      return res.status(400).json({ message: t("wrongData") });
    }

    const user = await getUserByName(userName);

    if (user) {
      return res
        .status(400)
        .json({ message: t("loginAlreadyExists", { userName }) });
    }

    try {
      const userName = await addUser(newUser);
      res.status(201).json({
        userName,
        message: t("userHasBeenRegistered", { userName }),
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  signin: async (req: Request, res: Response) => {
    const userName = req.body.userName;
    const password = req.body.password;

    if (!userName || !password) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const isAuthUser = await isUserAuthentic({ userName, password });

      if (!isAuthUser) {
        return res.status(401).json({ message: t("wrongCredentials") });
      }

      const user = await getUserByName(userName);

      if (!user?.id) {
        return res.status(400).json({ message: t("wrongData") });
      }

      const token = generateToken({ userName, userId: user.id });
      return res
        .cookie(...prepareTokenCookie({ token }))
        .status(200)
        .json({ userName });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  signout: async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const token = cookies?.[ACCESS_TOKEN_NAME];

    try {
      if (!(await isAuthToken(token))) {
        return getAccessDeniedResponse(res);
      }

      const userName = await decodeToken(token);
      return res
        .cookie(...expiredTokenCookie())
        .status(200)
        .json({
          message: t("userHasBeenSignedOut", { userName }),
        });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  forget: async (req: Request, res: Response) => {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          message: `${t("noUserExistsWithSuchEmail")}: "${email}"`,
        });
      }

      return res.status(200).json({
        message: `${t("furtherInstructionsHaveBeenSentToEmailAddress", {
          email,
        })}.${isDevMode ? ` (${t("itDoesNotWorkNow")})` : ""}`,
      });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
};

export default userController;
