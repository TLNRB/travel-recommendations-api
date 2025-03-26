import { Schema, model } from 'mongoose';
import { Role } from '../interfaces/role'

const roleSchema = new Schema<Role>({
   name: { type: String, required: true, min: 2, max: 100 },
   permissions: { type: [Schema.Types.ObjectId], required: true, ref: "Permission", default: [] }
})

export const roleModel = model<Role>('Role', roleSchema);