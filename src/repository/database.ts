import mongoose from 'mongoose';

export async function testConnection(): Promise<void> {
   try {
      await connect();
      await disconnect();
      console.log('Database connection test was successful!');
   }
   catch (err) {
      console.log("Error testing database connection. Error: ", err);
   }
}

export async function connect(): Promise<void> {
   try {
      if (!process.env.DBHOST) {
         throw new Error('DBHOST environment variable is is not set!');
      }
      await mongoose.connect(process.env.DBHOST);

      if (mongoose.connection.db) {
         await mongoose.connection.db.admin().command({ ping: 1 });
         console.log('Connected to database!');
      }
      else {
         throw new Error('Failed to connect to database!');
      }
   }
   catch (err) {
      console.log("Error connecting to database. Error: ", err);
   }
}

export async function disconnect(): Promise<void> {
   try {
      await mongoose.disconnect();
      console.log('Disconnected from database!');
   }
   catch (err) {
      console.log("Error disconnecting from database. Error: ", err);
   }
}