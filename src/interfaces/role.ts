import { Document, Schema } from 'mongoose'

export interface Role extends Document {
   id: string,
   name: string,
   permissions: Schema.Types.ObjectId[]
}