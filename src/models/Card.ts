import mongoose from "mongoose";

const jsonConf = {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    delete ret._id;
  },
};

const ProductScheme = new mongoose.Schema({
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

ProductScheme.add({
  alternatives: [ProductScheme],
});

export const Product = mongoose.model("Product", ProductScheme);

const CardScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  notes: String,
  products: [ProductScheme],
  isDone: Boolean,
});

CardScheme.set("toJSON", jsonConf);

export const Card = mongoose.model("Card", CardScheme);
