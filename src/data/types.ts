export interface IProduct {
  id: string;
  name: string;
  photo: string | null;
  note: string | null;
  alternatives?: IProduct[];
  got: boolean;
}

export interface ICard {
  id: string;
  name: string;
  notes?: string;
  products?: IProduct[];
  isDone: boolean;
}
