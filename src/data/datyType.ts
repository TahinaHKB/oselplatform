export type Clothing = {
  id: string;
  name: string;
  price: number;
  category: string;
  userId: string;
  imageUrl: string;
  color?: string;
};

export type User = {
  id: string;
  username: string;
};

export type Category = {
  id?: string;
  name: string;
};