import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentQuestionResponse extends Document {
  AttemptId: mongoose.Types.ObjectId;
  QuestionId: mongoose.Types.ObjectId;
  SelectedOptionId?: mongoose.Types.ObjectId | null;
  TimeTakenInSeconds: number;
  IsCorrect: boolean;
  MarksAwarded: number;
  createdDate: Date;
}

const StudentQuestionResponseSchema: Schema =
  new Schema<IStudentQuestionResponse>(
    {
      AttemptId: {
        type: Schema.Types.ObjectId,
        ref: 'StudentTestAttempt',
        required: true,
      },
      QuestionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
      SelectedOptionId: {
        type: Schema.Types.ObjectId,
        ref: 'QuestionOption',
        default: null, // null = unattempted
      },
      TimeTakenInSeconds: {
        type: Number,
        required: true,
        default: 0,
      },
      IsCorrect: {
        type: Boolean, // submit ke baad update hoga
        default: false,
      },
      MarksAwarded: {
        type: Number, // submit ke baad update hoga
        default: 0,
      },
      createdDate: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: false,
    }
  );


  
  const StudentQuestionResponseModel = mongoose.model<IStudentQuestionResponse>(
    'StudentQuestionResponse',
    StudentQuestionResponseSchema
  );



export default StudentQuestionResponseModel;
