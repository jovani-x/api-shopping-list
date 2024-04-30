import { sha256 } from "js-sha256";

const getJWTSecret = () => {
  return process.env.JWT_SECRET || "";
};

export const generateToken = ({ userName }: { userName: string }): string => {
  const secret = getJWTSecret();
  const headers = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const user = btoa(JSON.stringify({ userName }));
  const signature = sha256.hmac(secret, `${headers}.${user}`);
  return btoa(`${headers}.${user}.${signature}`);
};
