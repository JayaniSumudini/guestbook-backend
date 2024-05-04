
export type User = {
  email: string;
  password: string;
  name: string;
  userType: UserType;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
  isBanned?: boolean;
};

export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
