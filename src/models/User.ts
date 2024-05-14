import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: String,
  accessToken: String,
});

export const User = mongoose.model("User", UserSchema);
