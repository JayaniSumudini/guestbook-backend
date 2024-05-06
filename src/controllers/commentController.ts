import config from 'config';
import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import CommentModel from '../models/commentModel';
import UserModel from '../models/userModel';
import { Comment } from '../types/commentType';
import Payload from '../types/payloadType';
import { UserType } from '../types/userType';

export class CommentController {
  async getAllComments(req: Request, res: Response) {
    try {
      const comments = await CommentModel.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(HttpStatusCodes.OK).json({ comments });
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  async saveNewComment(req: Request, res: Response) {
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
      return res.status(HttpStatusCodes.CREATED).json({ commentId: comment.id });
    } catch (error) {
      console.error('An error occurred:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async deleteCommentById(req: Request, res: Response) {
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
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  async updateCommentById(req: Request, res: Response) {
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
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}
