import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface ITestPaper extends Document {
    TestSeriesId: Types.ObjectId; // FK - belongs to TestSeries
    PaperTitle: string;
    Description?: string;

    DurationInMinutes: number; // ex: 60
    TotalMarks: number;
    PassingMarks: number;
    TotalQuestions: number;

    AttemptLimit: number | 'Unlimited'; // ex: 1 or "Unlimited"
    PaperLevel: 'Easy' | 'Medium' | 'Hard';

    IsPaid: boolean;

    ScheduledDate?: Date; // optional

    TeacherId: Types.ObjectId;
    CreatedBy: Types.ObjectId;
    Status: 'Active' | 'Inactive';
    createdDate: Date;
    updatedDate: Date;
}

// 🔹 Schema
const TestPaperSchema: Schema = new Schema<ITestPaper>(
    {
        TestSeriesId: {
            type: Schema.Types.ObjectId,
            ref: 'TestSeries',
            required: true,
        },

        PaperTitle: { type: String, required: true },
        Description: { type: String, default: '' },

        DurationInMinutes: { type: Number, required: true },
        TotalMarks: { type: Number, required: true },
        PassingMarks: { type: Number, required: true },
        TotalQuestions: { type: Number, required: true },

        AttemptLimit: {
            type: Schema.Types.Mixed, // number OR "Unlimited"
            default: 1,
        },

        PaperLevel: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },

        IsPaid: { type: Boolean, default: false },

        ScheduledDate: { type: Date, default: null },
        TeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

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
const TestPaperModel = mongoose.model<ITestPaper>('TestPaper', TestPaperSchema);
export default TestPaperModel;
