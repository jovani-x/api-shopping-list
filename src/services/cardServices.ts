import { Card } from "../models/Card.js";
import { ICard } from "../data/types.js";

export const getAllCards = async () => await Card.find();

export const getCardById = async (id: string) => await Card.findById(id);

export const createCard = async (newCard: ICard) => await Card.create(newCard);

export const updateCard = async (id: string, newCard: ICard) =>
  await Card.findByIdAndUpdate(id, newCard);

export const deleteCard = async (id: string) =>
  await Card.findByIdAndDelete(id);
