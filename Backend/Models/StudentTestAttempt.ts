import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentTestAttempt extends Document {
  StudentId: mongoose.Types.ObjectId;
  TestPaperId: mongoose.Types.ObjectId;
  AttemptNo: number;
  StartTime: Date;
  EndTime?: Date;
  AttemptStatus: 'InProgress' | 'Completed' | 'Timeout';
  TotalObtainedMarks: number;
  CorrectCount: number;
  WrongCount: number;
  SkippedCount: number;
  TotalTimeTaken: number; // seconds or minutes (as per your logic)
  createdDate: Date;
}

const StudentTestAttemptSchema: Schema = new Schema<IStudentTestAttempt>(
  {
    StudentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    TestPaperId: {
      type: Schema.Types.ObjectId,
      ref: 'TestPaper',
      required: true,
    },
    AttemptNo: {
      type: Number,
      required: true,
    },
    StartTime: {
      type: Date,
      required: true,
    },
    EndTime: {
      type: Date, // submit time par set hoga
    },
    AttemptStatus: {
      type: String,
      enum: ['Completed', 'Timeout','InProgress'],
      required: true,
    },
    TotalObtainedMarks: {
      type: Number,
      default: 0,
    },
    CorrectCount: {
      type: Number,
      default: 0,
    },
    WrongCount: {
      type: Number,
      default: 0,
    },
    SkippedCount: {
      type: Number,
      default: 0,
    },
    TotalTimeTaken: {
      type: Number,
      default: 0,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // kyunki createdDate manually hai
  }
);

const StudentTestAttemptModel = mongoose.model<IStudentTestAttempt>(
  'StudentTestAttempt',
  StudentTestAttemptSchema
);

export default StudentTestAttemptModel;
