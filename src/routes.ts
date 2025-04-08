import { Router, Request, Response } from 'express';

// Controllers
import { loginUser, registerUser, verifyToken } from './controllers/authController';
import { getAllPermissions, getPermissionsByQuery } from './controllers/permissionController';
import { createRole, deleteRoleById, getAllRoles, getRolesByQuery, updateRoleById } from './controllers/roleController';
import { createPlace, getAllPlaces, getPlacesByQuery, updatePlaceById, deletePlaceById } from './controllers/placeController';
import { createRecommendation, getAllRecommendations, getRecommendationsByQuery, updateRecommendationById, deleteRecommendationById } from './controllers/recommendationController';
import { createCollection, deleteCollectionById, getAllCollections, updateCollectionById } from './controllers/collectionController';

const router: Router = Router();

/**
 * TODO: getAll, getByQuery, and update on user
 * TODO: place delete, recommendation delete as well
 * TODO: cityImages
 * TODO: countryImages
 * TODO: collections
 * TODO: populate, limit the data we return to only the necessary fields
 * TODO: update function should check name existance same way as create does if create does have it
 */

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

// PLACE routes
/**
 * @swagger
 * /places:
 *   post:
 *     tags:
 *       - Place Routes
 *     summary: Create a new place
 *     description: Takes a place object in the body and creates a place in the database.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       201:
 *         description: Place created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Place'
 */
router.post('/places', verifyToken, createPlace);
/**
 * @swagger
 * /places:
 *   get:
 *     tags:
 *       - Place Routes
 *     summary: Get all places
 *     description: Get all places as JSON obejects in an array.
 *     responses:
 *       200:
 *         description: Place(s) retrieved successfully.
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
 *                     $ref: '#/components/schemas/Place'
 */
router.get('/places', getAllPlaces);
/**
 * @swagger
 * /places/query:
 *   get:
 *     tags:
 *       - Place Routes
 *     summary: Get places by query
 *     description: Get places based on a specific field and value.
 *     parameters:
 *       - name: field
 *         in: query
 *         required: true
 *         description: Field we want to query by
 *         schema:
 *           type: string
 *       - name: value
 *         in: query
 *         required: true
 *         description: Value of the field.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place(s) retrieved successfully.
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
 *                     $ref: '#/components/schemas/Place'
 */
router.get('/places/query', getPlacesByQuery);
/**
 * @swagger
 * /places/{id}:
 *   put:
 *     tags:
 *       - Place Routes
 *     summary: Update a specific place
 *     description: Takes a place object in the body and updates a place in the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the place to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       200:
 *         description: Place updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put('/places/:id', verifyToken, updatePlaceById);
/**
 * @swagger
 * /places/{id}:
 *   delete:
 *     tags:
 *       - Place Routes
 *     summary: Delete a specific place
 *     description: Deletes a place from the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the place to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.delete('/places/:id', verifyToken, deletePlaceById);

// RECOMMENDATION routes
/**
 * @swagger
 * /recommendations:
 *   post:
 *     tags:
 *       - Recommendation Routes
 *     summary: Create a new recommendation
 *     description: Takes a recommendation object in the body and creates a recommendation for a place in the database.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recommendation'
 *     responses:
 *       201:
 *         description: Recommendation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 */
router.post('/recommendations', verifyToken, createRecommendation);
/**
 * @swagger
 * /recommendations:
 *   get:
 *     tags:
 *       - Recommendation Routes
 *     summary: Get all recommendations
 *     description: |
 *       Get all recommendations populated with user or place or both if corresponding populate parameters are true, else ids are returned.
 *     parameters:
 *       - name: populateCreatedBy
 *         in: query
 *         required: true
 *         description: Populate the user in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: populatePlace
 *         in: query
 *         required: true
 *         description: Populate the place in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Recommendation(s) retrieved successfully.
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
 *                     $ref: '#/components/schemas/Recommendation'
 */
