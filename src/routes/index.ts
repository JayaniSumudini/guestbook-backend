import { Router } from 'express';

import comments from './comments.route';
import users from './users.route';

const router = Router();

router.use('/comments', comments);
router.use('/users', users);

export default router;
