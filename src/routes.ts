import { Router, Request, Response } from 'express';

// Controllers
import { loginUser, registerUser, verifyToken } from './controllers/authController';
import { createPermission, getAllPermissions } from './controllers/permissionController';
import { createRole, getAllRoles } from './controllers/roleController';

const router: Router = Router();

// Welcome route
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - App Routes
 *     summary: Health check
 *     description: Basic route to check if the API is up and running.
 *     responses: 
 *       200:
 *         description: Server is up and running.
 */
router.get('/', (req: Request, res: Response) => {
   res.status(200).send('Hello Travelers!');
})

// AUTHENTICATION routes
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - User Routes
 *     summary: Register a new user
 *     description: Takes a user object in the body and registers a new user in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201: 
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 _id:
 *                   type: string
 */
router.post('/user/register', registerUser);
/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User Routes
 *     summary: Login a user
 *     description: Takes a user object in the body and logs in a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200: 
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     token:
 *                       type: string
 */
router.post('/user/login', loginUser);

// ROLE routes
/**
 * @swagger
 * /roles:
 *   post:
 *     tags:
 *       - Role Routes
 *     summary: Create a new role
 *     description: |
 *       Takes a role object in the body and creates a role in the database.
 *       (Note: for no permissions pass an empty array)
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUnpopulated'
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RoleUnpopulated'
 */
router.post('/roles', verifyToken, createRole);
/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - Role Routes
 *     summary: Get all roles
 *     description: |
 *       Get all roles populated with permissions if populate parameter is true, else permission ids are returned.
 *     parameters:
 *       - name: populate
 *         in: query
 *         required: true
 *         description: Populate the permissions in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Role(s) retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePopulated'
 */
router.get('/roles', getAllRoles);


// PERMISSION routes
/**
 * @swagger
 * /permissions:
 *   post:
 *     tags:
 *       - Permission Routes
 *     summary: Create a new permission
 *     description: Takes a permission object in the body and creates a permission in the database.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Permission'
 *     responses:
 *       201:
 *         description: Permission created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 */
router.post('/permissions', verifyToken, createPermission);
/**
 * @swagger
 * /permissions:
 *   get:
 *     tags:
 *       - Permission Routes
 *     summary: Get all permissions
 *     description: Get all permissions as JSON obejects in an array.
 *     responses:
 *       200:
 *         description: Permission(s) retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 */
router.get('/permissions', getAllPermissions);

export default router;