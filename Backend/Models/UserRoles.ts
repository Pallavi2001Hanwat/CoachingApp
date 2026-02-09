import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserRole extends Document {
  UserId: Types.ObjectId;
  RoleId: Types.ObjectId;
}

const UserRoleSchema: Schema = new Schema<IUserRole>({
  UserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  RoleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
});

const UserRoleModel = mongoose.model<IUserRole>('UserRole', UserRoleSchema);

export default UserRoleModel;
