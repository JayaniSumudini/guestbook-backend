import { Request, Response, Router } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
      res.status(201).json("Comment added successfully");    
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json(error);
  }
});

export default router;