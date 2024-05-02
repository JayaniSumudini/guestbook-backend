import config from 'config';
import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import CommentModel from '../models/commentModel';
import UserModel from '../models/userModel';
import { Comment } from '../types/commentType';
import Payload from '../types/payloadType';
import { UserType } from '../types/userType';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const comments = await CommentModel.find({ isDeleted: false });
    res.json(comments);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json(error);
  }
});
router.post(
  '/',
  [check('content', 'Please include a content with 5 or more characters').isLength({ min: 5 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    try {
      const { content } = req.body;
      console.log(content);
      let newComment: Comment = {
        content,
        userType: UserType.GUEST,
        createdAt: new Date(),
        isDeleted: false,
      };

      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        console.log(decoded);
        const userId = (decoded as Payload).userId;
        const user = await UserModel.findById(userId).select('-password');
        if (user) {
          newComment.userType = UserType.USER;
          newComment.userId = userId;
        }
      }

      const comment = new CommentModel(newComment);
      console.log(comment);
      await comment.save();
      res.status(201).json(comment.id);
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json(error);
    }
  },
);
// router.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const comment = await CommentModel.findById(req.params.id);
//     res.json(comment);
//   } catch (error) {
//     console.error('An error occurred:', error);
//     res.status(500).json(error);
//   }
// });
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const comment = await CommentModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json(comment);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json(error);
  }
});
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const comment = await CommentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(comment);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json(error);
  }
});

export default router;
