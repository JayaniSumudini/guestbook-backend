import bcrypt from 'bcryptjs';
import config from 'config';
import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/userModel';
import Payload from '../types/payloadType';
import { User, UserType } from '../types/userType';

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
          console.log(decoded);
        } catch (error) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }

        const { userId, userType } = decoded as Payload;
        if (userType !== UserType.ADMIN) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }
        const users = await UserModel.find({ userType: UserType.USER }).select('-password').sort({ createdAt: -1 });
        return res.status(HttpStatusCodes.OK).json({ users });
      } else {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Auth token is required',
            },
          ],
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async registerNewUser(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      console.log(name, email, password);
      let user: IUser | null = await UserModel.findOne({ email });

      console.log(user);

      if (user) {
        if (user.isDeleted || user.isBanned) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            message: 'User already exists.Please contact Admin to enable your profileS',
            errorCode: 1100,
          });
        } else {
          return res.status(HttpStatusCodes.BAD_REQUEST).json({
            message: 'User already exists',
            errorCode: 1100,
          });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const newUser: User = {
        name,
        email,
        password: hashed,
        userType: UserType.USER,
        createdAt: new Date(),
      };

      user = new UserModel(newUser);
      console.log(user);
      await user.save();

      await user.save();

      const payload: Payload = {
        userId: user.id,
        userType: user.userType,
      };

      const jwtSecret: string = config.get('jwtSecret');
      console.log(jwtSecret);
      const expiresIn: string = config.get('jwtExpiration');
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn,
      });

      return res.status(HttpStatusCodes.CREATED).json({
        accessToken: token,
      });
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async updateUsername(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
          console.log(decoded);
        } catch (error) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }

        const userId = (decoded as Payload).userId;
        const { username } = req.body;

        const user = await UserModel.findByIdAndUpdate(userId, { name: username }, { new: true }).select('-password');
        return res.status(HttpStatusCodes.OK).json(user);
      } else {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Auth token is required',
            },
          ],
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async deleteUserById(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
          console.log(decoded);
        } catch (error) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }

        const { userId, userType } = decoded as Payload;
        if (userType !== UserType.ADMIN) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }
        const user = await UserModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true }).select(
          '-password',
        );
        return res.status(HttpStatusCodes.OK).json({ user });
      } else {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Auth token is required',
            },
          ],
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
          console.log(decoded);
        } catch (error) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }

        const userId = (decoded as Payload).userId;
        const user = await UserModel.findByIdAndUpdate(userId, { isDeleted: true }, { new: true }).select('-password');
        return res.status(HttpStatusCodes.OK).json(user);
      } else {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Auth token is required',
            },
          ],
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async updateUserById(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
          console.log(decoded);
        } catch (error) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }

        const { userId, userType } = decoded as Payload;
        if (userType !== UserType.ADMIN) {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid Auth token',
              },
            ],
          });
        }
        const { isBanned } = req.body;
        const user = await UserModel.findByIdAndUpdate(req.params.id, { isBanned }, { new: true }).select('-password');
        return res.status(HttpStatusCodes.OK).json({ user });
      } else {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Auth token is required',
            },
          ],
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}
