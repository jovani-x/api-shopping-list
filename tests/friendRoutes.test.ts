import { vi, it, describe, expect } from "vitest";
import request from "supertest";
import { UserRequest, UserRole } from "@/data/types.js";
import { disableAuth } from "./test-utils.js";
import app from "@/../app.js";
import { t } from "i18next";

const mocks = vi.hoisted(() => ({
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  deleteFriend: vi.fn(),
  deleteFriends: vi.fn(),
  sendFriendRequest: vi.fn(),
  approveFriendRequest: vi.fn(),
  declineFriendRequest: vi.fn(),
  sendInvitation: vi.fn(),
  getUserRequests: vi.fn(),
  getUserFriends: vi.fn(),
  getUserCards: vi.fn(),
  removeCardFromUser: vi.fn(),
}));

vi.mock("@/services/friendServices.js", () => ({
  getAllUsers: mocks.getAllUsers,
  getUserFriends: mocks.getUserFriends,
  getUserRequests: mocks.getUserRequests,
  getUserById: mocks.getUserById,
  sendInvitation: mocks.sendInvitation,
  sendFriendRequest: mocks.sendFriendRequest,
  approveFriendRequest: mocks.approveFriendRequest,
  declineFriendRequest: mocks.declineFriendRequest,
  deleteUser: mocks.deleteFriend,
  deleteUsers: mocks.deleteFriends,
  getUserByEmail: mocks.getUserByEmail,
}));

vi.mock("@/services/cardServices.js", () => ({
  getUserCards: mocks.getUserCards,
  removeCardFromUser: mocks.removeCardFromUser,
}));

vi.mock("@/services/authServices.js", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    ensureAuthenticated: disableAuth,
  };
});

vi.mock("@/lib/utils.js", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    connectToDb: vi.fn(async () => ({
      startSession: vi.fn(() => ({
        startTransaction: vi.fn(),
        abortTransaction: vi.fn(),
        commitTransaction: vi.fn(),
        endSession: vi.fn(),
      })),
    })),
    disconnectFromDb: vi.fn(),
  };
});

vi.mock("i18next", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    t: vi.fn((text) => text),
    use: () => this,
    init: () => {},
  };
});

