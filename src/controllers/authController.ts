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
      // Validate user input
      const { error } = validateUserRegistrationData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.firstName = xss(req.body.firstName);
      req.body.lastName = xss(req.body.lastName);
      req.body.username = xss(req.body.username);
      req.body.email = xss(req.body.email);

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
 * Login a user
 * @param req 
 * @param res 
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateUserLoginData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.email = xss(req.body.email);
      req.body.password = xss(req.body.password);

      await connect();

      // Find the user by email
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
         res.status(400).json({ error: 'Invalid email or password!' });
         return;
      }
      else {
         // Check if the password is correct
         const validPassword: boolean = await bcrypt.compare(req.body.password, user.passwordHash);
         if (!validPassword) {
            res.status(400).json({ error: 'Invalid email or password!' });
            return;
         }

         // Create and assign a token
         const userId: string = user.id;
         const token = jwt.sign(
            {
               firstName: user.firstName,
               lastName: user.lastName,
               username: user.username,
               email: user.email,
               id: userId,
            },
            process.env.TOKEN_SECRET as string,
            { expiresIn: '2h' }
         );

         res.status(200).header('auth-token', token).json({ error: null, data: { userId, token } });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error logging in the user! Error: ' + err });
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
      password: Joi.string().min(6).max(20).required(),
   })

   return schema.validate(data);

}

/**
 * Verify the token
 * @param req 
 * @param res 
 * @param next 
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
   // Check if the token is provided
   const token: string | undefined = req.header('auth-token');
   if (!token) {
      res.status(400).json({ error: 'Access denied!' });
      return;
   }

   try {
      jwt.verify(token, process.env.TOKEN_SECRET as string);

      next();
   }
   catch {
      res.status(401).json({ error: 'Invalid token!' });
   }
}