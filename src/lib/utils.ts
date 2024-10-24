import mongoose from "mongoose";

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

export const disconnectFromDb = async (dbConnection: mongoose.Mongoose) =>
  await dbConnection.disconnect();
