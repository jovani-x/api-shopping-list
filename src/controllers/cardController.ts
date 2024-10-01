import type { Request, Response } from "express";
import { ICard } from "@/data/types.js";
import {
  getUserCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  addCardToUser,
  removeCardFromUser,
} from "@/services/cardServices.js";
import { getUserById } from "@/services/friendServices.js";
import { t } from "i18next";

export const hasCardType = (card: unknown): card is ICard => {
  return (
    typeof card === "object" &&
    card !== null &&
    "name" in card &&
    typeof card.name === "string"
  );
};

const cardController = {
  getAllCards: async (req: Request, res: Response) => {
    const ownerId = req.body.userId;

    try {
      const resultData = await getUserCards({ ownerId });
      return res.status(200).json(resultData);
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  getCard: async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const ownerId = req.body.userId;

    try {
      const trCard = await getCardById(cardId);
      if (!trCard) {
        return res.status(404).json({
          message: t("cardWithIdDoesnotExist", { id: cardId }),
        });
      }
      const owner = await getUserById({
        id: ownerId,
        selectFields: ["cards"],
      });

      const userRole = owner?.cards.find(
        (card) => card.cardId === trCard.id
      )?.role;
      return res.status(200).json({ card: { ...trCard, userRole } });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  createCard: async (req: Request, res: Response) => {
    const newCard = req.body.card;
    const ownerId = req.body.userId;

    try {
      if (newCard && hasCardType(newCard)) {
        const resCard = await createCard(newCard, ownerId);
        return res.status(201).json({ card: resCard });
      } else {
        return res.status(400).json({ message: t("wrongData") });
      }
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  updateCard: async (req: Request, res: Response) => {
    const cardId = req.params.id;

    const newCardAttrs = req.body.card;
    try {
      const updatedCard = await updateCard(cardId, newCardAttrs);
      return res.status(200).json({ card: updatedCard });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  deleteCard: async (req: Request, res: Response) => {
    const cardId = req.params.id;

    try {
      const card = await deleteCard(cardId);
      return res.status(200).json({ card });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  addCardToUser: async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.body.targetUserId;
    const userRole = req.body?.targetUserRole;

    try {
      if (cardId && userId) {
        const resCardId = await addCardToUser({
          cardId,
          userId,
          role: userRole,
        });
        return res.status(201).json({ cardId: resCardId });
      } else {
        return res.status(400).json({ message: t("wrongData") });
      }
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
  removeCardFromUser: async (req: Request, res: Response) => {
    const cardId = req.params.id;
    const userId = req.body.targetUserId;

    try {
      if (cardId && userId) {
        const resCardId = await removeCardFromUser({
          userId,
          cardIds: [cardId],
        });
        return res.status(200).json({ cardId: resCardId });
      } else {
        return res.status(400).json({ message: t("wrongData") });
      }
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  },
};

export default cardController;
