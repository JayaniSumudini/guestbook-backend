import bcrypt from 'bcryptjs';
import config from 'config';
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/userModel';
import Payload from '../types/payloadType';

const router = Router();

export default router;

//login user and get token
router.post(
  '/login',
  [check('email', 'Please include a valid email').isEmail(), check('password', 'Password is required').exists()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

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
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
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

      res.status(HttpStatusCodes.CREATED).json({
        accessToken: token,
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
    }
  },
);

//Get authenticated user using the token
router.get('/identity', async (req: Request, res: Response) => {
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
    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});

//logged in user can change password
router.put(
  '/changePassword',
  [check('oldPassword', 'Password is required').exists(), check('newPassword', 'Password is required').exists()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

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
    res.status(HttpStatusCodes.OK).json({ msg: 'Password changed successfully' });
  },
);

//user can request forgot password
router.post(
  '/forgotPassword',
  [check('email', 'Please include a valid email').isEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
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

    res.status(HttpStatusCodes.OK).json({ resetPasswordToken: token });
  },
);

//reset password with new password and otp validation
router.post(
  '/resetPassword',
  [
    check('newPassword', 'Password is required').exists(),
    check('resetPasswordToken', 'Reset password token is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

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
    res.status(HttpStatusCodes.OK).json({ msg: 'Password reset successfully' });
  },
);
