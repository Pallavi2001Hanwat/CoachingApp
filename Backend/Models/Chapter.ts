import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChapter extends Document {
  Title: string;
  Description?: string;
  Image?: string;
  SubjectId: Types.ObjectId; 
  TeacherId: Types.ObjectId;
  CreatedBy: Types.ObjectId; 
  Status: "Active" | "Inactive";
  createdDate: Date;
  updatedDate: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    Title: { type: String, required: true, trim: true },
    Description: { type: String, default: "" },
    Image: { type: String, default: "" },

    SubjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },

    CreatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" } }
);

export default mongoose.model<IChapter>("Chapter", ChapterSchema);
