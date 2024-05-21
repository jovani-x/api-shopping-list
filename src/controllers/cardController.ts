import { ICard } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";

import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from "../services/cardServices.js";
import { getUserById } from "../services/friendServices.js";

export const hasCardType = (card: any): card is ICard => {
  return typeof card === "object" && card.name && typeof card.name === "string";
};

const cardController = {
  getAllCards: async (req, res) => {
    const ownerId = req.userId;

    try {
      const owner = await getUserById({ id: ownerId, selectFields: ["cards"] });
      const cardIds = owner?.cards.map((el) => el.cardId);
      const resObj = await getAllCards(cardIds);
      res.status(200).json(resObj);
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  getCard: async (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;
    try {
      const card = await getCardById(cardId);
      if (!card) {
        return res.status(404).json({
          message: getTranslation("cardWithIdDoesnotExist", { id: cardId }),
        });
      }

      res.status(200).json({ card: card });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  createCard: async (req, res) => {
    const newCard = req.body.card;
    const ownerId = req.userId;

    try {
      if (newCard && hasCardType(newCard)) {
        const resCard = await createCard(newCard, ownerId);
        return res.status(201).json({ card: resCard });
      } else {
        return res.status(400).json({ message: getTranslation("wrongData") });
      }
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  updateCard: async (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;

    const newCardAttrs = req.body.card;
    try {
      const updatedCard = await updateCard(cardId, newCardAttrs);
      res.status(200).json({ card: updatedCard });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
  deleteCard: async (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;

    try {
      const card = await deleteCard(cardId);
      res.status(200).json({ card });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  },
};

export default cardController;
