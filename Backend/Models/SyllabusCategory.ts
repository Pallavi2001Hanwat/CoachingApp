// src/Models/SyllabusCategory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabusCategory extends Document {
    CategoryName: string;
    Description?: string;
    Status: 'Active' | 'Inactive';
    CreatedAt: Date;
}

const SyllabusCategorySchema: Schema = new Schema<ISyllabusCategory>({
    CategoryName: {
        type: String,
        required: true,
        trim: true,
    },
    Description: {
        type: String,
        trim: true,
    },
    Status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
});

const SyllabusCategoryModel = mongoose.model<ISyllabusCategory>(
    'SyllabusCategory',
    SyllabusCategorySchema
);

export default SyllabusCategoryModel;
