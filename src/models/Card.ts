import mongoose from "mongoose";
import { IProduct, ICard } from "@/data/types.js";

export const jsonConf = {
  virtuals: true,
  versionKey: false,
  transform: function (_doc: any, ret: any) {
    const { _id, __v, ...obj } = ret;
    return { ...obj, id: _id.toString() };
  },
};

const ProductScheme = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: function () {
      return (
        typeof this.photo === "undefined" ||
        (this.photo != null && typeof this.photo != "string")
      );
    },
  },
  note: {
    type: String,
    required: function () {
      return (
        typeof this.note === "undefined" ||
        (this.note != null && typeof this.note != "string")
      );
    },
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
});

CardScheme.set("toJSON", jsonConf);
CardScheme.set("toObject", jsonConf);

export const Card = mongoose.model<ICard>("Card", CardScheme);
