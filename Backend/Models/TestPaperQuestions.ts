import mongoose, { Schema, Document, Types } from 'mongoose';

// 🔹 Interface
export interface ITestPaperQuestion extends Document {
  TestPaperId: Types.ObjectId;
  QuestionId: Types.ObjectId;
  order: Number;
  CreatedBy: Types.ObjectId;
  TeacherId: Types.ObjectId;
  createdDate: Date;
  updatedDate: Date;
}

const TestPaperQuestionSchema: Schema<ITestPaperQuestion> =
  new Schema(
    {
      TestPaperId: {
        type: Schema.Types.ObjectId,
        ref: 'TestPaper',
        required: true,
      },

      QuestionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },

      order: {
        type: Number,
        default: 0,
      },

      CreatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      TeacherId: {
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
const TestPaperQuestionModel = mongoose.model<ITestPaperQuestion>('TestPaperQuestion', TestPaperQuestionSchema);
export default TestPaperQuestionModel;
