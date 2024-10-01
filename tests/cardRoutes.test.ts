import { vi, describe, it, expect } from "vitest";
import request from "supertest";
import { ICard, UserRole } from "@/data/types.js";
import { disableAuth } from "./test-utils.js";
import app from "@/../app.js";
import { t } from "i18next";

type ICardExtended = ICard & { userRole: UserRole | undefined };

const mocks = vi.hoisted(() => ({
  getUserCards: vi.fn(),
  getCardById: vi.fn(),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  addCardToUser: vi.fn(),
  removeCardFromUser: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@/services/cardServices.js", () => ({
  getUserCards: mocks.getUserCards,
  getCardById: mocks.getCardById,
  createCard: mocks.createCard,
  updateCard: mocks.updateCard,
  deleteCard: mocks.deleteCard,
  addCardToUser: mocks.addCardToUser,
  getAllCards: vi.fn(),
  removeCardFromUser: mocks.removeCardFromUser,
}));

vi.mock("@/services/friendServices.js", () => ({
  getUserById: mocks.getUserById,
}));

vi.mock("@/services/authServices.js", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    ensureAuthenticated: disableAuth,
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

describe("Card Routes", () => {
  const testCard = {
    id: "1",
    name: "John's Card Title",
    isDone: false,
    userRole: UserRole.owner,
  };
  const mockCards: ICardExtended[] = [
    testCard,
    {
      id: "2",
      name: "Tom's Card Title",
      isDone: false,
      userRole: UserRole.buyer,
    },
  ];

  describe("getAllCards", () => {
    it("Success", async () => {
      mocks.getUserCards.mockImplementationOnce(() => mockCards);

      const response = await request(app).get("/api/cards");

      expect(response.body).toEqual(mockCards);
      expect(response.status).toBe(200);
    });

    it("Error", async () => {
      const errMsg = "Test getAllCards error";

      mocks.getUserCards.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).get("/api/cards");

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("getCard", () => {
    const cardId = 111;

    it("Success", async () => {
      mocks.getCardById.mockImplementationOnce(() => testCard);
      mocks.getUserById.mockImplementationOnce(() => ({
        cards: [{ cardId: testCard.id, role: testCard.userRole }],
      }));

      const response = await request(app)
        .get(`/api/cards/${testCard.id}`)
        .send({ userId: "123" });

      expect(response.body).toEqual({ card: testCard });
      expect(response.status).toBe(200);
    });

    it("No card", async () => {
      mocks.getCardById.mockImplementationOnce(() => null);
      const response = await request(app).get(`/api/cards/${cardId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: t("cardWithIdDoesnotExist", { id: cardId }),
      });
    });

    it("Error", async () => {
      const errMsg = "Test getCard error";

      mocks.getCardById.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).get(`/api/cards/${cardId}`);

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("createCard", () => {
    it("Success", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...cardProps } = testCard;
      mocks.createCard.mockImplementationOnce(() => testCard);

      const response = await request(app)
        .post(`/api/cards/new`)
        .send({ card: { ...cardProps }, userId: "123" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ card: testCard });
    });

    it("Wrong data", async () => {
      const response = await request(app)
        .post(`/api/cards/new`)
        .send({ card: {}, userId: "123" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: t("wrongData") });
    });

    it("Error", async () => {
      const errMsg = "Test createCard error";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...cardProps } = testCard;

      mocks.createCard.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .post(`/api/cards/new`)
        .send({ card: { ...cardProps }, userId: "123" });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("updateCard", () => {
    it("Success", async () => {
      const { id } = testCard;
      mocks.updateCard.mockImplementationOnce(async () => testCard);

      const response = await request(app)
        .put(`/api/cards/${id}`)
        .send({ card: testCard });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ card: testCard });
    });

    it("Error", async () => {
      const errMsg = "Test updateCard error";
      const { id } = testCard;

      mocks.updateCard.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .put(`/api/cards/${id}`)
        .send({ card: { ...testCard } });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errMsg });
    });
  });

  describe("deleteCard", () => {
    it("Success", async () => {
      const { id } = testCard;
      mocks.deleteCard.mockImplementationOnce(async () => testCard);

      const response = await request(app).delete(`/api/cards/${id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ card: testCard });
    });

    it("Error", async () => {
      const errMsg = "Test deleteCard error";
      const { id } = testCard;

      mocks.deleteCard.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).delete(`/api/cards/${id}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errMsg });
    });
  });

  describe("addCardToUser", () => {
    it("Success", async () => {
      const { id } = testCard;
      mocks.addCardToUser.mockImplementationOnce(async () => id);

      const response = await request(app)
        .post(`/api/cards/${id}/share`)
        .send({ targetUserId: "123", targetUserRole: UserRole.buyer });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ cardId: id });
    });

    it("Wrong data", async () => {
      const { id } = testCard;
      const response = await request(app)
        .post(`/api/cards/${id}/share`)
        .send({ targetUserRole: UserRole.buyer });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: t("wrongData") });
    });

    it("Error", async () => {
      const errMsg = "Test addCardToUser error";
      const { id } = testCard;

      mocks.addCardToUser.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .post(`/api/cards/${id}/share`)
        .send({ targetUserId: "123", targetUserRole: UserRole.buyer });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errMsg });
    });
  });

  describe("removeCardFromUser", () => {
    it("Success", async () => {
      const { id } = testCard;
      mocks.removeCardFromUser.mockImplementationOnce(async () => id);

      const response = await request(app)
        .delete(`/api/cards/${id}/share`)
        .send({ targetUserId: "123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ cardId: id });
    });

    it("Wrong data", async () => {
      const { id } = testCard;
      const response = await request(app).delete(`/api/cards/${id}/share`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: t("wrongData") });
    });

    it("Error", async () => {
      const errMsg = "Test removeCardFromUser error";
      const { id } = testCard;

      mocks.removeCardFromUser.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .delete(`/api/cards/${id}/share`)
        .send({ targetUserId: "123" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: errMsg });
    });
  });
});
