import { Router } from 'express';

import comments from './comments.route';
import users from './users.route';
import auth from './auth.route';

const router = Router();

router.use('/comments', comments);
router.use('/users', users);
router.use('/auth', auth);

export default router;
