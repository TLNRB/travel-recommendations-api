import { Schema, model } from 'mongoose';
import { User } from '../interfaces/user'

const userSchema = new Schema<User>({
   firstName: { type: String, required: true, min: 2, max: 100 },
   lastName: { type: String, required: true, min: 2, max: 100 },
   userName: { type: String, required: true, min: 2, max: 100, unique: true },
   email: { type: String, required: true, min: 6, max: 255, unique: true },
   passwordHash: { type: String, required: true, min: 6, max: 255 },
   profilePicture: { type: String, default: "" },
   bio: { type: String, default: "", max: 255 },
   country: { type: String, default: "", max: 100 },
   city: { type: String, default: "", max: 100 },
   socials: {
      type: [{
         name: { type: String, required: true, min: 2, max: 100 },
         link: { type: String, required: true },
         icon: { type: String, required: true, min: 2, max: 100 }
      }], default: []
   },
   role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
   registerDate: { type: Date, required: true, default: Date.now }
});

export const userModel = model<User>('User', userSchema);