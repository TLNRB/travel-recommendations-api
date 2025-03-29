import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes'
import { testConnection } from './repository/database';

// Load environment variables
dotenvFlow.config();

// Create Express application
const app: Application = express();

export function startServer(): void {
   // JSON body parser
   app.use(express.json());

   // Binding the routes to the app
   app.use('/api', routes);

   // Test database connection
   testConnection();

   const PORT: number = parseInt(process.env.PORT as string) || 4000;
   app.listen(PORT, () => {
      console.log('Server is running on port: ' + PORT);
   })
}