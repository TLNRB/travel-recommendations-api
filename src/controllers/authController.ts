import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Joi, { ValidationResult } from 'joi';

import { userModel } from '../models/userModel';
import { roleModel } from '../models/roleModel';
import { User } from '../interfaces/user';
import { connect, disconnect } from '../repository/database';

/**
 * Register a new user as (user)
 * @param req 
 * @param res 
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize user input
      req.body.firstName = xss(req.body.firstName);
      req.body.lastName = xss(req.body.lastName);
      req.body.username = xss(req.body.username);
      req.body.email = xss(req.body.email);
      req.body.password = xss(req.body.password);

      const { error } = validateUserRegistrationData(req.body);

      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      await connect();

      // Check if the email or username already exists
      const emailExists = await userModel.findOne({ email: req.body.email });
      const usernameExists = await userModel.findOne({ username: req.body.username });

      if (emailExists) {
         res.status(400).json({ error: 'Email already exists!' });
         return;
      }
      else if (usernameExists) {
         res.status(400).json({ error: 'Username already exists!' });
         return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Find the role ID for the user
      const userRole = await roleModel.findOne({ name: 'user' });
      if (!userRole) {
         res.status(400).json({ error: 'User role not found!' });
         return;
      }

      // Create a new user object
      const userObject = new userModel({
         firstName: req.body.firstName,
         lastName: req.body.lastName,
         username: req.body.username,
         email: req.body.email,
         passwordHash: hashedPassword,
         profilePicture: "",
         bio: "",
         country: "",
         city: "",
         socials: [],
         role: userRole._id
      })

      const savedUser = await userObject.save();
      res.status(201).json({ error: null, data: savedUser._id });
   }
   catch (err) {
      res.status(500).json({ error: 'Error registering the user! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate user data (firstName, lastName, username, email, password)
 * @param data 
 */
export function validateUserRegistrationData(data: User): ValidationResult {
   const schema = Joi.object({
      firstName: Joi.string().min(2).max(100).required(),
      lastName: Joi.string().min(2).max(100).required(),
      username: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().min(6).max(255).required(),
      password: Joi.string().min(6).max(20).required(),
   })

   return schema.validate(data);
}

/**
 * Validate user login data (email, password)
 * @param data 
 */
export function validateUserLoginData(data: User): ValidationResult {
   const schema = Joi.object({
      email: Joi.string().email().min(6).max(255).required(),
      passwordHash: Joi.string().min(6).max(20).required(),
   })

   return schema.validate(data);

}