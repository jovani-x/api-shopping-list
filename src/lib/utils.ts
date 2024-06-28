import mongoose from "mongoose";

export const connectToDb = async () => {
  const db_uri = process.env.DB_URI;

  if (!db_uri) {
    console.error("There is no DB_URI in .env");
    process.exit(1);
  }

  return await mongoose.connect(db_uri).catch((err) => console.log(err));
};
