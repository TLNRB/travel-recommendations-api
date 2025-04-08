import { Document, Schema } from 'mongoose'

export interface Collection extends Document {
   _createdBy: Schema.Types.ObjectId,
   name: string,
   places?: Schema.Types.ObjectId[],
   visible: boolean
}