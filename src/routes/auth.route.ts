import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import HttpStatusCodes from 'http-status-codes';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

export default router;

//login as a user and get access token
router.post(
  '/login',
  [check('email', 'Please include a valid email').isEmail(), check('password', 'Password is required').exists()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await authController.login(req, res);
  },
);

//Get authenticated user using the token
router.get('/identity', async (req: Request, res: Response) => {
  await authController.identity(req, res);
});

//change password as logged in user
router.put(
  '/changePassword',
  [check('oldPassword', 'Password is required').exists(), check('newPassword', 'Password is required').exists()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await authController.changePassword(req, res);
  },
);

//request forgot password as a user
router.post(
  '/forgotPassword',
  [check('email', 'Please include a valid email').isEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await authController.forgotPassword(req, res);
  },
);

//reset password with new password and otp validation
router.put(
  '/resetPassword',
  [
    check('newPassword', 'Password is required').exists(),
    check('resetPasswordToken', 'Reset password token is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    await authController.resetPassword(req, res);
  },
);
