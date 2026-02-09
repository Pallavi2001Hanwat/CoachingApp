import mongoose, { Schema, Document } from 'mongoose';


export interface IRole extends Document {
  RoleName: string;
 
}

const RoleSchema: Schema = new Schema<IRole>({
  RoleName: { type: String, required: true, trim: true },
 
});

const RoleModel = mongoose.model<IRole>('Role', RoleSchema);
export default RoleModel;