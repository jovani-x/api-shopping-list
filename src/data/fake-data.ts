import { generateToken } from "../services/authServices.js";

// fake data
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
