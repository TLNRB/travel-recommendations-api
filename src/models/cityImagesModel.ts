import { Schema, model } from 'mongoose';
import { CityImages } from '../interfaces/cityImages'

const cityImagesSchema = new Schema<CityImages>({
   name: { type: String, required: true, min: 2, max: 100 },
   images: [
      {
         url: { type: String, required: true },
         alt: { type: String, required: true, min: 2, max: 100 }
      }
   ]
})

export const cityImagesModel = model<CityImages>('CityImages', cityImagesSchema);