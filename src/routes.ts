import { Router, Request, Response } from 'express';
import { registerUser } from './controllers/authController';

const router: Router = Router();

// Welcome route
router.get('/', (req: Request, res: Response) => {
   res.status(200).send('Hello Travelers!');
})

// Auth routes
router.post('/user/register', registerUser);
/* router.post('/user/login', loginUser); */

export default router;