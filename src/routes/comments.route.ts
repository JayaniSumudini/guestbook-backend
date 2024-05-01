import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import CommentModel from '../models/commentModel';
import { Comment } from '../types/commentType';
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
      // TODO: extract user from token
      const { content } = req.body;

      console.log(content);

      const newComment: Comment = {
        content,
        userType: UserType.GUEST,
        createdAt: new Date(),
        isDeleted: false,
      };

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
