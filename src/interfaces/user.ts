import { Document, Schema } from 'mongoose'
import { Social } from './social'

export interface User extends Document {
   firstName: string,
   lastName: string,
   userName: string,
   email: string,
   passwordHash: string,
   profilePicture?: string,
   bio?: string,
   country?: string,
   city?: string,
   socials?: Social[],
   role: Schema.Types.ObjectId,
   registerDate: Date
}