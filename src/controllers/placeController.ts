import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { placeModel } from '../models/placeModel';
import { userModel } from '../models/userModel';
import { Place } from '../interfaces/place';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new place
 * @param req 
 * @param res 
 */
export async function createPlace(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validatePlaceData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);
      req.body.description = xss(req.body.description);
      req.body.images = req.body.images.map((image: string) => xss(image));
      const { continent, country, city, street, streetNumber } = req.body.location;
      req.body.location = {
         continent: xss(continent),
         country: xss(country),
         city: xss(city),
         street: xss(street),
         streetNumber: xss(streetNumber)
      };
      req.body.tags = req.body.tags.map((tag: string) => xss(tag));

      if (!mongoose.Types.ObjectId.isValid(req.body._createdBy)) {
         res.status(400).json({ error: 'Invalid user Id format.' });
         return;
      }

      await connect();

      // Check if the place already exists
      const existingPlace = await placeModel.findOne({ name: req.body.name });
      if (existingPlace) {
         res.status(400).json({ error: 'Place with this name already exists!' });
         return;
      }

      // Check the users role and create a new place object
      let placeObject;
      const user = await userModel.findById(req.body._createdBy).populate('role', 'name');

      if ((user!.role as any).name !== 'admin' && (user!.role as any) !== 'editor') {
         placeObject = new placeModel({
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            location: {
               continent: req.body.location.continent,
               country: req.body.location.country,
               city: req.body.location.city,
               street: req.body.location.street,
               streetNumber: req.body.location.streetNumber
            },
            upvotes: 0,
            tags: req.body.tags,
            approved: false,
            _createdBy: req.body._createdBy
         });
      }
      else {
         placeObject = new placeModel({
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            location: {
               continent: req.body.location.continent,
               country: req.body.location.country,
               city: req.body.location.city,
               street: req.body.location.street,
               streetNumber: req.body.location.streetNumber
            },
            upvotes: req.body.upvotes,
            tags: req.body.tags,
            approved: req.body.approved,
            _createdBy: req.body._createdBy
         });
      }

      const savedPlace = await placeObject.save();
      res.status(201).json({ error: null, data: savedPlace });
   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a place! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate place data
 * @param data 
 */
export function validatePlaceData(data: Place): ValidationResult {
   const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().min(2).max(500).required(),
      images: Joi.array().items(Joi.string()).required(),
      location: Joi.object({
         continent: Joi.string().min(2).max(100).required(),
         country: Joi.string().min(2).max(100).required(),
         city: Joi.string().min(2).max(100).required(),
         street: Joi.string().min(2).max(100).required(),
         streetNumber: Joi.string().min(1).max(10).required()
      }).required(),
      upvotes: Joi.number().required().default(0),
      tags: Joi.array().items(Joi.string()).required(),
      approved: Joi.boolean().required().default(false),
      _createdBy: Joi.string().required()
   })

   return schema.validate(data)
}