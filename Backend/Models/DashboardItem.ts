import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDashboard extends Document {
  Title: string;
  Description?: string;
  Image?: string; // Icon/Image
  Type: string;
  Action: string; // Link or action
  Visibility:  'Free' | 'Paid';
  OrderNumber: number;
  Status: 'Active' | 'Inactive';
  CreatedBy: Types.ObjectId;
 TeacherId:  Types.ObjectId;
  createdDate: Date;
  updatedDate: Date;
}

const DashboardSchema: Schema = new Schema<IDashboard>(
  {
    Title: { type: String, required: true },
    Description: { type: String, default: '' },
    Image: { type: String, default: '' },

    Type: {
      type: String,
      required: true,
    },

    Action: { type: String, required: true },

    Visibility: {
      type: String,
      enum: [ 'Free', 'Paid'],
      default: 'Free',
    },

    OrderNumber: { type: Number, default: 0 },

    Status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    TeacherId:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } }
);

const CategoryModel = mongoose.model<IDashboard>('Dashboard', DashboardSchema);
export default CategoryModel;
