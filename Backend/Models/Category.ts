import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  CategoryName: string;
  CategoryCode: string;
  Description?: string;
  Image?: string;
  CreatedBy: Types.ObjectId; // Reference to User
  createdDate: Date;
  updatedDate: Date;
  Status: 'Active' | 'Inactive';
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    CategoryName: { type: String, required: true, trim: true },
    CategoryCode: { type: String, required: true, unique: true, trim: true },
    Description: { type: String, default: '' },
    Image: { type: String, default: "" },
    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
    Status: { 
      type: String, 
      enum: ['Active', 'Inactive'], 
      default: 'Active' 
    },
  },
  { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } }
);

const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
export default CategoryModel;
