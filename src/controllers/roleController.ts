import { Request, Response } from 'express';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { roleModel } from '../models/roleModel';
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

      const roles = await roleModel.find({}).populate('permissions', 'name description');

      res.status(200).json({ error: null, data: roles });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all roles! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}