import { Schema, model } from 'mongoose';
import { CountryImages } from '../interfaces/countryImages'

const countryImagesSchema = new Schema<CountryImages>({
   name: { type: String, required: true, min: 2, max: 100 },
   images: [
      {
         url: { type: String, required: true },
         alt: { type: String, required: true, min: 2, max: 100 }
      }
   ]
})

export const countryImagesModel = model<CountryImages>('CountryImages', countryImagesSchema);