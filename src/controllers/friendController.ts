import type { Request, Response } from "express";
import {
  getUserFriends,
  getUserById,
  getUserByEmail,
  deleteUser,
  sendInvitation,
  sendFriendRequest,
  approveFriendRequest,
  declineFriendRequest,
  getUserRequests,
} from "@/services/friendServices.js";
import { t } from "i18next";
import { UserRequest, UserRole } from "@/data/types.js";
import { getUserCards, removeCardFromUser } from "@/services/cardServices.js";

const friendController = {
  // friend list
  getAllUsers: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;

    try {
      const resObj = await getUserFriends({ ownerId });
      res.status(200).json(resObj);
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  getUser: async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const user = await getUserById({ id: userId });
      if (!user) {
        return res.status(404).json({
          message: t("userWithIdDoesnotExist", { id: userId }),
        });
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({
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

    try {
      const user = await deleteUser(userId, ownerId);
      if (!user) {
        return res.status(400).json({ message: t("wrongData") });
      }

      // delete cards
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
        await removeCardFromUser({ userId, cardIds: userCardsToRemove }),
        await removeCardFromUser({
          userId: ownerId,
          cardIds: ownerCardsToRemove,
        }),
      ]);

      res.status(200).json({
        message: t("userHasBeenDeleted", { userName: user.userName }),
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  // a few users
  deleteUsers: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;
    const userIds = req.body.friendIds;

    if (!userIds || !userIds?.length) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const result = await Promise.all(
        userIds.map(async (userId: string) => {
          const user = await deleteUser(userId, ownerId);
          if (!user) {
            return res.status(400).json({ message: t("wrongData") });
          }
          return user;
        })
      );

      res.status(200).json({
        message: t("usersHaveBeenDeleted", {
          users: result.map((el) => el.userName).join(", "),
        }),
      });
    } catch (err) {
      res.status(500).json({
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

      res.status(200).json({ message: t("invitationSent") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  becomeFriend: async (req: Request, res: Response) => {
    const newUserEmail = req.body.userEmail;
    const ownerId = req.body.userId;
    const text = req.body.messageText;

    if (!newUserEmail || !ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      await sendFriendRequest({
        email: newUserEmail,
        fromUserId: ownerId,
        text,
      });
      res.status(200).json({ message: t("friendRequestSent") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  approveFriendship: async (req: Request, res: Response) => {
    const fromUserId = req.params.id;
    const ownerId = req.body.userId;

    if (!fromUserId || !ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const reqAns = await approveFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: t("wrongData") });
      }

      res.status(200).json({ message: t("friendRequestApproved") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  declineFriendship: async (req: Request, res: Response) => {
    const fromUserId = req.params.id;
    const ownerId = req.body.userId;

    if (!fromUserId || !ownerId) {
      return res.status(400).json({ message: t("wrongData") });
    }

    try {
      const reqAns = await declineFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: t("wrongData") });
      }

      res.status(200).json({ message: t("friendRequestDeclined") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  getUserRequests: async (req: Request, res: Response) => {
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
      res.status(200).json({ requests: data });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
};

export default friendController;
