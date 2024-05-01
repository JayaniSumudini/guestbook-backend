import { Router } from 'express';

import comments from './comments.route';

const router = Router();

router.use('/comments', comments);

export default router;