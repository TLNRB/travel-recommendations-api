import { permissionModel } from "../models/permissionModel";
import { roleModel } from "../models/roleModel";
import { userModel } from "../models/userModel";
import { placeModel } from "../models/placeModel";

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
   const userRole = await roleModel.findOne({ name: 'user' });

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

   const user3 = new userModel({
      firstName: "Bartek",
      lastName: "Fenicki",
      username: "bartekfeni826",
      email: "bartek.fenicki@gmail.com",
      passwordHash: hashedPassword,
      profilePicture: "",
      bio: "",
      country: "",
      city: "",
      socials: [],
      role: adminRole!._id,
      registerDate: new Date()
   });
   await user3.save();

   const user4 = new userModel({
      firstName: "User",
      lastName: "User",
      username: "user",
      email: "user@email.com",
      passwordHash: hashedPassword,
      profilePicture: "",
      bio: "",
      country: "",
      city: "",
      socials: [],
      role: userRole!._id,
      registerDate: new Date()
   });
   await user4.save();

   // Create places
   const places = [
      {
         name: "Place 1",
         description: "Description for Place 1",
         images: ["image1.jpg", "image2.jpg"],
         location: {
            continent: "Europe",
            country: "Hungary",
            city: "Budapest",
            street: "Andrassy ut",
            streetNumber: "123"
         },
         upvotes: 16,
         tags: ["tag1", "tag2"],
         approved: true,
         _createdBy: user1._id
      },
      {
         name: "Place 2",
         description: "Description for Place 2",
         images: ["image3.jpg", "image4.jpg"],
         location: {
            continent: "North America",
            country: "USA",
            city: "Seattle",
            street: "Pine Street",
            streetNumber: "22"
         },
         upvotes: 0,
         tags: ["tag1", "tag2"],
         approved: true,
         _createdBy: user1._id
      },
      {
         name: "Place 3",
         description: "Description for Place 3",
         images: ["image5.jpg", "image6.jpg"],
         location: {
            continent: "Europe",
            country: "England",
            city: "London",
            street: "Baker Street",
            streetNumber: "1A"
         },
         upvotes: 5,
         tags: ["tag1", "tag2"],
         approved: true,
         _createdBy: user4._id
      },
      {
         name: "Place 4",
         description: "Description for Place 4",
         images: ["image7.jpg", "image8.jpg"],
         location: {
            continent: "Asia",
            country: "Japan",
            city: "Tokyo",
            street: "Shibuya",
            streetNumber: "45"
         },
         upvotes: 0,
         tags: ["tag1", "tag2"],
         approved: false,
         _createdBy: user4._id
      }
   ];
   await placeModel.insertMany(places);

   console.log("Data seeded successfully.");
}

seed();