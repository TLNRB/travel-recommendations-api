import { Document, Schema } from 'mongoose'

export interface Role extends Document {
   name: string,
   permissions: Schema.Types.ObjectId[]
}