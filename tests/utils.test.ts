import { describe, expect, it, vi } from "vitest";
import {
  logMsg,
  connectToDb,
  disconnectFromDb,
  jsonTransform,
  shouldBeNullOrString,
} from "@/lib/utils.js";
import mongoose, { Document } from "mongoose";

const mocks = vi.hoisted(() => ({
  mongooseDisconnect: vi.fn(),
}));

const mockLog = vi
  .spyOn(global.console, "log")
  .mockImplementation(() => vi.fn());
const mockExit = vi
  .spyOn(process, "exit")
  .mockImplementation(() => vi.fn() as never);

describe("lib/utils", () => {
  describe("logMsg", () => {
    it("Called with args", () => {
      const testArg1 = "test arg 1";
      const testArg2 = "test arg 2";

      logMsg(testArg1, testArg2);

      expect(mockLog).toHaveBeenCalledWith(
        expect.anything(),
        testArg1,
        testArg2
      );
    });
  });

  describe("connectToDb", () => {
    it("No process.env.DB_URI (faild connection)", async () => {
      vi.stubEnv("DB_URI", undefined);

      const testStr = "There is no DB_URI in .env";

      await connectToDb();

      expect(mockLog).toHaveBeenCalledWith(expect.anything(), testStr);
      expect(mockExit).toHaveBeenCalledWith(1);

      vi.unstubAllEnvs();
    });

    it("Connection (success)", async () => {
      const testURI = "test DB URI";
      vi.stubEnv("DB_URI", testURI);

      const connectFn = vi
        .spyOn(mongoose, "connect")
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              resolve(vi.fn() as unknown as typeof mongoose)
            )
        );

      await connectToDb();

      expect(connectFn).toHaveBeenCalledWith(testURI);

      vi.unstubAllEnvs();
    });

    it("Connection error", async () => {
      const testURI = "test DB URI";
      const testMsg = "Test Error";
      const testErr = new Error(testMsg);
      vi.stubEnv("DB_URI", testURI);

      const connectFn = vi
        .spyOn(mongoose, "connect")
        .mockImplementationOnce(
          () => new Promise((_resolve, reject) => reject(testErr))
        );

      await connectToDb();

      expect(connectFn).toHaveBeenCalledWith(testURI);
      expect(mockLog).toHaveBeenCalledWith(expect.anything(), testErr);
      expect(mockLog).toHaveBeenCalledTimes(1);
      expect(mockExit).toHaveBeenCalledWith(1);

      vi.unstubAllEnvs();
    });

    it("Connection error (MongooseServerSelectionError)", async () => {
      const testURI = "test DB URI";
      const testMsg = "Test Error";
      const testErr = new mongoose.Error.MongooseServerSelectionError(testMsg);
      vi.stubEnv("DB_URI", testURI);

      const connectFn = vi
        .spyOn(mongoose, "connect")
        .mockImplementationOnce(
          () => new Promise((_resolve, reject) => reject(testErr))
        );

      await connectToDb();

      expect(connectFn).toHaveBeenCalledWith(testURI);
      expect(mockLog).toHaveBeenCalledWith(expect.anything(), testErr);
      expect(mockLog).toHaveBeenCalledWith(expect.anything(), testErr);
      expect(mockLog).toHaveBeenCalledTimes(2);
      expect(mockExit).toHaveBeenCalledWith(1);

      vi.unstubAllEnvs();
    });
  });

  describe("disconnectFromDb", () => {
    it("Disconnect", async () => {
      const testURI = "test DB URI";
      vi.stubEnv("DB_URI", testURI);

      const dbConnection = {
        disconnect: mocks.mongooseDisconnect,
      } as unknown as mongoose.Mongoose;

      const connectFn = vi
        .spyOn(mongoose, "connect")
        .mockImplementationOnce(
          () => new Promise((resolve) => resolve(dbConnection))
        );

      await connectToDb();
      await disconnectFromDb(dbConnection);

      expect(connectFn).toHaveBeenCalledWith(testURI);
      expect(mocks.mongooseDisconnect).toHaveBeenCalledTimes(1);

      vi.unstubAllEnvs();
    });
  });

  describe("jsonTransform", () => {
    it("Correct object transformation", () => {
      const obj = {
        testProperty1: 0,
        testProperty2: 2,
        testProperty3: "test",
        testProperty4: true,
        testProperty5: false,
        testProperty6: null,
        testProperty7: undefined,
        testProperty8: [0, 1, 2, "", "test"],
        testProperty9: { prop: 0, prop2: "test" },
      };
      const testObj = {
        _id: 123456789, // mongodb type ObjectId
        __v: "test v",
        ...obj,
      };
      const res = jsonTransform({} as unknown as Document, testObj);

      expect(res).toEqual({ ...obj, id: testObj["_id"].toString() });
    });
  });

  describe("shouldBeNullOrString", () => {
    it.each([null, "Test string"])("Valid: %s", (value) => {
      vi.mock("@/lib/utils.js", { spy: true });
      const res = shouldBeNullOrString(value);

      expect(shouldBeNullOrString).toHaveBeenCalledWith(value);
      expect(res).toBe(true);
    });

    it.each([undefined, 0, 2, true, false, ["array"], {}])(
      "Invalid: %s",
      (value) => {
        vi.mock("@/lib/utils.js", { spy: true });
        const res = shouldBeNullOrString(value);

        expect(shouldBeNullOrString).toHaveBeenCalledWith(value);
        expect(res).toBe(false);
      }
    );
  });
});
