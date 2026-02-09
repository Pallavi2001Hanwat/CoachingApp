import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  UserId: mongoose.Types.ObjectId;
  Email: string;
  Otp: string;
  ExpiresAt: Date;
  Verified: boolean;
}

const OtpSchema = new Schema<IOtp>(
  {
    UserId: { type: Schema.Types.ObjectId,ref: 'User',required: false,  default: null,   },
    Email: { type: String, required: true },
    Otp: { type: String, required: true },
    ExpiresAt: { type: Date, required: true },
    Verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Automatically delete expired OTPs after expiry using MongoDB TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });




const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
export default OtpModel;
