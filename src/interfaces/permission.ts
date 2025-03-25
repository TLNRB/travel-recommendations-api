import { Document, Schema } from 'mongoose'

export interface Permission extends Document {
   id: string,
   name: string,
   description: string
}