import bcrypt from 'bcryptjs';
import config from 'config';
import { Request, Response, Router } from 'express';
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    let user: IUser | null = await UserModel.findOne({ email });
    console.log(user);

    if (user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
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
});
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
});
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

export default router;
