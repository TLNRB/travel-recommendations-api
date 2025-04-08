import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { collectionModel } from '../models/collectionModel';
import { Collection } from '../interfaces/collection';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new collection
 * @param req 
 * @param res 
 */
export async function createCollection(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateCollectionData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);

      await connect();

      // Check if the collection already exists
      const existingCollection = await collectionModel.findOne({ name: req.body.name });
      if (existingCollection) {
         res.status(400).json({ error: 'Collection with this name already exists!' });
         return;
      }

      // Create a new collection object
      const collectionObject = new collectionModel({
         _createdBy: req.body._createdBy,
         name: req.body.name,
         places: req.body.places ? req.body.places : [],
         visible: req.body.visible
      });

      const savedCollection = await collectionObject.save();
      res.status(201).json({ error: null, data: savedCollection });

   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a collection! Error: ' + err });
   }
   finally {
      await disconnect();
   }

}

/**
 * Validate collection data
 * @param req 
 * @param res 
 */
function validateCollectionData(data: any): ValidationResult {
   const schema = Joi.object({
      _createdBy: Joi.string().required(),
      name: Joi.string().min(2).max(100).required(),
      places: Joi.array().items(Joi.string()).optional(),
      visible: Joi.boolean().required()
   });

   return schema.validate(data);
}