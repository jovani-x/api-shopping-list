import { generateToken, decodeToken } from "../services/authServices.js";
import { IUser } from "./types.js";

// fake data
const allUsers = new Map<string, IUser>();

export const userStore = {
  addUser: (newUser: IUser) => {
    allUsers.set(newUser.userName, newUser);
    return newUser.userName;
  },
  getUserByName: (userName: string) => {
    return allUsers.get(userName);
  },
  findUserByEmail: (email: string) => {
    let user = null;

    for (const [_key, value] of allUsers) {
      if (value.email === email) {
        user = value;
      }
    }

    return user;
  },
  isUserAuthentic: ({
    userName,
    password,
  }: {
    userName: string;
    password: string;
  }) => {
    const user = allUsers.get(userName);
    return user && user.password === password;
  },
  updateToken: ({ userName, token }: { userName: string; token: string }) => {
    const user = allUsers.get(userName);
    allUsers.set(userName, { ...user, accessToken: token });
    return allUsers.get(userName);
  },
  removeToken: ({ token }: { token: string }) => {
    const userName = decodeToken(token)?.userName;
    const user = !userName ? null : allUsers.get(userName);
    allUsers.set(userName, { ...user, accessToken: null });
    return userName;
  },
  isAuthToken: (token: string) => {
    const userName = decodeToken(token)?.userName;
    const user = !userName ? null : allUsers.get(userName);

    if (
      !user?.accessToken ||
      (!!user && !!user?.accessToken && token !== user.accessToken)
    ) {
      return false;
    }

    return true;
  },
};

// user
const user_MyLogin = {
  userName: "myLogin",
  password: "123456",
  email: "gdf@fdsf.fd",
  accessToken: generateToken({ userName: "myLogin" }),
};

export const getTestUser = () => user_MyLogin;

// card
export const getTestCardId = () => "jqVotZxPlidGSKbnwK2G1";

const test_card = {
  id: getTestCardId(),
  name: "M-market",
  notes: "promocode: 123-456",
  products: [
    {
      id: "x4z4ZVj2CxUujagklIfhR",
      name: "milk",
      photo: null,
      note: "2%",
      got: true,
    },
    {
      id: "djOTXVAA5hv8UBxCFXYtE",
      name: "bread",
      photo: null,
      note: "",
      got: true,
    },
  ],
  isDone: true,
};

export const getTestCard = () => test_card;

export const getTestProduct = () => {
  const card = getTestCard();
  const products = card?.products;
  const product = products?.[0];
  return product;
};
