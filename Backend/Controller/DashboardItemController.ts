import { Request, Response } from 'express';
import Dashboard_ItemModel from '../Models/DashboardItem';
import { AuthRequest } from '../Middleware/AuthMiddleware';



const createDashboard_Item = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // STEP 1: Check user authenticated
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // STEP 2: Extract allowed fields only
    const {
      Title,
      Description,
      Image,
      Type,
      Action,
      Visibility,
      OrderNumber,
      Status
    } = req.body;

    // STEP 3: Validate required fields
    if (!Title || !Type || !Action) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: Title, Type, Action'
      });
      return;
    }

    // STEP 4: Upload Image to Cloudinary (if provided)
    let uploadedImageUrl = '';
    if (Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        const result = await cloudinary.uploader.upload(Image, {
          folder: 'Dashboard_Items'
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
    }

    // STEP 5: Create new Dashboard Item
    const newDashboard_Item = new Dashboard_ItemModel({
      Title,
      Description: Description || '',
      Image: uploadedImageUrl || '',
      Type,
      Action,
      Visibility: Visibility || 'All',
      OrderNumber: OrderNumber || 0,
      Status: Status || 'Active',
      CreatedBy: user._id,
      TeacherId : user._id,
    });

    // STEP 6: Save in DB
    const savedDashboard_Item = await newDashboard_Item.save();

    res.status(201).json({
      success: true,
      message: 'Dashboard Item created successfully',
      Dashboard_Item: savedDashboard_Item,
    });

  } catch (error: any) {
    console.error('Error creating Dashboard_Item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Dashboard_Item',
      error: error.message,
    });
  }
};


 const getAllDashboard_Items = async (req: Request, res: Response): Promise<void> => {
  try {
    const Dashboard_Items = await Dashboard_ItemModel.find()
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: Dashboard_Items.length, Dashboard_Items });
  } catch (error: any) {
    console.error('Error fetching Dashboard_Items:', error);
    res.status(500).json({ message: 'Failed to fetch Dashboard_Items', error: error.message });
  }
};


 const getDashboard_ItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const Dashboard_Item = await Dashboard_ItemModel.findById(id).populate('TeacherId', 'FirstName LastName Email');

    if (!Dashboard_Item) {
      res.status(404).json({ message: 'Dashboard_Item not found' });
      return;
    }

    res.status(200).json({ success: true, Dashboard_Item });
  } catch (error: any) {
    console.error('Error fetching Dashboard_Item by ID:', error);
    res.status(500).json({ message: 'Failed to fetch Dashboard_Item', error: error.message });
  }
};


const updateDashboard_Item = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // 1. Auth Check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // 2. Role Based Access: Admin + Teacher only
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only Admin or Teacher can update Dashboard Item',
      });
      return;
    }

    // 3. Fetch Existing Document
    const existing = await Dashboard_ItemModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Dashboard Item not found' });
      return;
    }

    // 4. Teacher can update only his own items
    if (
      req.roles?.includes('Teacher') &&
      existing.CreatedBy.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'You can update only your own Dashboard Items',
      });
      return;
    }

    // 5. Extract allowed fields
    const {
      Title,
      Description,
      Image,
      Type,
      Action,
      Visibility,
      OrderNumber,
      Status
    } = req.body;

    // 6. Cloudinary Image Upload (if new image)
    let uploadedImageUrl = existing.Image;

    if (Image && Image !== existing.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old image
        if (existing.Image) {
          const publicId = existing.Image.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`Dashboard_Items/${publicId}`);
          }
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'Dashboard_Items',
        });

        uploadedImageUrl = result.secure_url;
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        res.status(500).json({
          success: false,
          message: "Image upload failed",
          error
        });
        return;
      }
    }

    // 7. Prepare Update Object (Only allowed fields)
    const updateData: any = {
      ...(Title && { Title }),
      ...(Description && { Description }),
      ...(Type && { Type }),
      ...(Action && { Action }),
      ...(Visibility && { Visibility }),
      ...(OrderNumber !== undefined && { OrderNumber }),
      ...(Status && { Status }),
      Image: uploadedImageUrl,
      updatedDate: new Date(),
    };

    // 8. Update the document
    const updatedItem = await Dashboard_ItemModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem) {
      res.status(404).json({ success: false, message: 'Dashboard Item not found after update' });
      return;
    }

    // 9. SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: 'Dashboard Item updated successfully',
      Dashboard_Item: updatedItem,
    });

  } catch (error: any) {
    console.error("Error updating Dashboard Item:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Dashboard Item',
      error: error.message,
    });
  }
};



 const deleteDashboard_Item = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(403).json({ success: false, message: 'Access denied: Only Admin or Teacher can delete Dashboard_Item' });
      return;
    }

    // ✅ Find the Dashboard_Item first
    const existingDashboard_Item = await Dashboard_ItemModel.findById(id);
    if (!existingDashboard_Item) {
      res.status(404).json({ success: false, message: 'Dashboard_Item not found' });
      return;
    }

    // ✅ Only the teacher who owns it or Admin can delete
    if (
      req.roles?.includes('Teacher') &&
      existingDashboard_Item.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Access denied: You can only delete your own Dashboard_Items' });
      return;
    }

    // ✅ Delete from Cloudinary if Image exists
   if (existingDashboard_Item.Image) {
     const cloudinary = req.app.locals.cloudinary;
          const public_id = existingDashboard_Item.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Dashboard_Items/${public_id}`);
        }

    // ✅ Delete the Dashboard_Item from MongoDB
    await Dashboard_ItemModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ Dashboard_Item and associated image deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting Dashboard_Item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Dashboard_Item',
      error: error.message,
    });
  }
};



 const getAll_Active_Dashboard_Items = async (req: Request, res: Response): Promise<void> => {
  try {
    const Dashboard_Items = await Dashboard_ItemModel.find({Status:'Active'})
      .sort({ OrderNumber: 1 });

    res.status(200).json({ success: true, total: Dashboard_Items.length, Dashboard_Items });
  } catch (error: any) {
    console.error('Error fetching Dashboard_Items:', error);
    res.status(500).json({ message: 'Failed to fetch Dashboard_Items', error: error.message });
  }
};

export default { createDashboard_Item,getAllDashboard_Items,
    getDashboard_ItemById,updateDashboard_Item,deleteDashboard_Item,getAll_Active_Dashboard_Items};