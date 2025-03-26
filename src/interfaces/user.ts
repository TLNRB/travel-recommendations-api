import { Document, Schema } from 'mongoose'
import { Social } from './social'

export interface User extends Document {
   id: string,
   firstName: string,
   lastName: string,
   userName: string,
   email: string,
   passwordHash: string,
   profilePicture?: string | null,
   bio?: string | null,
   country?: string | null,
   city?: string | null,
   socials?: Social[] | null,
   recommendations?: Schema.Types.ObjectId[] | null,
   role: Schema.Types.ObjectId,
   collections?: Schema.Types.ObjectId[] | null,
   registerDate: Date
}