import { Document } from 'mongoose'
import { Image } from './image'

export interface CountryImages extends Document {
   id: string,
   name: string,
   images: Image[]
}