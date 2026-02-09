import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  AlternatePhone?: string;
  Gender?: string;
  Password?: string;
  DateOfBirth?: Date | null;
  ProfileImage?: string;
  IsActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  FirstName: { type: String, required: true, trim: true },
  LastName: { type: String, required: true, trim: true },
  Email: { type: String, unique: true, trim: true },
  Phone: { type: String, unique: true, trim: true },
  AlternatePhone: { type: String },
  Gender: { type: String },
  Password: { type: String },
  DateOfBirth: { type: Date, default: null },
  ProfileImage: { type: String },
  IsActive: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
