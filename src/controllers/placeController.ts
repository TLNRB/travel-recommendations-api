import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { placeModel } from '../models/placeModel';
import { userModel } from '../models/userModel';
import { recommendationModel } from '../models/recommendationModel';
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

      await connect();

      // Check if the place already exists
      const existingPlace = await placeModel.findOne({
         name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' },
         'location.city': { $regex: `^${req.body.location.city.trim()}$`, $options: 'i' },
         'location.country': { $regex: `^${req.body.location.country.trim()}$`, $options: 'i' }
      });
      if (existingPlace) {
         res.status(400).json({ error: 'Place with this name in this city and country already exists!' });
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
            tags: req.body.tags,
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
 * Get all places
 * @param req 
 * @param res 
 */
export async function getAllPlaces(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      const places = await placeModel.find({});

      res.status(200).json({ error: null, data: places });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all places! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get places by query
 * @param req 
 * @param res 
 */
export async function getPlacesByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      await connect();

      let places;

      // Check if the field is id
      if (field === '_id' || field === '_createdBy') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         places = await placeModel.findById({ [field]: value });
      }
      // Else if needed as a numebr or boolean can't be checked with regex and options
      else if (field === 'approved' || field === 'upvotes') {
         places = await placeModel.find({ [field]: value });
      }
      else {
         places = await placeModel.find({ [field]: { $regex: value, $options: 'i' } });
      }
      res.status(200).json({ error: null, data: places });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting places! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a place by id
 * * @param req
 * * @param res
 */
export async function updatePlaceById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validatePlaceData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
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

      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid place Id format' });
         return;
      }

      await connect();

      const { _createdBy, ...safeBody } = req.body; // Exclude _createdBy from the update object

      // Check if the city exists with the same name and country
      const existingPlace = await placeModel.findOne({
         name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' },
         'location.city': { $regex: `^${req.body.location.city.trim()}$`, $options: 'i' },
         'location.country': { $regex: `^${req.body.location.country.trim()}$`, $options: 'i' }
      });

      if (existingPlace && existingPlace._id != id) {
         res.status(400).json({ error: `Place in this city and country with this name already exists! id=${id} existingPlace._id=${existingPlace._id}` });
         return;
      }

      // Check if the place exists
      const result = await placeModel.findByIdAndUpdate(id, safeBody);
      if (!result) {
         res.status(404).json({ error: 'Place not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Place updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating a place! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a place by id
 * @param req 
 * @param res 
 */
export async function deletePlaceById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid place Id format' });
         return;
      }

      await connect();

      // Check if the place exists
      const place = await placeModel.findById(id);
      if (!place) {
         res.status(404).json({ error: 'Place not found with id=' + id });
         return;
      }
      else {
         // Check if the place has any recommendations
         const recommendations = await recommendationModel.find({ place: id });
         if (recommendations.length > 0) {
            await recommendationModel.deleteMany({ place: id });
         }

         // Delete the place
         await placeModel.findByIdAndDelete(id);
         res.status(200).json({ error: null, message: 'Place deleted successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting place! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate place data
 * @param data 
 */
function validatePlaceData(data: Place): ValidationResult {
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