import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface ISubject extends Document {
  Title: string;
  SubjectCode: string;
  Image?: string;
  Description?: string;
  CreatedBy: Types.ObjectId;
  TeacherId: Types.ObjectId;
  createdDate: Date;
  updatedDate: Date;
  Status: 'Active' | 'Inactive';
}

// 🔹 Schema
const SubjectSchema: Schema = new Schema<ISubject>(
  {
    Title: { type: String, required: true, trim: true },

    SubjectCode: { type: String, required: true, unique: true, trim: true },

    Description: { type: String, default: '' },

    Image: { type: String, default: '' },

    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    TeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    Status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate',
    },
  }
);

// 🔹 Model
const SubjectModel = mongoose.model<ISubject>('Subject', SubjectSchema);
export default SubjectModel;
