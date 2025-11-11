import { FileModel } from "./file-model.interface";

export interface IProductModel{
  id: string;
  title: string;
  price: number;
  priceNew: number;
  points: number;
  state: boolean;
  stock: number;
  file: number;
  quantity?: number;
  file_image: FileModel;
  discounts: IProductDiscounModel[];
}

export interface IProductDiscounModel{
  pack_id: string;
  product_id: string;
  discount: string;
}
