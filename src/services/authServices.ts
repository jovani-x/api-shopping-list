import { sha256 } from "js-sha256";
import { AuthUser, UserServiceType } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";

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

export const userStore = {
  service: null,
  init: function (service: UserServiceType) {
    this.service = service;
  },
};

const getJWTSecret = () => {
  return process.env.JWT_SECRET || "";
};

export const tokenName = process.env.VITE_JWT_NAME || "authToken";

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

export const addUser = userStore.service.addUser;
export const getUserByName = userStore.service.getUserByName;
export const findUserByEmail = userStore.service.findUserByEmail;
export const isUserAuthentic = userStore.service.isUserAuthentic;

export const updateToken = userStore.service.updateToken;
export const removeToken = userStore.service.removeToken;
export const isAuthToken = userStore.service.isAuthToken;
