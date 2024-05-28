import express from "express";
import routes from "@/routes/routes.js";
import cardRoutes from "@/routes/cardRoutes.js";
import userRoutes from "@/routes/userRoutes.js";
import friendRoutes from "@/routes/friendRoutes.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { ensureAuthenticated } from "@/services/authServices.js";

const app = express();
const PORT = process.env.PORT || 3001;
const ENV_MODE = process.env.ENV || "development";
export const isDevMode = ENV_MODE === "development";

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);
app.use("/api/auth", userRoutes);
app.use("/api/cards", ensureAuthenticated, cardRoutes);
app.use("/api/users", ensureAuthenticated, friendRoutes);

const db_uri = process.env.DB_URI;

if (!db_uri) {
  console.error("There is no DB_URI in .env");
  process.exit(1);
}

mongoose
  .connect(db_uri)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`app listening on a port ${PORT}`);
    })
  )
  .catch((err) => console.log(err));
