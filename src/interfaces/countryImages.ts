import { Document } from 'mongoose'
import { Image } from './image'

export interface CountryImages extends Document {
   name: string,
   images: Image[]
}