import { Router, Request, Response } from 'express';

// Controllers
import { loginUser, registerUser } from './controllers/authController';
import { createPermission, getAllPermissions } from './controllers/permissionController';
import { createRole, getAllRoles } from './controllers/roleController';

const router: Router = Router();

// Welcome route
router.get('/', (req: Request, res: Response) => {
   res.status(200).send('Hello Travelers!');
})

// AUTHENTICATION routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// ROLE routes
router.post('/roles', createRole);
router.get('/roles', getAllRoles);


// PERMISSION routes
router.post('/permissions', createPermission);
router.get('/permissions', getAllPermissions);

export default router;