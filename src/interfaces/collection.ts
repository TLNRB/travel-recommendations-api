import { Document, Schema } from 'mongoose'

export interface Collection extends Document {
   id: string,
   userId: Schema.Types.ObjectId,
   name: string,
   places: Schema.Types.ObjectId[],
   visible: boolean
}