import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { recommendationModel } from '../models/recommendationModel';
import { Recommendation } from '../interfaces/recommendation';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new recommendation
 * @param req
 * @param res
 */
export async function createRecommendation(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateRecommendationData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.title = xss(req.body.title);
      req.body.content = xss(req.body.content);

      await connect();

      const recommendationObject = new recommendationModel({
         _createdBy: req.body._createdBy,
         place: req.body.place,
         title: req.body.title,
         content: req.body.content,
         dateOfVisit: req.body.dateOfVisit,
         rating: req.body.rating
      });

      const savedRecommendation = await recommendationObject.save();
      res.status(201).json({ error: null, data: savedRecommendation });
   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a recommendation! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get all recommendations
 * @param req 
 * @param res 
 */
export async function getAllRecommendations(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      // Decide if we want to populate the createdBy or place or both or none
      const populateCreatedBy: boolean = req.query.populateCreatedBy === 'true';
      const populatePlace: boolean = req.query.populatePlace === 'true';

      let query = recommendationModel.find({});
      query = populateRecommendations(query, populateCreatedBy, populatePlace);
      const recommendations = await query;

      res.status(200).json({ error: null, data: recommendations });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all recommendations! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get recommendations by query
 * @param req 
 * @param res 
 */
export async function getRecommendationsByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);
      const populateCreatedBy: boolean = req.query.populateCreatedBy === 'true';
      const populatePlace: boolean = req.query.populatePlace === 'true';

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      await connect();

      let recommendations;

      // Check if the field is _createdBy or place or _id
      if (field === '_id' || field === '_createdBy' || field === 'place') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         let query = recommendationModel.find({ [field]: value });
         query = populateRecommendations(query, populateCreatedBy, populatePlace);
         recommendations = await query;
      }
      else if (field === 'title' || field === 'content') {
         let query = recommendationModel.find({ [field]: { $regex: value, $options: 'i' } });
         query = populateRecommendations(query, populateCreatedBy, populatePlace);
         recommendations = await query;
      }
      else {
         let query = recommendationModel.find({ [field]: value });
         query = populateRecommendations(query, populateCreatedBy, populatePlace);
         recommendations = await query;
      }

      res.status(200).json({ error: null, data: recommendations });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting recommendations by query! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a recommendation by Id
 * @param req 
 * @param res 
 */
export async function updateRecommendationById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateRecommendationData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
      req.body.title = xss(req.body.title);
      req.body.content = xss(req.body.content);

      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid recommendation Id format' });
         return;
      }

      await connect();

      const { _createdBy, place, dateOfWriting, ...safeBody } = req.body; // Exclude _createdBy, place, dateOfWriting from the body

      // Check if the recommendation exists
      const result = await recommendationModel.findByIdAndUpdate(id, safeBody);
      if (!result) {
         res.status(404).json({ error: 'Recommendation not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Recommendation updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating a recommendation! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a recommendation by Id
 * @param req 
 * @param res 
 */
export async function deleteRecommendationById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid recommendation Id format' });
         return;
      }

      await connect();

      // Check if the recommendation exists
      const recommendation = await recommendationModel.findByIdAndDelete(id);
      if (!recommendation) {
         res.status(404).json({ error: 'Recommendation not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Recommendation deleted successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting recommendation! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate recommendation data
 * @param data 
 */
function validateRecommendationData(data: Recommendation): ValidationResult {
   const schema = Joi.object({
      _createdBy: Joi.string().required(),
      place: Joi.string().required(),
      title: Joi.string().min(2).max(255).required(),
      content: Joi.string().min(2).max(500).required(),
      dateOfVisit: Joi.date().required(),
      rating: Joi.number().required().min(1).max(5),
      upvotes: Joi.number().required().default(0)
   })

   return schema.validate(data)
}

/**
 * Populate recommendations based on query parameters
 * @param query
 * @param req 
 * @param res 
 */
function populateRecommendations(query: any, populateCreatedBy: boolean, populatePlace: boolean) {
   if (populateCreatedBy) query = query.populate('_createdBy', 'firstName lastName username profilePicture role');
   if (populatePlace) query = query.populate('place', 'name images location');

   return query;
}