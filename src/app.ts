import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes'
import { testConnection } from './repository/database';

// Load environment variables
dotenvFlow.config();

// Create Express application
const app: Application = express();

app.use('/api', routes);

/**
 * 
 */
export function startServer(): void {
   // Test database connection
   testConnection();

   const PORT: number = parseInt(process.env.PORT as string) || 4000;
   app.listen(PORT, () => {
      console.log('Server is running on port: ' + PORT);
   })
}