import { Request, Response } from 'express';
import CategoryModel from '../Models/Category';
import { AuthRequest } from '../Middleware/AuthMiddleware';

// ✅ Create Category
const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized: Please login first' });
      return;
    }

    const { CategoryName, CategoryCode, Description, Status,Image } = req.body;

    // Basic validation
    if (!CategoryName || !CategoryCode) {
      res.status(400).json({ message: 'CategoryName and CategoryCode are required' });
      return;
    }

     let uploadedImageUrl = '';
        if (Image) {
            try {
                const cloudinary = req.app.locals.cloudinary;
                const result = await cloudinary.uploader.upload(Image, {
                    folder: 'Category'
                });
                uploadedImageUrl = result.secure_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                return res.status(500).json({ 
                    message: 'Error uploading image to Cloudinary', 
                    data: null, 
                    error 
                });
            }
        } else {
            return res.status(400).json({ 
                message: 'Image file is required', 
                data: null 
            });
        }


    // Check if CategoryCode already exists
    const existingCategory = await CategoryModel.findOne({ CategoryCode });
    if (existingCategory) {
      res.status(400).json({ message: 'CategoryCode already exists' });
      return;
    }

    // Create new Category
    const newCategory = new CategoryModel({
      CategoryName,
      CategoryCode,
      Description: Description || '',
      CreatedBy: user._id,
      Image:uploadedImageUrl,
      Status: Status || 'Active',
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      Category: savedCategory,
    });
  } catch (error: any) {
    console.error('Error creating Category:', error);
    res.status(500).json({ success: false, message: 'Failed to create Category', error: error.message });
  }
};

// ✅ Get All Categories
const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.find()
      .populate('CreatedBy', 'FirstName LastName  Email')
      .sort({ createdDate: -1 });

    res.status(200).json({ success: true, total: categories.length, categories });
  } catch (error: any) {
    console.error('Error fetching Categories:', error);
    res.status(500).json({ message: 'Failed to fetch Categories', error: error.message });
  }
};

// ✅ Get Category by ID
const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id).populate('CreatedBy', 'FirstName LastName  Email');

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, category });
  } catch (error: any) {
    console.error('Error fetching Category by ID:', error);
    res.status(500).json({ message: 'Failed to fetch Category', error: error.message });
  }
};

// ✅ Update Category
const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ✅ 1. Authentication check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // ✅ 2. Role-based access
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only Admin or Teacher can update Subject',
      });
      return;
    }

    // ✅ 3. Fetch existing Subject
    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

  

    // ✅ 4. Extract updatable fields
    const {
     CategoryName, CategoryCode, Description, Status,Image 
    } = req.body;

    // ✅ 5. Handle Cloudinary image upload if a new base64 image is sent
    let uploadedImageUrl = existingCategory.Image; // default to old one

    if (Image && Image !== existingCategory.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old image if exists
        if (existingCategory.Image) {
          const public_id = existingCategory.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Category/${public_id}`);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'Category',
        });

        uploadedImageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error,
        });
        return;
      }
    }

    // ✅ 6. Build dynamic update object
    const updateData: any = {
      ...(CategoryName && { CategoryName }),
      ...(Description && { Description }),
      ...(CategoryCode && { CategoryCode }),
        Image: uploadedImageUrl,
      ...(Status && { Status }),
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    // ✅ 7. Update and return latest version
    const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCategory) {
      res.status(404).json({ success: false, message: 'Category not found after update' });
      return;
    }

    // ✅ 8. Success Response
    res.status(200).json({
      success: true,
      message: '✅ Category updated successfully',
      Category: updatedCategory,
    });
  } catch (error: any) {
    console.error('❌ Error updating Category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Category',
      error: error.message,
    });
  }
};

// ✅ Delete Category
 const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ✅ Authentication check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ✅ Role check
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Access denied: Only Admin or Teacher can delete Subject' });
      return;
    }

    // ✅ Find the Subject first
    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

   

    // ✅ Delete from Cloudinary if Image exists
   if (existingCategory.Image) {
     const cloudinary = req.app.locals.cloudinary;
          const public_id = existingCategory.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Category/${public_id}`);
        }

    // ✅ Delete the Subject from MongoDB
    await CategoryModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ Category and associated image deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting Subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Subject',
      error: error.message,
    });
  }
};


// 📌 Get Categories that have Paid Courses
const getPaidCourseCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "courses", // Course collection name
          localField: "_id",
          foreignField: "Category",
          as: "courses",
        },
      },
      {
        $addFields: {
          paidCourseCount: {
            $size: {
              $filter: {
                input: "$courses",
                as: "c",
                cond: { $eq: ["$$c.IsPaid", true] }
              }
            }
          }
        }
      },
      {
        $match: { paidCourseCount: { $gt: 0 } }
      },
      {
        $project: {
          CategoryName: 1,
          Image: 1,

          CategoryCode: 1,
          Description: 1,
          paidCourseCount: 1,
          createdDate: 1,
          updatedDate: 1,
        }
      },
      { $sort: { createdDate: -1 } }
    ]);

    res.status(200).json({
      success: true,
      total: categories.length,
      categories,
    });

  } catch (error: any) {
    console.error("Error fetching paid categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch paid categories",
      error: error.message,
    });
  }
};


export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPaidCourseCategories
};
