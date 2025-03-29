import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Joi, { ValidationResult } from 'joi';

import { userModel } from '../models/userModel';
import { User } from '../interfaces/user';
import { connect, disconnect } from '../repository/database';

/**
 * Register a new user as (user)
 * @param req 
 * @param res 
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
   try {
      const { error } = validateUserRegistrationData(req.body);

      if (error) {
         res.status(400).send({ error: error.details[0].message });
         return;
      }

      await connect();
   }
   catch (err) {

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
      passwordHash: Joi.string().min(6).max(255).required(),
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