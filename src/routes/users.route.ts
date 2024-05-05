import bcrypt from 'bcryptjs';
import config from 'config';
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/userModel';
import Payload from '../types/payloadType';
import { User, UserType } from '../types/userType';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('name', 'Please enter a name').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

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

      res.status(HttpStatusCodes.CREATED).json({
        accessToken: token,
      });
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },
);
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});
router.put(
  '/',
  [check('username', 'Please include a content with 5 or more characters').isLength({ min: 5, max: 25 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
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
        res.json(user);
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
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },
);
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true }).select(
      '-password',
    );
    res.json(user);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});

router.delete('/', async (req: Request, res: Response) => {
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
      res.json(user);
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
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});

export default router;
