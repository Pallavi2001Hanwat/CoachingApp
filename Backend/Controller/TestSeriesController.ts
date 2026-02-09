import { Request, Response } from 'express';
import TestSeriesModel from '../Models/TestSeries';
import { AuthRequest } from '../Middleware/AuthMiddleware';



const createTestSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 🔹 Ensure User is Authenticated
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // 🔹 Extract Data from Request Body
    const {
      Title,
      Description,
      Image, // base64 or cloudinary url
      IsPaid,
      Price,
      DiscountPrice,
      ValidityDays,
      Status,
      CategoryId
    } = req.body;

    // 🔹 Validate Required Fields
    if (!Title || !Description ||!CategoryId) {
      res.status(400).json({
        success: false,
        message: 'Title and Description are required'
      });
      return;
    }

    // 🔹 Thumbnail Upload to Cloudinary
    let uploadedImageUrl = '';
    if (Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'TestSeries'
        });
        uploadedImageUrl = result.secure_url;
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        res.status(500).json({
          success: false,
          message: 'Error uploading thumbnail to Cloudinary',
          error
        });
        return;
      }
    }

    // 🔹 Create Test Series Document
    const newTestSeries = new TestSeriesModel({
      Title,
      Description,
      Image: uploadedImageUrl || '',
      IsPaid: IsPaid ?? false,
      Price: IsPaid ? Price || 0 : 0,
      DiscountPrice: IsPaid ? DiscountPrice || 0 : 0,
      ValidityDays: IsPaid ? ValidityDays || 0 : 0,
      TotalTests: 0, // will update based on test papers
      CreatedBy: user._id,
      TeacherId:user._id,
      Status: Status || 'Active',
      CategoryId
    });

    // 🔹 Save to DB
    const savedSeries = await newTestSeries.save();

    // 🔹 Response
    res.status(201).json({
      success: true,
      message: '🎉 Test Series created successfully',
      TestSeries: savedSeries
    });

  } catch (error: any) {
    console.error('❌ Error creating Test Series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Test Series',
      error: error.message
    });
  }
};


 const getAllTestSeries = async (req: Request, res: Response): Promise<void> => {
  try {
    const TestSeries = await TestSeriesModel.find()
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: TestSeries.length, TestSeries });
  } catch (error: any) {
    console.error('Error fetching Subjects:', error);
    res.status(500).json({ message: 'Failed to fetch Subjects', error: error.message });
  }
};


 const getTestSeriesById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const TestSeries= await TestSeriesModel.findById(id)
    .populate('TeacherId', 'FirstName LastName Email')
    .populate('CategoryId', 'CategoryName');
    ;

    if (!TestSeries) {
      res.status(404).json({ message: 'TestSeries not found' });
      return;
    }

    res.status(200).json({ success: true, TestSeries});
  } catch (error: any) {
    console.error('Error fetching TestSeriesby ID:', error);
    res.status(500).json({ message: 'Failed to fetch Subject', error: error.message });
  }
};


const updateTestSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // 🔹 1. Authentication check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // 🔹 2. Role-based access check
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: Only Admin or Teacher can update Test Series'
      });
      return;
    }

    // 🔹 3. Fetch existing TestSeries
    const existingTestSeries = await TestSeriesModel.findById(id);
    if (!existingTestSeries) {
      res.status(404).json({ success: false, message: 'Test Series not found' });
      return;
    }

    // 🔹 4. Teachers can update only their own TestSeries
    if (
      req.roles?.includes('Teacher') &&
      existingTestSeries.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You can only update your own Test Series'
      });
      return;
    }

    // 🔹 5. Extract updatable fields from body
    const {
      Title,
      Description,
      Image,      // base64 or cloudinary URL
      IsPaid,
      Price,
      DiscountPrice,
      ValidityDays,
      Status,
      CategoryId
    } = req.body;

    // 🔹 6. Handle Cloudinary thumbnail change
    let uploadedImageUrl = existingTestSeries.Image; // default keeps old one

    if (Image && Image !== existingTestSeries.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old image if exists
        if (existingTestSeries.Image) {
          const public_id = existingTestSeries.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`TestSeries/${public_id}`);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'TestSeries',
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

    // 🔹 7. Dynamic update object
    const updateData: any = {
      ...(Title && { Title }),
      ...(Description && { Description }),
      Image: uploadedImageUrl,
      ...(Status && { Status }),
      ...(IsPaid !== undefined && { IsPaid }),
      ...(IsPaid ? { Price: Price ?? 0, DiscountPrice: DiscountPrice ?? 0, ValidityDays: ValidityDays ?? 0 } : { Price: 0, DiscountPrice: 0, ValidityDays: 0 }),
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
      ...(CategoryId && { CategoryId }),
    };

    // 🔹 8. Update DB and return latest record
    const updatedTestSeries = await TestSeriesModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedTestSeries) {
      res.status(404).json({ success: false, message: 'Test Series not found after update' });
      return;
    }

    // 🔹 9. Success Response
    res.status(200).json({
      success: true,
      message: '🎉 Test Series updated successfully',
      TestSeries: updatedTestSeries,
    });

  } catch (error: any) {
    console.error('❌ Error updating Test Series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Test Series',
      error: error.message,
    });
  }
};


 const deleteTestSeries= async (req: AuthRequest, res: Response): Promise<void> => {
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

    // ✅ Find the TestSeriesfirst
    const existingTestSeries= await TestSeriesModel.findById(id);
    if (!existingTestSeries) {
      res.status(404).json({ success: false, message: 'TestSeriesnot found' });
      return;
    }

    // ✅ Only the teacher who owns it or Admin can delete
    if (
      req.roles?.includes('Teacher') &&
      existingTestSeries.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Access denied: You can only delete your own Subjects' });
      return;
    }

    // ✅ Delete from Cloudinary if Image exists
   if (existingTestSeries.Image) {
     const cloudinary = req.app.locals.cloudinary;
          const public_id = existingTestSeries.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Subjects/${public_id}`);
        }

    // ✅ Delete the TestSeriesfrom MongoDB
    await TestSeriesModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ TestSeriesand associated image deleted successfully',
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


 const getAllPaidTestSeries = async (req: Request, res: Response): Promise<void> => {
  try {

    const TestSeries = await TestSeriesModel.find({IsPaid:true})
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: TestSeries.length, TestSeries });
  } catch (error: any) {
    console.error('Error fetching Subjects:', error);
    res.status(500).json({ message: 'Failed to fetch Subjects', error: error.message });
  }
};

 const getAllFreeTestSeries = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const TestSeries = await TestSeriesModel.find({IsPaid:false})
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: TestSeries.length, TestSeries });
  } catch (error: any) {
    console.error('Error fetching Subjects:', error);
    res.status(500).json({ message: 'Failed to fetch Subjects', error: error.message });
  }
};

const getTestSeriesByCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const TestSeries= await TestSeriesModel.find({CategoryId:categoryId})
    .populate('TeacherId', 'FirstName LastName Email')
    .populate('CategoryId', 'CategoryName');
    ;

    if (!TestSeries) {
      res.status(404).json({ message: 'TestSeries not found' });
      return;
    }

    res.status(200).json({ success: true, TestSeries});
  } catch (error: any) {
    console.error('Error fetching TestSeriesby ID:', error);
    res.status(500).json({ message: 'Failed to fetch Subject', error: error.message });
  }
};

export default { createTestSeries,getAllTestSeries,getTestSeriesById,updateTestSeries,
  deleteTestSeries,getAllPaidTestSeries,getAllFreeTestSeries,getTestSeriesByCategoryId};