import { Request, Response } from 'express';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { permissionModel } from '../models/permissionModel';
import { Permission } from '../interfaces/permission';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new permission
 * @param req 
 * @param res 
 */
export async function createPermission(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validatePermissionData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);
      req.body.description = xss(req.body.description);

      await connect();

      // Check if the permission already exists
      const existingPermission = await permissionModel.findOne({ name: req.body.name });
      if (existingPermission) {
         res.status(400).json({ error: 'Permission with this name already exists!' });
         return;
      }

      // Create a new permission object
      const permissionObject = new permissionModel({
         name: req.body.name,
         description: req.body.description
      });

      const savedPermission = await permissionObject.save();
      res.status(201).json({ error: null, data: savedPermission });
   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a permission! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate permission data (name and description)
 * @param data 
 */
export function validatePermissionData(data: Permission): ValidationResult {
   const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().min(2).max(255).required()
   })

   return schema.validate(data);
}

/**
 * Get all permissions
 * @param res 
 */
export async function getAllPermissions(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      const result = await permissionModel.find({});

      res.status(200).json({ error: null, data: result });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all permission! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

export async function updatePermisissionById(req: Request, res: Response): Promise<void> {
   console.log('updatePermisissionById called!');
   try {
      // Validate user input
      const { error } = validatePermissionData(req.body);

      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      const id = xss(req.params.id);
      req.body.name = xss(req.body.name);
      req.body.description = xss(req.body.description);

      await connect();

      // Check if the permission exists and update it
      const result = await permissionModel.findByIdAndUpdate(id, req.body);
      if (!result) {
         res.status(404).json({ error: 'Permission not found with id=' + id });
         return;
      }
      else {
         res.status(201).json({ error: null, message: 'Permission updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating permission! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

