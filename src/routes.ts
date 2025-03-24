import { Router, Request, Response } from 'express';

const router: Router = Router();

// Welcome route
router.get('/', (req: Request, res: Response) => {
   res.status(200).send('Hello Travelers!');
})

export default router;