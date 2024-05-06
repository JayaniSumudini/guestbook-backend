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
    const comments = await CommentModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ comments });
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

      let newComment: Comment = {
        content,
        user: {
          userType: UserType.GUEST,
        },
        createdAt: new Date(),
        isDeleted: false,
      };

      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, config.get('jwtSecret'));
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
        const user = await UserModel.findById(userId).select('-password');
        if (user) {
          newComment.user.userType = userType;
          newComment.user.id = userId;
          newComment.user.name = user.name;
        }
      }

      const comment = new CommentModel(newComment);
      console.log(comment);
      await comment.save();
      res.status(201).json({ commentId: comment.id });
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
      if (userType === UserType.ADMIN) {
        const newComment = await CommentModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.json(newComment);
      } else {
        const comment = await CommentModel.findById(req.params.id);
        if (comment?.user?.id.toString() === userId) {
          const newComment = await CommentModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
          res.json(newComment);
        } else {
          return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            errors: [
              {
                msg: 'Invalid auth token',
              },
            ],
          });
        }
      }
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
    res.status(500).json(error);
  }
});

router.put(
  '/:id',
  [check('content', 'Please include a content with 5 or more characters').isLength({ min: 5 })],
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

        const { userId, userType } = decoded as Payload;
        console.log(userId, userType);
        const { content } = req.body;
        console.log(content);
        if (userType === UserType.ADMIN) {
          const newComment = await CommentModel.findByIdAndUpdate(req.params.id, { content }, { new: true });
          res.json({
            comment: newComment,
          });
        } else {
          const comment = await CommentModel.findById(req.params.id);
          if (comment?.user?.id.toString() === userId) {
            const newComment = await CommentModel.findByIdAndUpdate(req.params.id, { content }, { new: true });
            res.json({
              comment: newComment,
            });
          } else {
            return res.status(HttpStatusCodes.UNAUTHORIZED).json({
              errors: [
                {
                  msg: 'Invalid Auth token',
                },
              ],
            });
          }
        }
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
      res.status(500).json(error);
    }
  },
);

export default router;
