import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopicOrClass extends Document {
  Title: string;
  Description?: string;

  VideoURL: string;
  Duration?: number;

  videoThumbnail?: string;
  pdfUrl?: string;
  extraFiles?: string[];       // assuming array of file URLs
  classType?: string;          // string because type not specified
  classOrder?: number;
  duration?: number;           // duplicate of Duration?
  isFree?: boolean;
  isLocked?: boolean;

  ChapterId: Types.ObjectId;
  SubjectId: Types.ObjectId;
  CreatedBy: Types.ObjectId;
 TeacherId:  Types.ObjectId;

  Status: "Active" | "Inactive";
  createdDate: Date;
  updatedDate: Date;
}

const TopicOrClassSchema = new Schema<ITopicOrClass>(
  {
    Title: { type: String, required: true, trim: true },
    Description: { type: String, default: "" },

    VideoURL: { type: String },
    Duration: { type: Number, default: 0 },

    videoThumbnail: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },

    extraFiles: {
      type: [String], // array of URLs
      default: [],
    },

    classType: { type: String, default: "" },
    classOrder: { type: Number, default: 0 },

    duration: { type: Number, default: 0 }, // if this is separate from Duration

    isFree: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },

    ChapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    SubjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
 TeacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
  }
);

export default mongoose.model<ITopicOrClass>("TopicsOrClass", TopicOrClassSchema);
