import mongoose from "mongoose";
import { IUser, UserRole, UserRequest } from "@/data/types.js";
import { jsonConf } from "@/models/Card.js";

const UserSchema = new mongoose.Schema<IUser>({
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
      text: {
        type: String,
        default: "",
      },
    },
  ],
});

UserSchema.set("toJSON", jsonConf);
UserSchema.set("toObject", jsonConf);

export const User = mongoose.model<IUser>("User", UserSchema);
