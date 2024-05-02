import { UserServiceType } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";
import {
  generateToken,
  updateToken,
  removeToken,
  isAuthToken,
  tokenName,
  addUser,
  getUserByName,
  findUserByEmail,
  isUserAuthentic,
  getAccessDeniedResponse,
  expiredTokenCookie,
  userStore,
  prepareTokenCookie,
} from "../services/authServices.js";
import { isDevMode } from "../../app.js";

const userController = {
  signup: (req, res) => {
    const newUser = req.body.user;
    const { userName, password, confirmPassword, email } = newUser;

    if (!userName || password !== confirmPassword || !email) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    if (getUserByName(userName)) {
      return res
        .status(400)
        .json({ message: getTranslation("loginAlreadyExists", { userName }) });
    }

    addUser(newUser);
    res.status(201).json({
      userName,
      message: getTranslation("userHasBeenRegistered", { userName }),
    });
  },
  signin: async (req, res) => {
    const userName = req.body.userName;
    const password = req.body.password;

    if (!userName || !password) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    if (await isUserAuthentic({ userName, password })) {
      const token = generateToken({ userName });
      await updateToken({ userName, token });

      return res
        .cookie(...prepareTokenCookie({ token }))
        .status(200)
        .json({ userName });
    } else {
      return res
        .status(401)
        .json({ message: getTranslation("wrongCredentials") });
    }
  },
  signout: (req, res) => {
    const cookies = req.cookies;
    const token = cookies?.[tokenName];

    if (!isAuthToken(token)) {
      return getAccessDeniedResponse(res);
    }

    const userName = removeToken(token);
    res
      .cookie(...expiredTokenCookie())
      .status(200)
      .json({ message: getTranslation("userHasBeenSignedOut", { userName }) });
  },
  forget: (req, res) => {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: `${getTranslation("noUserExistsWithSuchEmail")}: "${email}"`,
      });
    }

    res.status(200).json({
      message: `${getTranslation(
        "furtherInstructionsHaveBeenSentToEmailAddress",
        { email }
      )}.${isDevMode ? ` (${getTranslation("itDoesNotWorkNow")})` : ""}`,
    });
  },
  init: (userService: UserServiceType) => {
    userStore.init(userService);
  },
};

export default userController;