router.get('/recommendations', getAllRecommendations);
/**
 * @swagger
 * /recommendations/query:
 *   get:
 *     tags:
 *       - Recommendation Routes
 *     summary: Get recommendations by query
 *     description: |
 *       Get recommendations based on a specific field and value. Populates the user or place or both if corresponding populate parameters are true, else ids are returned
 *     parameters:
 *       - name: field
 *         in: query
 *         required: true
 *         description: Field we want to query by
 *         schema:
 *           type: string
 *       - name: value
 *         in: query
 *         required: true
 *         description: Value of the field.
 *         schema:
 *           type: string
 *       - name: populateCreatedBy
 *         in: query
 *         required: true
 *         description: Populate the user in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: populatePlace
 *         in: query
 *         required: true
 *         description: Populate the place in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Recommendation(s) retrieved successfully.
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
 *                     $ref: '#/components/schemas/Recommendation'
 */
router.get('/recommendations/query', getRecommendationsByQuery);
/**
 * @swagger
 * /recommendations/{id}:
 *   put:
 *     tags:
 *       - Recommendation Routes
 *     summary: Update a specific recommendation
 *     description: Takes a recommendation object in the body and updates a recommendation in the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the recommendation to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recommendation'
 *     responses:
 *       200:
 *         description: Recommendation updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put('/recommendations/:id', verifyToken, updateRecommendationById);
/**
 * @swagger
 * /recommendations/{id}:
 *   delete:
 *     tags:
 *       - Recommendation Routes
 *     summary: Delete a specific recommendation
 *     description: Deletes a recommendation from the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the recommendation to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommendation deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.delete('/recommendations/:id', verifyToken, deleteRecommendationById);

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
/**
 * @swagger
 * /roles/query:
 *   get:
 *     tags:
 *       - Role Routes
 *     summary: Get roles by query
 *     description: |
 *       Get roles based on a specific field and value. Populates the permissions if populate parameter is true.
 *     parameters:
 *       - name: field
 *         in: query
 *         required: true
 *         description: Field we want to query by
 *         schema:
 *           type: string
 *       - name: value
 *         in: query
 *         required: true
 *         description: Value of the field.
 *         schema:
 *           type: string
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
router.get('/roles/query', getRolesByQuery);
/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags:
 *       - Role Routes
 *     summary: Update a specific role
 *     description: Takes a role object in the body and updates a role in the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the role to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUnpopulated'
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put('/roles/:id', verifyToken, updateRoleById);
/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags:
 *       - Role Routes
 *     summary: Delete a specific role
 *     description: Deletes a role from the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the role to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.delete('/roles/:id', verifyToken, deleteRoleById);


// PERMISSION routes
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
/**
 * @swagger
 * /permissions/query:
 *   get:
 *     tags:
 *       - Permission Routes
 *     summary: Get permissions by query
 *     description: Get permissions based on a specific field and value.
 *     parameters:
 *       - name: field
 *         in: query
 *         required: true
 *         description: Field we want to query by
 *         schema:
 *           type: string
 *       - name: value
 *         in: query
 *         required: true
 *         description: Value of the field.
 *         schema:
 *           type: string
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
router.get('/permissions/query', getPermissionsByQuery);

// COLLECTION routes
/**
 * @swagger
 * /collections:
 *   post:
 *     tags:
 *       - Collection Routes
 *     summary: Create a new collection
 *     description: Takes a collection object in the body and creates a collection in the database.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Collection'
 *     responses:
 *       201:
 *         description: Collection created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 */
router.post('/collections', verifyToken, createCollection);
/**
 * @swagger
 * /collections:
 *   get:
 *     tags:
 *       - Collection Routes
 *     summary: Get all collections
 *     description: |
 *       Get all collections populated with user or place or both if corresponding populate parameters are true, else ids are returned.
 *     parameters:
 *       - name: populateCreatedBy
 *         in: query
 *         required: true
 *         description: Populate the user in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: populatePlace
 *         in: query
 *         required: true
 *         description: Populate the place in the response.
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: collection(s) retrieved successfully.
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
 *                     $ref: '#/components/schemas/collection'
 */
router.get('/collections', getAllCollections);
/**
 * @swagger
 * /collections/{id}:
 *   put:
 *     tags:
 *       - Collection Routes
 *     summary: Update a specific collection
 *     description: Takes a collection object in the body and updates a collection in the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the collection to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Collection'
 *     responses:
 *       200:
 *         description: Collection updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put('/collections/:id', verifyToken, updateCollectionById);
/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     tags:
 *       - Collection Routes
 *     summary: Delete a specific collection
 *     description: Deletes a collection from the database based on its Id.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Id of the collection to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.delete('/collections/:id', verifyToken, deleteCollectionById);

export default router;