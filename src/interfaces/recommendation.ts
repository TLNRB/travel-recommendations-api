import { Document, Schema } from 'mongoose'

export interface Recommendation extends Document {
   _createdBy: Schema.Types.ObjectId,
   place: Schema.Types.ObjectId,
   title: string,
   content: string,
   dateOfVisit: Date,
   dateOfWriting: Date,
   rating: number,
   upvotes: number
}