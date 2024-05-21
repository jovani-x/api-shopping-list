import mongoose from "mongoose";
import { UserRole } from "../data/types.js";

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  dsalt: {
    type: String,
    required: true,
  },
  accessToken: String,
  cards: [
    {
      cardId: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: UserRole,
        default: UserRole.buyer,
        required: true,
      },
    },
  ],
});

export const User = mongoose.model("User", UserSchema);
