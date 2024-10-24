import type { Request, Response } from "express";
import {
  getUserFriends,
  getUserById,
  getUserByEmail,
  deleteUser as deleteFriend,
  deleteUsers as deleteFriends,
  sendInvitation,
  sendFriendRequest,
  approveFriendRequest,
  declineFriendRequest,
  getUserRequests,
} from "@/services/friendServices.js";
import { t } from "i18next";
import { UserRequest, UserRole, ICard } from "@/data/types.js";
import { getUserCards, removeCardFromUser } from "@/services/cardServices.js";
import { dbConnection } from "@/../app.js";

type UserCardsData = {
  id: string; // userId
  cards: ICard[];
  cardsToRemove: string[]; // card ids
};

const friendController = {
  // friend list
  getAllUsers: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;

    try {
      const resObj = await getUserFriends({ ownerId });
      return res.status(200).json(resObj);
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  getUser: async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
      const user = await getUserById({ id: userId });
      if (!user) {
        return res.status(404).json({
          message: t("userWithIdDoesnotExist", { id: userId }),
        });
      }

      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  // one user
  deleteUser: async (req: Request, res: Response) => {
    const userId = req.params.id;
    const ownerId = req.body.userId;

    if (!userId || !ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    const session = await dbConnection.startSession();
    session.startTransaction();

    try {
      // delete user
      const user = await deleteFriend(userId, ownerId);
      if (!user) {
        await session.abortTransaction();
        return res
          .status(500)
          .json({ message: t("sorrySomethingWentWrongTryAgain") });
      }

      // stop sharing cards with user
      const [userCards, ownerCards] = await Promise.all([
        await getUserCards({ ownerId: userId }),
        await getUserCards({ ownerId }),
      ]);
      const userCardsToRemove: string[] = [];
      const ownerCardsToRemove: string[] = [];
      userCards.map((userCard) => {
        const { id } = userCard;

        ownerCards.map((ownerCard) => {
          if (ownerCard.id === id) {
            if (userCard.userRole === UserRole.buyer) {
              userCardsToRemove.push(id);
            }
            if (ownerCard.userRole === UserRole.buyer) {
              ownerCardsToRemove.push(id);
            }
          }
        });
      });

      await Promise.all([
        await removeCardFromUser({
          userId,
          cardIds: userCardsToRemove,
        }),
        await removeCardFromUser({
          userId: ownerId,
          cardIds: ownerCardsToRemove,
        }),
      ]);

      await session.commitTransaction();
      await session.endSession();

      return res.status(200).json({
        message: t("userHasBeenDeleted", { userName: user.userName }),
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(500).json({
        message: err,
      });
    }
  },
  // a few users
  deleteUsers: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;
    const userIds = req.body.friendIds as string[];

    if (!userIds || !userIds?.length) {
      return res.status(400).json({ message: t("wrongData") });
    }

    const session = await dbConnection.startSession();
    session.startTransaction();

    try {
      // delete users
      const users = (await deleteFriends(userIds, ownerId)) as unknown as {
        userName: string;
      }[];

      if (!users || !users?.length) {
        await session.abortTransaction();
        return res
          .status(500)
          .json({ message: t("sorrySomethingWentWrongTryAgain") });
      }

      // stop sharing cards with users
      const userPromise = (id: string) =>
        new Promise((resolve, reject) => {
          getUserCards({ ownerId: id }).then((userCards) => {
            if (userCards) {
              resolve({ id, cards: userCards, cardsToRemove: [] });
            } else {
              reject(t("sorrySomethingWentWrongTryAgain"));
            }
          });
        });

      const ownerCards = await getUserCards({ ownerId });

      const usersCards = (await Promise.all(
        userIds.map((id) => userPromise(id))
      )) as UserCardsData[];

      const ownerCardsToRemove: string[] = [];
      usersCards.map((userItem) => {
        const id = userItem?.id;

        userItem?.cards.map((userCard) => {
          ownerCards.map((ownerCard) => {
            if (ownerCard.id === id) {
              if (userCard.userRole === UserRole.buyer) {
                userItem.cardsToRemove.push(id);
              }
              if (ownerCard.userRole === UserRole.buyer) {
                ownerCardsToRemove.push(id);
              }
            }
          });
        });
      });

      await removeCardFromUser({
        userId: ownerId,
        cardIds: ownerCardsToRemove,
      });

      await Promise.all(
        usersCards.map((userItem) =>
          removeCardFromUser({
            userId: userItem.id,
            cardIds: userItem.cardsToRemove,
          })
        )
      );

      await session.commitTransaction();
      await session.endSession();

      return res.status(200).json({
        message: t("usersHaveBeenDeleted", { users: users.join(", ") }),
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();

      return res.status(500).json({
        message: err,
      });
    }
  },
  inviteUser: async (req: Request, res: Response) => {
    const newUserEmail = req.body.userEmail;
    const ownerId = req.body.userId;
    const text = req.body.messageText;

    if (!newUserEmail || !ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const user = await getUserByEmail({ email: newUserEmail });

      // user with such email doesn't exist in db - sendInvitation
      // exists - sendFriendRequest
      if (!user) {
        await sendInvitation({
          email: newUserEmail,
          fromUserId: ownerId,
          text,
        });
      } else {
        await sendFriendRequest({
          email: newUserEmail,
          fromUserId: ownerId,
          text,
        });
      }

      return res.status(200).json({ message: t("invitationSent") });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  approveFriendship: async (req: Request, res: Response) => {
    const fromUserId = req.params.id;
    const ownerId = req.body.userId;

    try {
      const reqAns = await approveFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: t("wrongData") });
      }

      return res.status(200).json({ message: t("friendRequestApproved") });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  declineFriendship: async (req: Request, res: Response) => {
    const fromUserId = req.params.id;
    const ownerId = req.body.userId;

    try {
      const reqAns = await declineFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: t("wrongData") });
      }

      return res.status(200).json({ message: t("friendRequestDeclined") });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  getUserRequests: async (req: Request, res: Response) => {
    // all requests or certain type
    const type = req.params.type;
    const ownerId = req.body.userId;
    const typeKey = !type
      ? undefined
      : Object.entries(UserRequest).filter(
          ([_key, value]) => value === type
        )?.[0][0];

    if (!ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const data = await getUserRequests(
        ownerId,
        !typeKey ? undefined : UserRequest[typeKey as keyof typeof UserRequest]
      );
      return res.status(200).json({ requests: data });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
};

export default friendController;
