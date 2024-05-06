import bcrypt from 'bcryptjs';
import config from 'config';
import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/userModel';
import Payload from '../types/payloadType';

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      let user: IUser | null = await UserModel.findOne({ email });
      if (!user) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          errors: [
            {
              msg: 'User not found',
            },
          ],
        });
      }

      if (user.isDeleted) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'User profile is deleted',
            },
          ],
        });
      }
      if (user.isBanned) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'User profile is banned by admin',
            },
          ],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          errors: [
            {
              msg: 'Invalid Credentials',
            },
          ],
        });
      }

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
    } catch (err: any) {
      console.error(err.message);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
  }

  async identity(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: 'Invalid Auth Token',
            },
          ],
        });
      }
      const decoded = jwt.verify(token, config.get('jwtSecret'));
      console.log(decoded);
      const userId = (decoded as Payload).userId;
      const user = await UserModel.findById(userId).select('-password');
      return res.status(HttpStatusCodes.OK).json({
        user,
      });
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async changePassword(req: Request, res: Response) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: 'Invalid Auth Token',
          },
        ],
      });
    }
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    console.log(decoded);
    const userId = (decoded as Payload).userId;

    const { oldPassword, newPassword } = req.body;

    const user: IUser | null = await UserModel.findById(userId);
    if (!user) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        errors: [
          {
            msg: 'User not found',
          },
        ],
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: 'Invalid Credentials',
          },
        ],
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();
    return res.status(HttpStatusCodes.OK).json({ msg: 'Password changed successfully' });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const user: IUser | null = await UserModel.findOne({ email });
    if (!user) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        errors: [
          {
            msg: 'User not found',
          },
        ],
      });
    }

    //TODO: Send email to user in email
    const jwtResetPasswordSecret: string = config.get('jwtResetPasswordSecret');
    const token = jwt.sign({ userId: user.id }, jwtResetPasswordSecret, { expiresIn: '5m' });

    return res.status(HttpStatusCodes.OK).json({ resetPasswordToken: token });
  }

  async resetPassword(req: Request, res: Response) {
    const { newPassword, resetPasswordToken } = req.body;

    const decoded = jwt.verify(resetPasswordToken, config.get('jwtResetPasswordSecret'));
    const userId = (decoded as Payload).userId;

    const user: IUser | null = await UserModel.findOne({ userId });
    if (!user) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        errors: [
          {
            msg: 'User not found',
          },
        ],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();
    return res.status(HttpStatusCodes.OK).json({ msg: 'Password reset successfully' });
  }
}
