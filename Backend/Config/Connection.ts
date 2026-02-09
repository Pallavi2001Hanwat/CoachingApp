import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoleModel from '../Models/Role';

dotenv.config();

const connectDB = async () => {
  try {

   await mongoose.connect(`mongodb+srv://CoachingApp-User:CoachingPassword1234@coachingappcluster.dgstbrm.mongodb.net/coachingAppDB?retryWrites=true&w=majority&appName=CoachingAppCluster`);
    console.log('✅ MongoDB Connected');


//    // Seed data if needed
// const roleCount = await RoleModel.countDocuments();
// if (roleCount === 0) {
//   await RoleModel.create([
//     { RoleName: 'Admin' },
//     { RoleName: 'Teacher' },
//     { RoleName: 'Student' }
//   ]);
//   console.log('🧪 Roles created: Admin, Teacher, Student');
// } else {
//   console.log(`ℹ️ Roles already exist (${roleCount} found)`);
// }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
};

export default connectDB;
