import { IUser } from '../models/userModel';
import { UserType } from './userType';

export type Comment = {
  content: string;
  userType: UserType;
  userId?: IUser["_id"];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
};
