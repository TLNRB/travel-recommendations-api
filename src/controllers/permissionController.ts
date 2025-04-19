import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';

import { permissionModel } from '../models/permissionModel';

/**
 * Get all permissions
 * @param res 
 */
export async function getAllPermissions(req: Request, res: Response): Promise<void> {
   try {
      const result = await permissionModel.find({});

      res.status(200).json({ error: null, data: result });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all permission! Error: ' + err });
   }
}

/**
 * Get permissions by query
 * @param req 
 * @param res 
 */
export async function getPermissionsByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      let permissions;

      // Check if the field is id
      if (field === '_id') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid permission Id format!' });
            return;
         }

         permissions = await permissionModel.findById({ [field]: value });
      }
      else {
         permissions = await permissionModel.find({ [field]: { $regex: value, $options: 'i' } });
      }

      res.status(200).json({ error: null, data: permissions });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting permissions by query! Error: ' + err });
   }
}