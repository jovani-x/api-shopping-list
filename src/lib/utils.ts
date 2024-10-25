import mongoose, { Document } from "mongoose";

// logger
export const logMsg = (...args: unknown[]) => {
  console.log(`[${new Date().toISOString()}]`, ...args);
};

// connect to db
export const connectToDb = async () => {
  const db_uri = process.env.DB_URI;

  if (!db_uri) {
    logMsg("There is no DB_URI in .env");
    process.exit(1);
  }

  return await mongoose.connect(db_uri).catch((err) => {
    logMsg(err);

    if (err.name === "MongooseServerSelectionError") {
      logMsg("reason:", err?.reason?.servers);
    }

    process.exit(1);
  });
};

// disconnect from db
export const disconnectFromDb = async (dbConnection: mongoose.Mongoose) =>
  await dbConnection.disconnect();

// data transformation and cleaning
export const jsonTransform = (_doc: Document, ret: Record<string, unknown>) => {
  const { _id, __v, ...obj } = ret;
  return { ...obj, id: _id?.toString() };
};

// check value: null | string
export const shouldBeNullOrString = (value: unknown) => {
  return value === null || typeof value === "string";
};
