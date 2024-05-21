export interface IProduct {
  id: string;
  name: string;
  photo: string | null;
  note: string | null;
  alternatives?: IProduct[];
  got: boolean;
}

export interface ICard {
  id: string;
  name: string;
  notes?: string;
  products?: IProduct[];
  isDone: boolean;
}

export interface ILoginValues {
  userName: string;
  password: string;
}

export interface IUser extends ILoginValues {
  email: string;
  accessToken?: string | null;
  // role?: RolesType
  // expiredToken?: Date
}

export type AuthUser = {
  userName: string | null;
  userId: string | null;
  accessToken: string | null;
};

export type UserServiceType = {
  getUserByName: Function;
  isUserAuthentic: Function;
  addUser: Function;
  updateToken: Function;
  isAuthToken: Function;
};

export enum UserRole {
  owner = "OWNER",
  buyer = "BUYER",
}
