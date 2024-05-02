import express from "express";
import routes from "./src/routes/routes.js";
import cardRoutes from "./src/routes/cardRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import cardController from "./src/controllers/cardController.js";
import userController from "./src/controllers/userController.js";

const app = express();
const PORT = process.env.PORT || 3001;
const ENV_MODE = process.env.ENV || "development";
export const isDevMode = ENV_MODE === "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (isDevMode) {
  // init fake data
  try {
    const fakeDataModule = await import("./src/data/fake-data.js");
    const card = fakeDataModule.getTestCard();
    cardController.init([card]);

    userController.init(fakeDataModule.userStore);
  } catch (err) {
    console.log(err);
  }
} else {
  // connect to db...
  // cardController.init();
  // userController.init(originalUserStore)
}

app.use("/", routes);
app.use("/api/auth", userRoutes);
app.use("/api/cards", cardRoutes);

app.listen(PORT, () => {
  console.log(`app listening on a port ${PORT}`);
});
