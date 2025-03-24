import express, { Application, Request, Response } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes'

// Load environment variables
dotenvFlow.config();

// Create Express application
const app: Application = express();

app.use('/api', routes);

/**
 * 
 */
export function startServer(): void {
   const PORT: number = parseInt(process.env.PORT as string) || 4000;
   app.listen(PORT, () => {
      console.log('Server is running on port: ' + PORT);
   })
}