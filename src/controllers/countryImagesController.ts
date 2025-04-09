import { Request, Response } from 'express';
import mongoose from 'mongoose';
import xss from 'xss';
import Joi, { ValidationResult } from 'joi';

import { countryImagesModel } from '../models/countryImagesModel';
import { CountryImages } from '../interfaces/countryImages';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new country with images
 * @param req
 * @param res
 */
export async function createCountryWithImages(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateCountryWithImagesData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input
      req.body.name = xss(req.body.name);
      req.body.images = req.body.images.map((image: any) => {
         return {
            url: xss(image.url),
            alt: xss(image.alt)
         };
      });

      await connect();

      // Check if the country already exists
      const existingCountry = await countryImagesModel.findOne({ name: req.body.name });
      if (existingCountry) {
         res.status(400).json({ error: 'Country with this name already exists!' });
         return;
      }

      // Create a new country object
      const countryObject = new countryImagesModel({
         name: req.body.name,
         images: req.body.images
      });

      const savedCountry = await countryObject.save();
      res.status(201).json({ error: null, data: savedCountry });

   }
   catch (err) {
      res.status(500).json({ error: 'Error creating a country with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get all countries with images
 * @param req
 * @param res
 */
export async function getAllCountriesWithImages(req: Request, res: Response): Promise<void> {
   try {
      await connect();

      const countries = await countryImagesModel.find({});
      res.status(200).json({ error: null, data: countries });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting all countries with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Get countries with images by query
 * @param req
 * @param res
 */
export async function getCountriesWithImagesByQuery(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize query parameters
      const field: string = xss(req.query.field as string);
      const value: string = xss(req.query.value as string);

      if (!field || !value) {
         res.status(400).json({ error: 'Field and value are required!' });
         return;
      }

      await connect();

      let countries;

      // Check if the field is id
      if (field === '_id') {
         if (!mongoose.Types.ObjectId.isValid(value)) {
            res.status(400).json({ error: 'Invalid Id format!' });
            return;
         }

         countries = await countryImagesModel.find({ [field]: value });
      }
      else {
         countries = await countryImagesModel.find({ [field]: { $regex: value, $options: 'i' } });
      }

      res.status(200).json({ error: null, data: countries });
   }
   catch (err) {
      res.status(500).json({ error: 'Error getting countries with images by query! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Update a country with images by Id
 * @param req
 * @param res
 */
export async function updateCountryWithImagesById(req: Request, res: Response): Promise<void> {
   try {
      // Validate user input
      const { error } = validateCountryWithImagesData(req.body);
      if (error) {
         res.status(400).json({ error: error.details[0].message });
         return;
      }

      // Sanitize user input and id
      const id = xss(req.params.id);
      req.body.name = xss(req.body.name);
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

      // Check if the country exists with the same name
      const existingCountry = await countryImagesModel.findOne({ name: req.body.name });

      if (existingCountry && existingCountry._id !== id) {
         res.status(400).json({ error: 'Country with this name already exists!' });
         return;
      }

      const result = await countryImagesModel.findByIdAndUpdate(id, req.body);
      if (!result) {
         res.status(404).json({ error: 'Country not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Country updated successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error updating a country with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Delete a country with images by Id
 * @param req
 * @param res
 */
export async function deleteCountryWithImagesById(req: Request, res: Response): Promise<void> {
   try {
      // Sanitize and validate id
      const id = xss(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: 'Invalid Id format' });
         return;
      }

      await connect();

      // Check if the country exists
      const country = await countryImagesModel.findByIdAndDelete(id);
      if (!country) {
         res.status(404).json({ error: 'Country not found with id=' + id });
         return;
      }
      else {
         res.status(200).json({ error: null, message: 'Country deleted successfully!' });
      }
   }
   catch (err) {
      res.status(500).json({ error: 'Error deleting a country with images! Error: ' + err });
   }
   finally {
      await disconnect();
   }
}

/**
 * Validate country images data
 * @param data
 */

function validateCountryWithImagesData(data: any): ValidationResult {
   const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      images: Joi.array().items(
         Joi.object({
            url: Joi.string().uri().required(),
            alt: Joi.string().min(2).max(100).required()
         })
      ).required()
   })

   return schema.validate(data);
}
