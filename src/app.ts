import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes'
import cors from 'cors';
import { testConnection } from './repository/database';
import { setupDocs } from './util/documentation';
import { connect, disconnect } from './repository/database';

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
      await connect(); // Connect to the database

      setupCors();

      // JSON body parser
      app.use(express.json());

      // Binding the routes to the app
      app.use('/api', routes);

      // Setup swagger documentation
      setupDocs(app);

      // Test database connection
      /* await testConnection(); */

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

// CTRL + C to stop the server
process.on('SIGINT', async () => {
   console.log('SIGINT received: closing database connection...');
   await disconnect(); // Disconnect from the database
   process.exit(0); // Exit the process with success
});

// When the server is stopped in production
process.on('SIGTERM', async () => {
   console.log('SIGTERM received: closing database connection...');
   await disconnect();
   process.exit(0);
});
