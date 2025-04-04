import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { roleModel } from '../models/roleModel';
import { userModel } from '../models/userModel';
import { Role } from '../interfaces/role';
import { connect, disconnect } from '../repository/database';


/**
 * Create a new role
 * @param req 
 * @param res 
 */
export async function createRole(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateRoleData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);

      await connect();

      // Check if the role already exists
      const existingRole = await roleModel.findOne({ name: req.body.name });
      if (existingRole) {
         res.status(400).json({ error: 'Role with this name already exists!' });
         return;
      }

      // Create a new role object
      const roleObject = new roleModel({
         name: req.body.name,
         permissions: req.body.permissions
      });

      const savedRole = await roleObject.save();
      res.status(201).json({ error: null, data: savedRole });
   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a role! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate role data (name and permissions)
 * @param data 
 */
export function validateRoleData(data: Role): ValidationResult {
   const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      permissions: Joi.array().items(Joi.string()).required()
   })

   return schema.validate(data)
}

/**
 * Get all roles
 * @param req 
 * @param res 
 */
export async function getAllRoles(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      // Decide if we want to populate the permissions or not
      const populate: boolean = req.query.populate === 'true';
      let roles;

      if (populate) {
         roles = await roleModel.find({}).populate('permissions', 'name description');
      }
      else {
         roles = await roleModel.find({});
      }

      res.status(200).json({ error: null, data: roles });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all roles! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get roles by query
 * @param req 
 * @param res 
 */
export async function getRolesByQuery(req: Request, res: Response): Promise<void> {
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

      let roles;

      // Check if the field is id or permissions
      if (field === '_id' || field === 'permissions') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         // If populate is true, populate the permissions field
         populate ? roles = await roleModel.find({ [field]: value }).populate('permissions', 'name description') : roles = await roleModel.find({ [field]: value });
      }
      else {
         populate ? roles = await roleModel.find({ [field]: { $regex: value, $options: 'i' } }).populate('permissions', 'name description') : roles = await roleModel.find({ [field]: { $regex: value, $options: 'i' } });
      }

      res.status(200).json({ error: null, data: roles });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting roles by query! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a role by Id
 * @param req
 * @param res
 */
export async function updateRoleById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateRoleData(req.body);

      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
      req.body.name = xss(req.body.name);

      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid role Id format' });
         return;
      }

      await connect();

      // Check if the role exists and update it
      const result = await roleModel.findByIdAndUpdate(id, req.body);
      if (!result) {
         res.status(404).json({ error: 'Role not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Role updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating role! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a role by Id
 * @param req
 * @param res
 */
export async function deleteRoleById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid role Id format' });
         return;
      }

      await connect();

      // Check if the role exists
      const role = await roleModel.findById(id);
      if (!role) {
         res.status(404).json({ error: 'Role not found with id=' + id });
         return;
      }
      else {
         // Check if the role is assigned to any user
         const userExists = await userModel.exists({ role: id });

         if (userExists) {
            res.status(400).json({ error: 'Cannot delete the role. It is assigned to at least one user.' });
            return;
         }
         else {
            // Delete the role
            await roleModel.findByIdAndDelete(id);
            res.status(200).json({ error: null, message: 'Role deleted successfully!' });
         }
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting role! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}