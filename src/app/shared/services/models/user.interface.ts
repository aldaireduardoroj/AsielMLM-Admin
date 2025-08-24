import { FileModel } from "./file-model.interface";
import { PaymentLog } from "./payment-log.interface";

export interface UserModel {
  id: number;
  name: string;
  email: string;
  dni: string;
  uuid: string;
  address: string;
  phone: string;
  file: FileModel;
  created_at: string;
  payment: PaymentLog;
  city: string;
  genger: string;
  country: string;
  podints: UserPoint;
  range?: RangeModel;
  creatxlssed: string;
  is_admin?: boolean;
}

export interface AuthModel{
  name: string;
  token: string;
  photo: string;
  uuid?: string;
  validation?: string;
  admin: boolean;
}

export interface UserPoint{
  compra: number;
  patrocinio: number;
  personal: number;
  pointGroup: number;
  residual: number;
  infinito: number;
  pointAfiliado: number;
  personalGlobal: number;
}

export interface RangeModel{
  title: string;
}
