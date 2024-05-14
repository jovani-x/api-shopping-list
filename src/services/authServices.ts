import { sha256 } from "js-sha256";
import { AuthUser, IUser } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";

import { User } from "../models/User.js";

type CookieOptionType = {
  httpOnly?: boolean;
  maxAge?: Number;
  domain?: string;
  path?: string;
  expires?: Date;
  secure?: boolean;
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
  sameSite?: true | "lax" | "strict" | "none";
};

const getJWTSecret = () => {
  return process.env.JWT_SECRET || "";
};

export const tokenName = process.env.JWT_NAME || "authToken";

export const generateToken = ({ userName }: { userName: string }): string => {
  const secret = getJWTSecret();
  const headers = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const user = btoa(JSON.stringify({ userName }));
  const signature = sha256.hmac(secret, `${headers}.${user}`);
  return btoa(`${headers}.${user}.${signature}`);
};

export const decodeToken = (encodedToken: string | null): AuthUser => {
  try {
    if (!encodedToken) {
      return {
        userName: null,
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
}): [string, string, CookieOptionType | undefined] => {
  return [
    tokenName,
    token,
    { httpOnly: true, maxAge: age, secure: true, sameSite: "strict" },
  ];
};

export const expiredTokenCookie = (): [
  string,
  string,
  CookieOptionType | undefined
] => prepareTokenCookie({ token: "", age: -1 });

export const getAccessDeniedResponse = (response: any) => {
  return response
    .cookie(...expiredTokenCookie())
    .status(401)
    .json({ message: getTranslation("unauthorizedRequest") });
};

export const addUser = async (newUser: IUser) => {
  await User.create(newUser);
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

  return user.password === password;
};

export const updateToken = async ({
  userName,
  token,
}: {
  userName: string;
  token: string;
}) =>
  await User.findOneAndUpdate({ userName: userName }, { accessToken: token });

export const removeToken = async (token: string) => {
  const { userName } = decodeToken(token);
  return await User.findOneAndUpdate(
    { userName: userName },
    { accessToken: null }
  );
};

export const isAuthToken = async (token: string) => {
  const { userName, accessToken } = decodeToken(token);
  const user = !userName ? null : await User.findOne({ userName: userName });

  if (!user?.accessToken) return false;

  return accessToken === user.accessToken;
};
