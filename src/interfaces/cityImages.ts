import { Document } from 'mongoose'
import { Image } from './image'

export interface CityImages extends Document {
   name: string,
   country: string,
   images: Image[]
}