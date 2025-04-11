import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { userModel } from '../models/userModel';
import { roleModel } from '../models/roleModel';
import { User } from '../interfaces/user';
import { connect, disconnect } from '../repository/database';

/**
 * Get all users
 * * @param req
 * * @param res
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      // Decide if we want to populate the role or not
      const populate: boolean = req.query.populate === 'true';

      let users;

      if (populate) {
         users = await userModel.find({}).populate('role');
      }
      else {
         users = await userModel.find({});
      }

      // Exclude passwordHash from the response
      users = users.map((user: User) => {
         const { passwordHash, ...safeUser } = user.toObject();
         return safeUser;
      });

      res.status(200).json({ error: null, data: users });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all users! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get users by query
 * @param req
 * @param res
 */
export async function getUsersByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);
      const populate: boolean = req.query.populate === 'true';

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      await connect();

      let users;

      // Check if the field is id or role 
      if (field === '_id' || field === 'role') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         // If populate is true, populate the role field
         populate ? users = await userModel.find({ [field]: value }).populate('role') : users = await userModel.find({ [field]: value });
      }
      else if (field === 'registerDate') {
         // Check if the value is a valid date format
         const date = new Date(value);
         if (isNaN(date.getTime())) {
            res.status(400).json({ error: 'Invalid date format!' });
            return;
         }

         // Create a time range for the day it is queried
         const startOfDay = new Date(date.setHours(2, 0, 0, 0)); // Set to 00:00:00.000
         const endOfDay = new Date(date.setHours(25, 59, 59, 999)); // Set to 23:59:59.999

         populate ? users = await userModel.find({ [field]: { $gte: startOfDay, $lte: endOfDay } }).populate('role') : users = await userModel.find({ [field]: { $gte: startOfDay, $lte: endOfDay } });
      }
      else if (field === 'passwordHash') {
         res.status(400).json({ error: 'Password hash cannot be queried!' });
         return;
      }
      else {
         populate ? users = await userModel.find({ [field]: { $regex: value, $options: 'i' } }).populate('role') : users = await userModel.find({ [field]: { $regex: value, $options: 'i' } });
      }

      // Exclude passwordHash from the response
      users = users.map((user: User) => {
         const { passwordHash, ...safeUser } = user.toObject();
         return safeUser;
      });

      res.status(200).json({ error: null, data: users });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting users by query! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a user by Id
 * @param req 
 * @param res 
 */
export async function updateUserById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateUserData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
      const editingUserId = xss(req.query.editingUserId as string); // This is the id of the user making the request
      req.body.firstName = xss(req.body.firstName);
      req.body.lastName = xss(req.body.lastName);
      req.body.username = xss(req.body.username);
      req.body.profilePicture = xss(req.body.profilePicture);
      req.body.bio = xss(req.body.bio);
      req.body.country = xss(req.body.country);
      req.body.city = xss(req.body.city);
      req.body.socials = Array.isArray(req.body.socials) ? req.body.socials.map((social: any) => {
         return {
            name: xss(social.name),
            link: xss(social.link),
            icon: xss(social.icon)
         };
      }) : [];
      req.body.role = xss(req.body.role);

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(editingUserId) || !mongoose.Types.ObjectId.isValid(req.body.role)) {
         res.status(400).json({ error: 'Invalid Id format' });
         return;
      }

      await connect();

      // Check if the username is already taken
      const existingUsername = await userModel.findOne({ username: { $regex: `^${req.body.username.trim()}$`, $options: 'i' } });
      if (existingUsername && existingUsername._id != id) {
         res.status(400).json({ error: 'Username already taken!' });
         return;
      }

      // Check if the user exists
      const user = await userModel.findById(id);

      if (!user) {
         res.status(404).json({ error: 'User not found with id=' + id });
         return;
      }
      // Check if the user is trying to update the role
      else if (user.role != req.body.role) {
         const editingUser = await userModel.findById(editingUserId);
         const editingUserRole = await roleModel.findById(editingUser!.role).populate('permissions');

         const canUpdate = editingUserRole!.permissions.find((permission: any) => permission.name === 'user:assignRoles');

         if (!canUpdate) {
            res.status(403).json({ error: 'You do not have permission to update the user role!' });
            return;
         }

         const { email, passwordHash, registerDate, ...safeBody } = req.body; // Exclude email, passwordHash and registerDate from the body

         await userModel.findByIdAndUpdate(id, safeBody);

         res.status(200).json({ error: null, message: 'User updated successfully!' });

      }
      else {
         const { email, passwordHash, role, registerDate, ...safeBody } = req.body;

         await userModel.findByIdAndUpdate(id, safeBody);

         res.status(200).json({ error: null, message: 'User updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating user! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate user data
 * * @param User
 */
function validateUserData(data: User): ValidationResult {
   const schema = Joi.object({
      firstName: Joi.string().min(2).max(100).required(),
      lastName: Joi.string().min(2).max(100).required(),
      username: Joi.string().min(2).max(100).required(),
      profilePicture: Joi.string().uri().allow('').optional(),
      bio: Joi.string().allow('').max(255).optional(),
      country: Joi.string().allow('').max(100).optional(),
      city: Joi.string().allow('').max(100).optional(),
      socials: Joi.array().items(Joi.object({
         name: Joi.string().min(2).max(100).required(),
         link: Joi.string().uri().required(),
         icon: Joi.string().min(2).max(100).required()
      })),
      role: Joi.string().required(),
   });

   return schema.validate(data);
}