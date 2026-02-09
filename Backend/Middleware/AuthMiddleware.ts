import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserModel from '../Models/User';
import UserRoleModel from '../Models/UserRoles';
import RoleModel from '../Models/Role';

dotenv.config();

// Extend Request interface to include `user`
export interface AuthRequest extends Request {
  user?: any;
  roles?: string[];
}

// ==========================================
// 🔐 Auth + Role Middleware
// ==========================================
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get JWT token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
   
    if (!token) {
      res.status(401).json({ message: 'Authorization token is missing' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // Find user
    const user = await UserModel.findById(decoded.userId);
   
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 🔍 Find all roles assigned to this user
    const userRoles = await UserRoleModel.find({ UserId: user._id });
    if (!userRoles.length) {
      res.status(403).json({ message: 'No roles assigned to this user' });
      return;
    }

    // Get all roleIds
    const roleIds = userRoles.map((r) => r.RoleId);

    // Find role names
    const roles = await RoleModel.find({ _id: { $in: roleIds } });
    const roleNames = roles.map((r) => r.RoleName);

    // ✅ Check if user has allowed role
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = roleNames.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied: Unauthorized role' });
      return;
    }

    // Attach user and roles to request
    req.user = user;
    req.roles = roleNames;

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