describe("Friend Routes", () => {
  const testUserId = "123456";

  describe("getAllUsers", () => {
    const usersUrl = "/api/users";

    it("Success", async () => {
      const friends = [
        { userId: "1", userName: "TestUser1" },
        { userId: "2", userName: "TestUser2" },
      ];
      mocks.getUserFriends.mockImplementationOnce(async () => friends);

      const response = await request(app)
        .get(usersUrl)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(friends);
    });

    it("Error", async () => {
      const errMsg = "Test getAllUsers error";

      mocks.getUserFriends.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .get(usersUrl)
        .send({ userId: testUserId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("getUserRequests", () => {
    const reqUrl = "/api/users/requests";

    it("Success", async () => {
      const testRequests = [
        {
          name: UserRequest.becomeFriend,
          from: "123456",
          id: "123",
          text: "Test message",
        },
        { name: UserRequest.becomeFriend, from: "123457", id: "124" },
      ];
      mocks.getUserRequests.mockImplementationOnce(async () => testRequests);

      const response = await request(app)
        .get(reqUrl)
        .send({ userId: testUserId });

      expect(response.body).toEqual({ requests: testRequests });
      expect(response.status).toBe(200);
    });

    it("Wrong data", async () => {
      const response = await request(app).get(reqUrl).send({});

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error", async () => {
      const errMsg = "Test getUserRequests error";

      mocks.getUserRequests.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .get(reqUrl)
        .send({ userId: testUserId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("getUserRequests 'become friend'", () => {
    const reqUrl = "/api/users/requests/become-friend";

    it("Success", async () => {
      const testRequests = [
        {
          name: UserRequest.becomeFriend,
          from: "123456",
          id: "123",
          text: "Test message",
        },
        { name: UserRequest.becomeFriend, from: "123457", id: "124" },
      ];
      mocks.getUserRequests.mockImplementationOnce(async () => testRequests);

      const response = await request(app)
        .get(reqUrl)
        .send({ userId: testUserId });

      expect(response.body).toEqual({ requests: testRequests });
      expect(response.status).toBe(200);
    });

    it("Wrong data", async () => {
      const response = await request(app).get(reqUrl).send({});

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error", async () => {
      const errMsg = "Test getUserRequests error";

      mocks.getUserRequests.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .get(reqUrl)
        .send({ userId: testUserId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("getUser", () => {
    const userId = "1234";
    const testUser = { userName: "TestUser1", id: userId };
    const userUrl = `/api/users/${userId}`;

    it("Success", async () => {
      mocks.getUserById.mockImplementationOnce(async () => testUser);

      const response = await request(app).get(userUrl);
      expect(response.body).toEqual({ ...testUser });
      expect(response.status).toBe(200);
    });

    it("User doesn't exist", async () => {
      const userUrl = `/api/users/${userId}`;
      mocks.getUserById.mockImplementationOnce(async () => null);

      const response = await request(app).get(userUrl);
      expect(response.body).toEqual({
        message: t("userWithIdDoesnotExist", { id: userId }),
      });
      expect(response.status).toBe(404);
    });

    it("Error", async () => {
      const errMsg = "Test getUser error";
      mocks.getUserById.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).get(userUrl);

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("inviteUser", () => {
    const userId = "123456";
    const inviteUrl = "/api/users/invite";
    const testSendData = {
      userEmail: "friend@test.test",
      userId,
      messageText: "Test message",
    };

    it("Success (send invitation)", async () => {
      mocks.getUserByEmail.mockImplementationOnce(async () => null);
      const response = await request(app).post(inviteUrl).send(testSendData);

      expect(response.body).toEqual({ message: t("invitationSent") });
      expect(response.status).toBe(200);
    });

    it("Success (send friend request)", async () => {
      const testUser = { userName: "TestUser1", id: "12345" };
      mocks.getUserByEmail.mockImplementationOnce(async () => testUser);
      const response = await request(app).post(inviteUrl).send(testSendData);

      expect(response.body).toEqual({ message: t("invitationSent") });
      expect(response.status).toBe(200);
    });

    it("Wrong data - without friend email", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userEmail, ...restData } = testSendData;
      const response = await request(app)
        .post(inviteUrl)
        .send({ ...restData });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - without user id", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...restData } = testSendData;
      const response = await request(app)
        .post(inviteUrl)
        .send({ ...restData });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error", async () => {
      const errMsg = "Test inviteUser error";
      mocks.getUserByEmail.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).post(inviteUrl).send(testSendData);

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("approveFriendship", () => {
    const friendId = "012345";
    const userId = "123456";
    const testUser = { id: userId };
    const approveUrl = `/api/users/${friendId}/friendship/request`;

    it("Success", async () => {
      mocks.approveFriendRequest.mockImplementationOnce(async () => testUser);

      const response = await request(app).put(approveUrl).send({ userId });

      expect(response.body).toEqual({ message: t("friendRequestApproved") });
      expect(response.status).toBe(200);
    });

    it("Wrong data - user doesn't exist", async () => {
      mocks.approveFriendRequest.mockImplementationOnce(async () => null);

      const response = await request(app).put(approveUrl).send({ userId });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Wrong data - no user id", async () => {
      const response = await request(app).put(approveUrl).send({});

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error", async () => {
      const errMsg = "Test approveFriendship error";
      mocks.approveFriendRequest.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).put(approveUrl).send({ userId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("declineFriendship", () => {
    const friendId = "012345";
    const userId = "123456";
    const testUser = { id: userId };
    const declineUrl = `/api/users/${friendId}/friendship/request`;

    it("Success", async () => {
      mocks.declineFriendRequest.mockImplementationOnce(async () => testUser);
      const response = await request(app).delete(declineUrl).send({ userId });

      expect(response.body).toEqual({ message: t("friendRequestDeclined") });
      expect(response.status).toBe(200);
    });

    it("Wrong data", async () => {
      mocks.declineFriendRequest.mockImplementationOnce(async () => null);

      const response = await request(app).delete(declineUrl).send({ userId });

      expect(response.body).toEqual({ message: t("wrongData") });
      expect(response.status).toBe(400);
    });

    it("Error", async () => {
      const errMsg = "Test declineFriendship error";
      mocks.declineFriendRequest.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).delete(declineUrl).send({ userId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("deleteUsers", () => {
    const deleteFewUrl = "/api/users/few/friendship";
    const friendIds = ["012345", "012346"];
    const friendList = [
      { id: "012345", userName: "Friend1" },
      { id: "012346", userName: "Friend2" },
    ];
    const userId = "123458";

    it("Success", async () => {
      mocks.deleteFriends.mockImplementationOnce(async () =>
        friendList.map((fr) => fr.userName)
      );

      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.owner,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.buyer,
            name: "Card 2",
            isDone: false,
          },
        ];
      });
      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.buyer,
            name: "Card 2",
            isDone: false,
          },
        ];
      });
      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.owner,
            name: "Card 2",
            isDone: false,
          },
        ];
      });

      const response = await request(app)
        .delete(deleteFewUrl)
        .send({ userId, friendIds });

      expect(response.body).toEqual({
        message: t("usersHaveBeenDeleted", {
          users: friendList.map((el) => el.userName).join(", "),
        }),
      });
      expect(response.status).toBe(200);
    });

    it("Success only one", async () => {
      const oneFriendArr = [{ ...friendList[0] }];
      mocks.deleteFriends.mockImplementationOnce(async () =>
        oneFriendArr.map((fr) => fr.userName)
      );
      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.owner,
            name: "Card 2",
            isDone: false,
          },
        ];
      });
      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 3",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.buyer,
            name: "Card 4",
            isDone: false,
          },
        ];
      });
      const response = await request(app)
        .delete(deleteFewUrl)
        .send({ userId, friendIds: [oneFriendArr.map((el) => el.id)] });

      expect(response.body).toEqual({
        message: t("usersHaveBeenDeleted", {
          users: oneFriendArr.map((el) => el.userName).join(", "),
        }),
      });
      expect(response.status).toBe(200);
    });

    it("Wrong data - no users id", async () => {
      const response = await request(app).delete(deleteFewUrl).send({ userId });

      expect(response.body).toEqual({
        message: t("wrongData"),
      });
      expect(response.status).toBe(400);
    });

    it("Error - no user in result", async () => {
      const errMsg = t("sorrySomethingWentWrongTryAgain");
      mocks.deleteFriends.mockImplementationOnce(async () => null);

      const response = await request(app)
        .delete(deleteFewUrl)
        .send({ userId, friendIds });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });

    it("Error - no cards in result", async () => {
      const errMsg = t("sorrySomethingWentWrongTryAgain");
      mocks.deleteFriends.mockImplementationOnce(async () =>
        friendList.map((fr) => fr.userName)
      );

      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.owner,
            name: "Card 2",
            isDone: false,
          },
        ];
      });
      mocks.getUserCards.mockImplementationOnce(async () => null);
      mocks.getUserCards.mockImplementationOnce(async () => null);

      const response = await request(app)
        .delete(deleteFewUrl)
        .send({ userId, friendIds });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });

    it("Error", async () => {
      const errMsg = t("sorrySomethingWentWrongTryAgain");
      mocks.deleteFriends.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );
      mocks.deleteFriends.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app)
        .delete(deleteFewUrl)
        .send({ userId, friendIds });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });

  describe("deleteUser", () => {
    const userId = "123456";
    const friendId = "012347";
    const friendObj = {
      id: friendId,
      userName: "Test Friend",
    };
    const deleteUrl = `/api/users/${friendId}/friendship`;

    it("Success", async () => {
      mocks.deleteFriend.mockImplementationOnce(async () => friendObj.userName);

      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.owner,
            name: "Card 2",
            isDone: false,
          },
        ];
      });
      mocks.getUserCards.mockImplementationOnce(async () => {
        return [
          {
            id: "987654321",
            userRole: UserRole.buyer,
            name: "Card 1",
            isDone: false,
          },
          {
            id: "987654322",
            userRole: UserRole.buyer,
            name: "Card 2",
            isDone: false,
          },
        ];
      });

      const response = await request(app).delete(deleteUrl).send({ userId });

      expect(response.body).toEqual({
        message: t("userHasBeenDeleted", { userName: friendObj.userName }),
      });
      expect(response.status).toBe(200);
    });

    it("Wrong data - no userId", async () => {
      const response = await request(app).delete(deleteUrl).send({});

      expect(response.body).toEqual({
        message: t("wrongData"),
      });
      expect(response.status).toBe(400);
    });

    it("Error - no user in result", async () => {
      const errMsg = t("sorrySomethingWentWrongTryAgain");
      mocks.deleteFriend.mockImplementationOnce(async () => null);

      const response = await request(app).delete(deleteUrl).send({ userId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });

    it("Error", async () => {
      const errMsg = t("sorrySomethingWentWrongTryAgain");
      mocks.deleteFriend.mockImplementationOnce(
        async () =>
          new Promise((_resolve, reject) => {
            reject(errMsg);
          })
      );

      const response = await request(app).delete(deleteUrl).send({ userId });

      expect(response.body).toEqual({ message: errMsg });
      expect(response.status).toBe(500);
    });
  });
});
