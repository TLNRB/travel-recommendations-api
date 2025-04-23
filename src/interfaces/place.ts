import { Document, Schema } from 'mongoose'

export interface Place extends Document {
   name: string,
   description: string,
   images: string[],
   location: {
      continent: string,
      country: string,
      city?: string,
      street?: string,
      streetNumber?: string
   },
   upvotes: number,
   tags: string[],
   approved: boolean,
   _createdBy: Schema.Types.ObjectId
}