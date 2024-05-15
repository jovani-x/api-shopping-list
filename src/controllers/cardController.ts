import { ICard } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";

import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from "../services/cardServices.js";

export const hasCardType = (card: any): card is ICard => {
  return typeof card === "object" && card.name && typeof card.name === "string";
};

const cardController = {
  getAllCards: async (_req, res) => {
    try {
      const resObj = await getAllCards();
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

    try {
      if (newCard && hasCardType(newCard)) {
        const resCard = await createCard(newCard);
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
