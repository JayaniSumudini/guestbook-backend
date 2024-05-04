import { IUser } from '../models/userModel';
import { UserType } from './userType';

export type Comment = {
  content: string;
  user: CommentUserDetails;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
};

export type CommentUserDetails = {
  userType: UserType;
  id?: IUser['_id'];
  name?: string;
};
