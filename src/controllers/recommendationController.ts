import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { recommendationModel } from '../models/recommendationModel';
import { Recommendation } from '../interfaces/recommendation';
import { connect, disconnect } from '../repository/database';
import { title } from 'process';

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
 * Validate recommendation data
 * @param data 
 */
export function validateRecommendationData(data: Recommendation): ValidationResult {
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
      let recommendations;

      if (populateCreatedBy && populatePlace) {
         recommendations = await recommendationModel.find({}).populate('_createdBy').populate('place');
      }
      else if (populateCreatedBy) {
         recommendations = await recommendationModel.find({}).populate('_createdBy');
      }
      else if (populatePlace) {
         recommendations = await recommendationModel.find({}).populate('place');
      }
      else {
         recommendations = await recommendationModel.find({});
      }

      res.status(200).json({ error: null, data: recommendations });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all recommendations! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}