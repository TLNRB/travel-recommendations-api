import { Schema, model } from 'mongoose';
import { Place } from '../interfaces/place'

const placeSchema = new Schema<Place>({
   name: { type: String, required: true, min: 2, max: 255 },
   description: { type: String, required: true, min: 2, max: 500 },
   images: { type: [String], required: true },
   location: {
      continent: { type: String, required: true, min: 2, max: 100 },
      country: { type: String, required: true, min: 2, max: 100 },
      city: { type: String, required: true, min: 2, max: 100 },
      street: { type: String, required: true, min: 2, max: 100 },
      streetNumber: { type: String, required: true, min: 1, max: 10 },
   },
   upvotes: { type: Number, required: true, default: 0 },
   tags: { type: [String], required: true },
   approved: { type: Boolean, required: true, default: false },
   _createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
})

export const placeModel = model<Place>('Place', placeSchema);