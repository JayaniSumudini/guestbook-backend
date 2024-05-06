import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import { CommentController } from '../controllers/commentController';

const router = Router();
const commentController = new CommentController();

router.get('/', async (req: Request, res: Response) => {
  await commentController.getAllComments(req, res);
});

router.post(
  '/',
  [check('content', 'Please include a content with 5 or more characters').isLength({ min: 5 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await commentController.saveNewComment(req, res);
  },
);

router.delete('/:id', async (req: Request, res: Response) => {
  await commentController.deleteCommentById(req, res);
});

router.put(
  '/:id',
  [check('content', 'Please include a content with 5 or more characters').isLength({ min: 5 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await commentController.updateCommentById(req, res);
  },
);

export default router;
