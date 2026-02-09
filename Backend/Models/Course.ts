import mongoose, { Schema, Document } from 'mongoose';

// ==============================
// 🧾 Course Interface
// ==============================
export interface ICourse extends Document {
  Title: string;
  Description: string;
  Category: mongoose.Types.ObjectId; // ✅ Link to Category collection
  Level: 'Beginner' | 'Intermediate' | 'Advanced';
  Price: number;
  IsPaid: boolean;
  Language?: string;
  Image?: string;
  TeacherId: mongoose.Types.ObjectId;
  ExpiryDate?: Date;
  StartingDate?: Date;
  DiscountPercentage?: number;
  Sections?: {
    title: string;
    description?: string;
    videoUrl?: string;
    pdfUrl?: string;
    order: number;
  }[];

  LiveClasses?: {
    title: string;
    date: Date;
    time: string;
    link: string;
    duration?: number;
    status: 'Scheduled' | 'Ongoing' | 'Completed';
  }[];

  Materials?: {
    title: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];

  EnrolledStudents?: mongoose.Types.ObjectId[];

  Ratings?: {
    studentId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];

  AverageRating?: number;
  TotalStudents?: number;

  // ⭐ ADDING SUBJECT → CHAPTER → TOPIC IDS
  SelectedSubjects?: mongoose.Types.ObjectId[];
  SelectedChapters?: mongoose.Types.ObjectId[];
  SelectedTopics?: mongoose.Types.ObjectId[];

  Status: 'Draft' | 'Published' | 'Archived';
  CreatedBy: mongoose.Types.ObjectId;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

// ==============================
// 🧱 Course Schema
// ==============================
const CourseSchema: Schema<ICourse> = new Schema(
  {
    Title: { type: String, required: true, trim: true },
    Description: { type: String, required: true, trim: true },

    // ✅ Connect Category by ID (for filtering)
    Category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    Level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      trim: true,
    },

    Price: { type: Number, required: true, min: 0 },
    IsPaid: { type: Boolean, required: true },
    Language: { type: String, trim: true },
    Image: { type: String, trim: true },
    TeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    ExpiryDate: { type: Date },
    StartingDate: { type: Date },
    DiscountPercentage: { type: Number, trim: true },
    Sections: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        videoUrl: { type: String, trim: true },
        pdfUrl: { type: String, trim: true },
        order: { type: Number, required: true },
      },
    ],

    LiveClasses: [
      {
        title: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        time: { type: String, required: true, trim: true },
        link: { type: String, required: true, trim: true },
        duration: { type: Number },
        status: {
          type: String,
          enum: ['Scheduled', 'Ongoing', 'Completed'],
          required: true,
          trim: true,
        },
      },
    ],

    Materials: [
      {
        title: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    EnrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    Ratings: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    AverageRating: { type: Number, default: 0 },
    TotalStudents: { type: Number, default: 0 },

    Status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      required: true,
    },
    SelectedSubjects: [
      { type: Schema.Types.ObjectId, ref: 'Subject' }
    ],

    SelectedChapters: [
      { type: Schema.Types.ObjectId, ref: 'Chapter' }
    ],

    SelectedTopics: [
      { type: Schema.Types.ObjectId, ref: 'TopicOrClass' }
    ],

    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' },
  }
);

// ==============================
// 📦 Course Model Export
// ==============================
const CourseModel = mongoose.model<ICourse>('Course', CourseSchema);
export default CourseModel;
