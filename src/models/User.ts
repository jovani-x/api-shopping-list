import mongoose from "mongoose";
import { UserRole, UserRequest } from "../data/types.js";

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
  users: [
    {
      userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
      },
      userName: {
        type: String,
        required: true,
      },
    },
  ],
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
  requests: [
    {
      name: {
        type: String,
        enum: UserRequest,
        default: UserRequest.becomeFriend,
        required: true,
      },
      from: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
      },
    },
  ],
});

export const User = mongoose.model("User", UserSchema);
