import { Schema, model } from 'mongoose';
import { Permission } from '../interfaces/Permission'

const permissionSchema = new Schema<Permission>({
   name: { type: String, required: true, min: 2, max: 100 },
   description: { type: String, required: true, min: 2, max: 255 },
   protected: { type: Boolean, required: true, default: false }
})

export const permissionModel = model<Permission>('Permission', permissionSchema);