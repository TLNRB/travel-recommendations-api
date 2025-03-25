import { Document } from 'mongoose'
import { Image } from './image'

export interface CityImages extends Document {
   id: string,
   name: string,
   images: Image[]
}