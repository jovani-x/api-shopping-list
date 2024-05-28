import { ICard, UserRole } from "@/data/types.js";
import { Card } from "@/models/Card.js";
import { User } from "@/models/User.js";

export const getAllCards = async (cardIds: string[]) =>
  await Card.find({ _id: { $in: cardIds } });

export const getCardById = async (id: string) => await Card.findById(id);

export const createCard = async (newCard: ICard, userId?: string) => {
  const resCard = await Card.create(newCard);
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      $push: {
        cards: {
          cardId: resCard.id,
          role: UserRole.owner,
        },
      },
    });
  }

  return resCard;
};

export const updateCard = async (id: string, newCard: ICard) =>
  await Card.findByIdAndUpdate(id, newCard, { new: true });

export const deleteCard = async (id: string) =>
  await Card.findByIdAndDelete(id);
