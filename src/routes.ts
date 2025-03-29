import { Router, Request, Response } from 'express';

// Controllers
import { registerUser } from './controllers/authController';
import { createPermission, getAllPermissions } from './controllers/permissionController';

const router: Router = Router();

// Welcome route
router.get('/', (req: Request, res: Response) => {
   res.status(200).send('Hello Travelers!');
})

// AUTHENTICATION routes
router.post('/user/register', registerUser);
/* router.post('/user/login', loginUser); */


// PERMISSION routes
router.post('/permissions', createPermission);
router.get('/permissions', getAllPermissions);

export default router;