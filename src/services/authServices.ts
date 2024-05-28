import { sha256 } from "js-sha256";
import type { Request, Response, NextFunction, CookieOptions } from "express";
import { AuthUser, IUser } from "@/data/types.js";
import { getTranslation } from "@/lib/utils.js";
import { random } from "@lukeed/csprng";
import { User } from "@/models/User.js";

type CookieType = [string, string, CookieOptions];

const getJWTSecret = () => {
  return process.env.JWT_SECRET || "";
};

export const ACCESS_TOKEN_NAME = process.env.JWT_NAME || "authToken";

export const generateToken = ({
  userName,
  userId,
}: {
  userName: string;
  userId: string;
}): string => {
  const secret = getJWTSecret();
  const headers = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const user = btoa(JSON.stringify({ userName, userId }));
  const signature = sha256.hmac(secret, `${headers}.${user}`);
  return btoa(`${headers}.${user}.${signature}`);
};

export const decodeToken = (encodedToken: string | null): AuthUser => {
  try {
    if (!encodedToken) {
      return {
        userName: null,
        userId: null,
        accessToken: null,
      };
    }

    return {
      ...JSON.parse(atob(atob(encodedToken).split(".")[1])),
      accessToken: encodedToken,
    };
  } catch (err) {
    return {
      userName: null,
      userId: null,
      accessToken: null,
    };
  }
};

export const prepareTokenCookie = ({
  token,
  age = 60 * 60 * 24 * 30, // 30 days
}: {
  token: string;
  age?: number;
}): CookieType => {
  return [
    ACCESS_TOKEN_NAME,
    token,
    {
      httpOnly: true,
      maxAge: age,
      secure: true,
      sameSite: "strict",
    } as CookieOptions,
  ];
};

export const expiredTokenCookie = (): CookieType =>
  prepareTokenCookie({ token: "", age: -1 });

export const getAccessDeniedResponse = (response: any) => {
  return response
    .cookie(...expiredTokenCookie())
    .status(401)
    .json({ message: getTranslation("unauthorizedRequest") });
};

export const addUser = async (newUser: IUser) => {
  const dsalt = random(16).toString("hex");
  const passHash = sha256.hmac(dsalt, newUser.password);
  await User.create({ ...newUser, password: passHash, dsalt });
  return newUser?.userName;
};

export const getUserByName = async (userName: string) =>
  await User.findOne({ userName: userName });

export const findUserByEmail = async (email: string) =>
  await User.findOne({ email: email });

export const isUserAuthentic = async ({
  userName,
  password,
}: {
  userName: string;
  password: string;
}) => {
  const user = await User.findOne({ userName: userName });
  if (!user) return false;

  const passHash = sha256.hmac(user.dsalt, password);
  return user.password === passHash;
};

export const isAuthToken = async (token: string) => {
  const { userName, accessToken, userId } = decodeToken(token);

  if (!userName || !accessToken || !userId) return false;

  return true;
};

export const ensureAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.[ACCESS_TOKEN_NAME];

  if (!accessToken || !isAuthToken(accessToken)) {
    return res.status(401).redirect("/api/auth/login");
  }

  const { userId } = decodeToken(accessToken);
  req.body.userId = userId;

  return next();
};
