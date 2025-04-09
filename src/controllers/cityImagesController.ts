import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { cityImagesModel } from '../models/cityImagesModel';
import { CityImages } from '../interfaces/cityImages';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new city with images
 * @param req
 * @param res
 */
export async function createCityWithImages(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateCityWithImagesData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);
      req.body.country = xss(req.body.country);
      req.body.images = req.body.images.map((image: any) => {
         return {
            url: xss(image.url),
            alt: xss(image.alt)
         };
      });

      await connect();

      // Check if the city already exists
      const existingCity = await cityImagesModel.findOne({ name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' }, country: { $regex: `^${req.body.country.trim()}$`, $options: 'i' } });
      if (existingCity) {
         res.status(400).json({ error: 'City in this country with this name already exists!' });
         return;
      }

      // Create a new city object
      const cityObject = new cityImagesModel({
         name: req.body.name,
         country: req.body.country,
         images: req.body.images
      });

      const savedCity = await cityObject.save();
      res.status(201).json({ error: null, data: savedCity });

   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a city with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get all cities with images
 * @param req
 * @param res
 */
export async function getAllCitiesWithImages(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      const cities = await cityImagesModel.find({});
      res.status(200).json({ error: null, data: cities });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all cities with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get cities with images by query
 * @param req
 * @param res
 */
export async function getCitiesWithImagesByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      await connect();

      let cities;

      // Check if the field is id
      if (field === '_id') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         cities = await cityImagesModel.find({ [field]: value });
      }
      else {
         cities = await cityImagesModel.find({ [field]: { $regex: value, $options: 'i' } });
      }

      res.status(200).json({ error: null, data: cities });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting cities with images by query! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a city with images by Id
 * @param req
 * @param res
 */
export async function updateCityWithImagesById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateCityWithImagesData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
      req.body.name = xss(req.body.name);
      req.body.country = xss(req.body.country);
      req.body.images = req.body.images.map((image: any) => {
         return {
            url: xss(image.url),
            alt: xss(image.alt)
         };
      });

      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid Id format' });
         return;
      }

      await connect();

      // Check if the city exists with the same name and country
      const existingCity = await cityImagesModel.findOne({ name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' }, country: { $regex: `^${req.body.country.trim()}$`, $options: 'i' } });

      if (existingCity && existingCity._id !== id) {
         res.status(400).json({ error: 'City in this country with this name already exists!' });
         return;
      }

      const result = await cityImagesModel.findByIdAndUpdate(id, req.body);
      if (!result) {
         res.status(404).json({ error: 'City not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'City updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating a city with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a city with images by Id
 * @param req
 * @param res
 */
export async function deleteCityWithImagesById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid Id format' });
         return;
      }

      await connect();

      // Check if the city exists
      const city = await cityImagesModel.findByIdAndDelete(id);
      if (!city) {
         res.status(404).json({ error: 'City not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'City deleted successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting a city with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate city images data
 * @param data
 */

function validateCityWithImagesData(data: any): ValidationResult {
   const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      country: Joi.string().min(2).max(100).required(),
      images: Joi.array().items(
         Joi.object({
            url: Joi.string().uri().required(),
            alt: Joi.string().min(2).max(100).required()
         })
      ).required()
   })

   return schema.validate(data);
}
