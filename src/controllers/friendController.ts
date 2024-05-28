import type { Request, Response } from "express";
import { getTranslation } from "@/lib/utils.js";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  sendInvitation,
  sendFriendRequest,
  approveFriendRequest,
  declineFriendRequest,
} from "@/services/friendServices.js";

const friendController = {
  // friend list
  getAllUsers: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;

    try {
      const owner = await getUserById({ id: ownerId, selectFields: ["users"] });
      const userIds = owner?.users.map((el) => el.userId.toString()) || [];
      const resObj = await getAllUsers({ userIds });
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
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      const user = await getUserById({ id: userId });
      if (!user) {
        return res.status(404).json({
          message: getTranslation("userWithIdDoesnotExist", { id: userId }),
        });
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  deleteUser: async (req: Request, res: Response) => {
    const userId = req.params.id;
    const ownerId = req.body.userId;

    if (!userId || !ownerId) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      const user = await deleteUser(userId, ownerId);
      if (!user) {
        return res.status(400).json({ message: getTranslation("wrongData") });
      }

      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  inviteUser: async (req: Request, res: Response) => {
    const newUserEmail = req.body.email;
    const ownerId = req.body.userId;

    if (!newUserEmail || !ownerId) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      await sendInvitation(newUserEmail, ownerId);
      res.status(200).json({ message: getTranslation("invitationSent") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  becomeFriend: async (req: Request, res: Response) => {
    const newUserEmail = req.body.userEmail;
    const ownerId = req.body.userId;

    if (!newUserEmail || !ownerId) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      await sendFriendRequest(newUserEmail, ownerId);
      res.status(200).json({ message: getTranslation("friendRequestSent") });
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
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      const reqAns = await approveFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: getTranslation("wrongData") });
      }

      res
        .status(200)
        .json({ message: getTranslation("friendRequestApproved") });
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
      return res.status(400).json({ message: getTranslation("wrongData") });
    }

    try {
      const reqAns = await declineFriendRequest(fromUserId, ownerId);
      if (!reqAns) {
        return res.status(400).json({ message: getTranslation("wrongData") });
      }

      res
        .status(200)
        .json({ message: getTranslation("friendRequestDeclined") });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
};

export default friendController;
