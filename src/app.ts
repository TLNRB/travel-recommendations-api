import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes'
import cors from 'cors';
import { testConnection } from './repository/database';
import { setupDocs } from './util/documentation';

// Load environment variables
dotenvFlow.config();

// Create Express application
const app: Application = express();

// Setup CORS
function setupCors(): void {
   app.use(cors({
      origin: "*", // Allow requests from any origin
      methods: 'GET, POST, PUT, DELETE',
      allowedHeaders: ['auth-token', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
      credentials: true
   }))
}

export async function startServer(): Promise<void> {
   try {
      setupCors();

      // JSON body parser
      app.use(express.json());

      // Binding the routes to the app
      app.use('/api', routes);

      // Setup swagger documentation
      setupDocs(app);

      // Test database connection
      await testConnection();

      const PORT: number = parseInt(process.env.PORT as string) || 4000;
      app.listen(PORT, () => {
         console.log('Server is running on port: ' + PORT);
      })
   }
   catch (err) {
      console.error('Error starting server: ', err);
      process.exit(1); // Exit the process with failure
   }

}