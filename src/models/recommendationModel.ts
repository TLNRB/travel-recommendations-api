import { Schema, model } from 'mongoose';
import { Recommendation } from '../interfaces/recommendation'

const recommendationSchema = new Schema<Recommendation>({
   _createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
   place: { type: Schema.Types.ObjectId, required: true, ref: "Place" },
   title: { type: String, required: true, min: 2, max: 255 },
   content: { type: String, required: true, min: 2, max: 500 },
   dateOfVisit: { type: Date, required: true },
   dateOfWriting: { type: Date, required: true, default: Date.now },
   rating: { type: Number, required: true, min: 1, max: 5 },
   upvotes: { type: Number, required: true, default: 0 }
})

export const recommendationModel = model<Recommendation>('Recommendation', recommendationSchema);