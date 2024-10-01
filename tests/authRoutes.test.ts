import { vi, it, expect, describe } from "vitest";
import request from "supertest";
import app from "@/../app.js";
import { t } from "i18next";

const mocks = vi.hoisted(() => ({
  isUserAuthentic: vi.fn(),
  getUserByName: vi.fn(),
  generateToken: vi.fn(),
  isAuthToken: vi.fn(),
  addUser: vi.fn(),
  findUserByEmail: vi.fn(),
}));

vi.mock("@/services/authServices.js", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    isUserAuthentic: mocks.isUserAuthentic,
    getUserByName: mocks.getUserByName,
    generateToken: mocks.generateToken,
    isAuthToken: mocks.isAuthToken,
    ensureAuthenticated: vi.fn(),
    addUser: mocks.addUser,
    findUserByEmail: mocks.findUserByEmail,
  };
});

vi.mock("@/lib/utils.js", () => ({
  connectToDb: vi.fn(),
}));

vi.mock("i18next", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    t: vi.fn((text) => text),
    use: () => this,
    init: () => {},
  };
});

describe("Auth Routes", () => {
  const userCredentials = { userName: "TestUser1", password: "123456Pwd" };

  describe("signin", () => {
    const loginUrl = "/api/auth/login";

    it("Wrong data - no username", async () => {
      const response = await request(app)
        .post(loginUrl)
        .send({ password: userCredentials.password });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - no password", async () => {
      const response = await request(app)
        .post(loginUrl)
        .send({ userName: userCredentials.userName });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - no username and password", async () => {
      const response = await request(app).post(loginUrl).send({});

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong credentials", async () => {
      mocks.isUserAuthentic.mockImplementationOnce(() => false);

      const response = await request(app).post(loginUrl).send(userCredentials);

      expect(response.body).toEqual({ message: t("wrongCredentials") });
      expect(response.status).toBe(401);
    });

    it("Success", async () => {
      mocks.isUserAuthentic.mockImplementationOnce(async () => true);
      mocks.getUserByName.mockImplementationOnce(async () => ({ id: "123" }));
      const APP_ORIGIN = process.env.APP_ORIGIN;
      const origin = APP_ORIGIN;

      const response = await request(app).post(loginUrl).send(userCredentials);

      expect(response.body).toEqual({ userName: userCredentials.userName });
      expect(response.status).toBe(200);
      expect(response.header["access-control-allow-credentials"]).toBe("true");
      expect(response.header["access-control-allow-origin"]).toBe(origin);
    });

    it("Success (env without APP_ORIGIN)", async () => {
      vi.stubEnv("APP_ORIGIN", undefined);

      mocks.isUserAuthentic.mockImplementationOnce(async () => true);
      mocks.getUserByName.mockImplementationOnce(async () => ({ id: "123" }));

      const response = await request(app).post(loginUrl).send(userCredentials);

      expect(response.body).toEqual({ userName: userCredentials.userName });
      expect(response.status).toBe(200);
      expect(response.header["access-control-allow-credentials"]).toBe("true");
      expect(response.header["access-control-allow-origin"]).toBe("*");

      vi.unstubAllEnvs();
    });

    it("Error", async () => {
      const errMsg = "Test signin error";

      mocks.isUserAuthentic.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).post(loginUrl).send(userCredentials);

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("signout", () => {
    const logoutUrl = "/api/auth/logout";

    it("Wrong credentials", async () => {
      mocks.isAuthToken.mockImplementationOnce(async () => false);

      const response = await request(app).post(logoutUrl).send(userCredentials);

      expect(response.body).toEqual({
        message: t("unauthorizedRequest"),
      });
      expect(response.status).toBe(401);
    });

    it("Success", async () => {
      mocks.isAuthToken.mockImplementationOnce(async () => true);

      const response = await request(app).post(logoutUrl).send(userCredentials);

      expect(response.body).toEqual({
        message: t("userHasBeenSignedOut", {
          userName: userCredentials.userName,
        }),
      });
      expect(response.status).toBe(200);
    });

    it("Error", async () => {
      const errMsg = "Test signout error";

      mocks.isAuthToken.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).post(logoutUrl).send(userCredentials);

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("signup", () => {
    const signupUrl = "/api/auth/register";
    const newUserData = {
      userName: "TestUser2",
      password: "123456_pswd",
      confirmPassword: "123456_pswd",
      email: "test-user-2@test.test",
    };

    it("Wrong data - no username", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userName, ...restData } = newUserData;

      const response = await request(app)
        .post(signupUrl)
        .send({ user: { ...restData } });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - no password", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restData } = newUserData;

      const response = await request(app)
        .post(signupUrl)
        .send({ user: { ...restData } });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - password doesn't match confirmed password", async () => {
      const { password, ...restData } = newUserData;

      const response = await request(app)
        .post(signupUrl)
        .send({ user: { password: `${password}-extra`, ...restData } });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - no email", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...restData } = newUserData;

      const response = await request(app)
        .post(signupUrl)
        .send({ user: { ...restData } });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error - Login already exists", async () => {
      const { userName } = newUserData;

      mocks.getUserByName.mockImplementationOnce(async () => ({ userName }));

      const response = await request(app)
        .post(signupUrl)
        .send({ user: newUserData });

      expect(response.body).toEqual({
        message: t("loginAlreadyExists", { userName }),
      });
      expect(response.status).toBe(400);
    });

    it("Success", async () => {
      const { userName } = newUserData;
      mocks.addUser.mockImplementationOnce(async () => userName);

      const response = await request(app)
        .post(signupUrl)
        .send({ user: newUserData });

      expect(response.body).toEqual({
        userName,
        message: t("userHasBeenRegistered", { userName }),
      });
      expect(response.status).toBe(201);
    });

    it("Error", async () => {
      const errMsg = "Test signup error";

      mocks.addUser.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .post(signupUrl)
        .send({ user: newUserData });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("forget", () => {
    const forgetUrl = "/api/auth/forget";
    const email = "test-user-2@test.test";

    it("Wrong data", async () => {
      const response = await request(app).post(forgetUrl).send({});

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error - User doesn't exists with such email", async () => {
      mocks.findUserByEmail.mockImplementationOnce(async () => null);

      const response = await request(app).post(forgetUrl).send({ email });

      expect(response.body).toEqual({
        message: `${t("noUserExistsWithSuchEmail")}: "${email}"`,
      });
      expect(response.status).toBe(404);
    });

    it("Success", async () => {
      mocks.findUserByEmail.mockImplementationOnce(async () => ({
        userName: "username",
      }));

      const response = await request(app).post(forgetUrl).send({ email });

      expect(response.body).toEqual({
        message: `${t("furtherInstructionsHaveBeenSentToEmailAddress", {
          email,
        })}.`,
      });
      expect(response.status).toBe(200);
    });

    it("Error", async () => {
      const errMsg = "Test forget error";

      mocks.findUserByEmail.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).post(forgetUrl).send({ email });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });
});
