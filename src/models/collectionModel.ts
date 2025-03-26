import { Schema, model } from 'mongoose';
import { Collection } from '../interfaces/collection'

const collectionSchema = new Schema<Collection>({
   _createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
   name: { type: String, required: true, min: 2, max: 100 },
   places: { type: [Schema.Types.ObjectId], ref: "Place", default: [] },
   visible: { type: Boolean, required: true, default: false }
})

export const collectionModel = model<Collection>('Collection', collectionSchema);