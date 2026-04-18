import { Request, Response } from 'express';
import PreviousYearPaperCategoryModel from '../Models/PreviousYearPaperCategory';
import PreviousYearPaperModel from '../Models/PreviousYearPaper';
import { AuthRequest } from '../Middleware/AuthMiddleware';
import mongoose from "mongoose";

const createPYPCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    const { Title, Image, Status } = req.body;

    // --------------------------
    // BASIC VALIDATION
    // --------------------------
    if (!Title) {
      res.status(400).json({
        success: false,
        message: 'Title is required',
      });
      return;
    }

    if (!Image) {
      res.status(400).json({
        success: false,
        message: 'Image is required',
      });
      return;
    }

    // --------------------------
    // CHECK DUPLICATE CATEGORY
    // --------------------------
    const existingCategory = await PreviousYearPaperCategoryModel.findOne({
      Title: Title.trim(),
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message: 'Category already exists',
      });
      return;
    }

    // --------------------------
    // IMAGE UPLOAD (Cloudinary)
    // --------------------------
    let uploadedImageUrl = '';

    try {
      const cloudinary = req.app.locals.cloudinary;
      const result = await cloudinary.uploader.upload(Image, {
        folder: 'PreviousYearPaperCategory',
      });
      uploadedImageUrl = result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image to Cloudinary',
      });
      return;
    }

    // --------------------------
    // CREATE CATEGORY
    // --------------------------
    const newCategory = new PreviousYearPaperCategoryModel({
      Title: Title.trim(),
      Image: uploadedImageUrl,
      Status: Status || 'Active',
      CreatedBy: user._id,
    });

    const savedCategory = await newCategory.save();

    // --------------------------
    // RESPONSE
    // --------------------------
    res.status(201).json({
      success: true,
      message: 'PYPCategory created successfully',
      Category: savedCategory,
    });

  } catch (error: any) {
    console.error('Error creating Category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Category',
      error: error.message,
    });
  }
};



const getAllPYPCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await PreviousYearPaperCategoryModel
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      Categories: categories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};


const getPYPCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await PreviousYearPaperCategoryModel.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      Category: category,
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
};


const updatePYPCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { Title, Image, Status } = req.body;

    const category = await PreviousYearPaperCategoryModel.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // --------------------------
    // IMAGE UPDATE (optional)
    // --------------------------
    let updatedImageUrl = category.Image;

    if (Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'PreviousYearPaperCategory',
        });
        updatedImageUrl = result.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
          success: false,
          message: 'Error uploading image',
        });
        return;
      }
    }

    // --------------------------
    // UPDATE FIELDS
    // --------------------------
    category.Title = Title ? Title.trim() : category.Title;
    category.Image = updatedImageUrl;
    category.Status = Status || category.Status;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      Category: updatedCategory,
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};



const deletePYPCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // --------------------------
    // FIND CATEGORY
    // --------------------------
    const category = await PreviousYearPaperCategoryModel.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // --------------------------
    // DELETE IMAGE FROM CLOUDINARY
    // --------------------------
    if (category.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Extract public_id from Cloudinary URL
        const parts = category.Image.split('/');
        const fileName = parts[parts.length - 1]; // abc123.jpg
        const folderName = 'PreviousYearPaperCategory'; // MUST match upload folder
        const publicId = `${folderName}/${fileName.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Cloudinary image delete failed:', err);
        // ❗ image delete fail hone par bhi DB delete rokna nahi
      }
    }

    // --------------------------
    // HARD DELETE FROM DATABASE
    // --------------------------
    await PreviousYearPaperCategoryModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category permanently deleted',
    });

  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};






 const deleteAllPYPCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ✅ Role check
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some(role => allowedRoles.includes(role));
    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Fetch all categories
    const categories = await PreviousYearPaperCategoryModel.find();
    if (!categories.length) {
      res.status(404).json({ success: false, message: 'No categories found' });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // Loop through categories
    for (const category of categories) {

      // Delete category image from Cloudinary
      if (category.Image) {
        try {
          const parts = category.Image.split('/');
          const fileName = parts[parts.length - 1]; // abc123.jpg
          const folderName = 'PreviousYearPaperCategory';
          const publicId = `${folderName}/${fileName.split('.')[0]}`;

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(`Failed to delete image for category ${category._id}:`, err);
        }
      }

      // Delete all papers linked to this category
      await PreviousYearPaperModel.deleteMany({ PYPCategoryId: category._id });
    }

    // Delete all categories
    await PreviousYearPaperCategoryModel.deleteMany();

    res.status(200).json({
      success: true,
      message: '✅ All PreviousYearPaperCategories and linked papers deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting all PYP categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all PYP categories',
      error: error.message,
    });
  }
};



export default {
  createPYPCategory,
  getAllPYPCategories,
  getPYPCategoryById,
  updatePYPCategory,
  deletePYPCategory,
  deleteAllPYPCategories
};