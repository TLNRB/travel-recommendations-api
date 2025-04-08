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
 * Get all collections
 * @param req 
 * @param res 
 */
export async function getAllCollections(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      // Decide if we want to populate the places and/or users or not
      const populateCreatedBy: boolean = req.query.populateCreatedBy === 'true';
      const populatePlace: boolean = req.query.populatePlace === 'true';

      let query = collectionModel.find({});
      query = populateCollections(query, populateCreatedBy, populatePlace);
      const collections = await query;

      res.status(200).json({ error: null, data: collections });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all collections! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a collection by Id
 * @param req 
 * @param res 
 
 */
export async function deleteCollectionById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid collection Id format!' });
         return;
      }

      await connect();

      // Check if the collection exists
      const collection = await collectionModel.findByIdAndDelete(id);
      if (!collection) {
         res.status(404).json({ error: 'Collection not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Collection deleted successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting collection! Error: ' + err });
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
      places: Joi.array().items(Joi.string()).optional().default([]),
      visible: Joi.boolean().required().default(false)
   });

   return schema.validate(data);
}

/**
 * Populate collections based on query parameters
 * @param req 
 * @param res 
 */
function populateCollections(query: any, populateCreatedBy: boolean, populatePlaces: boolean) {
   if (populateCreatedBy) query = query.populate('_createdBy');
   if (populatePlaces) query = query.populate('places', 'name');

   return query;
}