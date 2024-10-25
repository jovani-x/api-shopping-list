import mongoose from "mongoose";
import { IProduct, ICard } from "@/data/types.js";
import { jsonTransform, shouldBeNullOrString } from "@/lib/utils.js";

export const jsonConf = {
  virtuals: true,
  versionKey: false,
  transform: jsonTransform,
};

const ProductScheme = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    validate: {
      validator: shouldBeNullOrString,
      message: "Must be either null or a string",
    },
    required: false,
  },
  note: {
    type: String,
    validate: {
      validator: shouldBeNullOrString,
      message: "Must be either null or a string",
    },
    required: false,
  },
  got: Boolean,
});

ProductScheme.set("toJSON", jsonConf);
ProductScheme.set("toObject", jsonConf);

ProductScheme.add({
  alternatives: [ProductScheme],
});

export const Product = mongoose.model<IProduct>("Product", ProductScheme);

const CardScheme = new mongoose.Schema<ICard>({
  name: {
    type: String,
    required: true,
  },
  notes: String,
  products: [ProductScheme],
  isDone: Boolean,
  id: String,
  userRole: String,
  status: {
    value: String,
    userName: String,
  },
});

CardScheme.set("toJSON", jsonConf);
CardScheme.set("toObject", jsonConf);

export const Card = mongoose.model<ICard>("Card", CardScheme);
