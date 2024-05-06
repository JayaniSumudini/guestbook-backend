import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();
//get all users
router.get('/', async (req: Request, res: Response) => {
  await userController.getAllUsers(req, res);
});

// register new user
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('name', 'Please enter a name').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await userController.registerNewUser(req, res);
  },
);

//updata username
router.put(
  '/',
  [check('username', 'Please include a content with 5 or more characters').isLength({ min: 5, max: 25 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await userController.updateUsername(req, res);
  },
);

//delete user by id as an admin
router.delete('/:id', async (req: Request, res: Response) => {
  await userController.deleteUserById(req, res);
});

//delete profile using token as user
router.delete('/', async (req: Request, res: Response) => {
  await userController.deleteUser(req, res);
});

//ban user by id as an admin
router.put('/:id', async (req: Request, res: Response) => {
  await userController.updateUserById(req, res);
});

export default router;
