import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface IQuestion extends Document {
    QuestionText: string;
    QuestionImage?: string; // optional

    QuestionType: 'MCQ' | 'TrueFalse' | 'Numeric' | 'FillInTheBlank' | 'MatchTheFollowing';
    DifficultyLevel: 'Easy' | 'Medium' | 'Hard';

    SubjectId?: Types.ObjectId;
    TopicId?: Types.ObjectId;
    ChapterId?: Types.ObjectId;

    Marks: number;//marks of question 
    NegativeMarks?: number;
    TimeAllowedInSeconds: number;

    Explanation?: string;
    Tags?: string[];

    Status: 'Active' | 'Inactive';
    TeacherId: Types.ObjectId;
    CreatedBy: Types.ObjectId;

    createdDate: Date;
    updatedDate: Date;
}

// 🔹 Schema
const QuestionSchema: Schema = new Schema<IQuestion>(
    {
        QuestionText: { type: String, required: true },
        QuestionImage: { type: String, default: null },

        QuestionType: {
            type: String,
            enum: ['MCQ', 'TrueFalse', 'Numeric', 'FillInTheBlank', 'MatchTheFollowing'],
            required: true,
        },

        DifficultyLevel: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },

        SubjectId: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            default: null,
        },

        TopicId: {
            type: Schema.Types.ObjectId,
            ref: 'TopicsOrClass',
            default: null,
        },

        ChapterId: {
            type: Schema.Types.ObjectId,
            ref: 'Chapter',
            default: null,
        },

        Marks: { type: Number, required: true, default: 1 },
        NegativeMarks: { type: Number, default: 0 },

        TimeAllowedInSeconds: { type: Number, required: true },

        Explanation: { type: String, default: '' },

        Tags: {
            type: [String],
            default: [],
        },

        Status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },

        TeacherId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        CreatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
const QuestionModel = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)


export default QuestionModel;
