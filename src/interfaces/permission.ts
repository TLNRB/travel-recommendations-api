import { Document } from 'mongoose';

export interface Permission extends Document {
   name: string,
   description: string
}