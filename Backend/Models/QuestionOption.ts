import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface IQuestionOption extends Document {
    QuestionId: Types.ObjectId; // FK - belongs to Question

    OptionText: string;
    OptionImage?: string;

    IsCorrect: boolean; // allows multiple correct options (MCQ+ compatible)

    Status: 'Active' | 'Inactive';
    createdDate: Date;
    updatedDate: Date;
}

// 🔹 Schema
const QuestionOptionSchema: Schema = new Schema<IQuestionOption>(
    {
        QuestionId: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },

        OptionText: {
            type: String,
            required: true,
        },

        OptionImage: {
            type: String,
            default: null,
        },

        IsCorrect: {
            type: Boolean,
            default: false,
        },

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
const QuestionOptionModel =
  mongoose.models.QuestionOption ||
  mongoose.model<IQuestionOption>('QuestionOption', QuestionOptionSchema);
export default QuestionOptionModel;
