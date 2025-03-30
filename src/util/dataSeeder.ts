import { permissionModel } from "../models/permissionModel";
import { roleModel } from "../models/roleModel";
import { userModel } from "../models/userModel";

import { connect, disconnect } from "../repository/database";
import bcrypt from "bcrypt";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

// Seed data
export async function seed(): Promise<void> {
   try {
      await connect();

      await deleteAllData();

      await seedData();

      console.log("Database seeded successfully.");
      process.exit();
   }
   catch (err) {
      console.log("Error seeding database: " + err);
   }
   finally {
      await disconnect();
   }
}

// Delete all data from the database
export async function deleteAllData(): Promise<void> {
   await permissionModel.deleteMany({});
   await roleModel.deleteMany({});
   await userModel.deleteMany({});

   console.log("All data deleted successfully.");
}

// Seed data into the database
export async function seedData(): Promise<void> {
   // Create permissions
   const permissions = [
      { name: "user:assignRoles", description: "Allows to assign roles to another user", },
      { name: "content:managePlace", description: "Allows to approve or decline a suggested place" }
   ];

   await permissionModel.insertMany(permissions);

   // Create roles
   const permissionsFromDB = await permissionModel.find({});

   const roles = [
      {
         name: "admin",
         permissions: [permissionsFromDB[0]._id, permissionsFromDB[1]._id]
      },
      {
         name: "editor",
         permissions: [permissionsFromDB[1]._id]
      },
      {
         name: "user",
         permissions: []
      }
   ];

   await roleModel.insertMany(roles);

   // Create users
   // Hash the password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash("123456", salt);
   const adminRole = await roleModel.findOne({ name: 'admin' });

   const user1 = new userModel({
      firstName: "Norbert",
      lastName: "Tolnai",
      username: "tlnrb",
      email: "tolnainorbi16@gmail.com",
      passwordHash: hashedPassword,
      profilePicture: "",
      bio: "",
      country: "",
      city: "",
      socials: [],
      role: adminRole!._id,
      registerDate: new Date()
   });
   await user1.save();

   const user2 = new userModel({
      firstName: "admin",
      lastName: "admin",
      username: "admin",
      email: "admin@email.com",
      passwordHash: hashedPassword,
      profilePicture: "",
      bio: "",
      country: "",
      city: "",
      socials: [],
      role: adminRole!._id,
      registerDate: new Date()
   });
   await user2.save();

   console.log("Data seeded successfully.");
}

seed();