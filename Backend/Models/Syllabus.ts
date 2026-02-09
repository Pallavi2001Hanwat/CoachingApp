// src/Models/Syllabus.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabus extends Document {
    Title: string;
    Description?: string;
    SyllabusCategoryId: mongoose.Types.ObjectId;
    PdfUrl: string;
    Status: 'Active' | 'Inactive';
    CreatedAt: Date;
}

const SyllabusSchema: Schema = new Schema<ISyllabus>({
    Title: {
        type: String,
        required: true,
        trim: true,
    },
    Description: {
        type: String,
        trim: true,
    },
    SyllabusCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SyllabusCategory',
        required: true,
    },
    PdfUrl: { type: String, trim: true },
    Status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },

    CreatedAt: {
        type: Date,
        default: Date.now,
    },
});

const SyllabusModel = mongoose.model<ISyllabus>('Syllabus', SyllabusSchema);
export default SyllabusModel;
