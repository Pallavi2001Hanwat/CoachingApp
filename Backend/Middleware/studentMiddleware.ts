import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserModel from '../Models/User';

dotenv.config();

export const studentMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await UserModel.findById(decoded.userId).select('-Password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // ✅ attach user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

