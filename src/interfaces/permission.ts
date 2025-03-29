import { Document, Schema } from 'mongoose'

export interface Permission extends Document {
   name: string,
   description: string,
   protected: boolean
}