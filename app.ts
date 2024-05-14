import express from "express";
import routes from "./src/routes/routes.js";
import cardRoutes from "./src/routes/cardRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3001;
const ENV_MODE = process.env.ENV || "development";
export const isDevMode = ENV_MODE === "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);
app.use("/api/auth", userRoutes);
app.use("/api/cards", cardRoutes);

mongoose
  .connect(process.env.DB_URI)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`app listening on a port ${PORT}`);
    })
  )
  .catch((err) => console.log(err));
