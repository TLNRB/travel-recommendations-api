import { Document, Schema } from 'mongoose'

export interface Recommendation extends Document {
   id: string,
   _createdBy: Schema.Types.ObjectId,
   placeId: Schema.Types.ObjectId,
   title: string,
   content: string,
   dateOfVisit: Date,
   dateOfWriting: Date,
   rating: number,
   upvotes: number
}