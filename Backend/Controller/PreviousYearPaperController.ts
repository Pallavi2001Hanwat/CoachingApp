
import { Request, Response } from 'express';
import PreviousYearPaperModel from '../Models/PreviousYearPaper';
import { AuthRequest } from '../Middleware/AuthMiddleware';



const createPreviousYearPaper = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      PYPCategoryId,
      PaperTitle,
      PaperCode,
      Year,
      Stage,
      Shift,
      Language,
      TotalQuestions,
      TotalMarks,
      TimeDuration,
      PaperFileUrl,
      Status,
    } = req.body;

    if (!PYPCategoryId || !PaperTitle || !PaperCode || !Year || !PaperFileUrl)
      return res.status(400).json({ message: 'Missing required fields' });

    const existingPaper = await PreviousYearPaperModel.findOne({ PaperCode });
    if (existingPaper)
      return res.status(400).json({ message: 'PaperCode already exists' });

    // --------------------------
    // UPLOAD PDF
    // --------------------------
    let uploadedPaperUrl = '';
    try {
      const cloudinary = req.app.locals.cloudinary;

      const result = await cloudinary.uploader.upload(PaperFileUrl, {
        folder: 'PreviousYearPapers',
        resource_type: 'raw', // important for PDFs
      });

      uploadedPaperUrl = result.secure_url;
    } catch (error) {
      console.error('Cloudinary PDF Upload Error:', error);
      return res.status(500).json({ message: 'PDF upload failed', error });
    }

    const newPaper = new PreviousYearPaperModel({
      PYPCategoryId,
      PaperTitle,
      PaperCode,
      Year,
      Stage,
      Shift,
      Language,
      TotalQuestions,
      TotalMarks,
      TimeDuration,
      PaperFileUrl: uploadedPaperUrl,
      Status: Status || 'Active',
      CreatedBy: user._id,
    });

    const savedPaper = await newPaper.save();

    res.status(201).json({
      success: true,
      message: '✅ Paper created successfully',
      Paper: savedPaper,
    });
  } catch (err: any) {
    console.error('Create Paper Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create paper', error: err.message });
  }
};


const getAllPreviousYearPapers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const papers = await PreviousYearPaperModel.find()
      .populate('PYPCategoryId', 'Title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      Papers: papers,
    });
  } catch (error: any) {
    console.error('Error fetching papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch papers',
      error: error.message,
    });
  }
};


const getPreviousYearPaperById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the paper and populate the category
    const paper = await PreviousYearPaperModel.findById(id)
      .populate('PYPCategoryId', 'Title'); // only get Title of category

    if (!paper) {
      res.status(404).json({
        success: false,
        message: 'Paper not found',
      });
      return;
    }

    // Map to include CategoryId for frontend
    const responsePaper = {
      _id: paper._id,
      PaperTitle: paper.PaperTitle,
      PaperCode: paper.PaperCode,
      Year: paper.Year,
      Stage: paper.Stage,
      Shift: paper.Shift,
      Language: paper.Language,
      TotalQuestions: paper.TotalQuestions,
      TotalMarks: paper.TotalMarks,
      TimeDuration: paper.TimeDuration,
      PaperFileUrl: paper.PaperFileUrl,
      Status: paper.Status,
      PYPCategoryId: paper.PYPCategoryId?._id || null, // id for frontend select
    };

    res.status(200).json({
      success: true,
      Paper: responsePaper,
    });
  } catch (error: any) {
    console.error('Error fetching paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paper',
      error: error.message,
    });
  }
};


const updatePreviousYearPaper = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const paper = await PreviousYearPaperModel.findById(id);
    if (!paper)
      return res.status(404).json({ success: false, message: 'Paper not found' });

    const {
      PYPCategoryId,
      PaperTitle,
      PaperCode,
      Year,
      Stage,
      Shift,
      Language,
      TotalQuestions,
      TotalMarks,
      TimeDuration,
      PaperFileUrl,
      Status,
    } = req.body;

    let uploadedPaperUrl = paper.PaperFileUrl; // default to old

    // --------------------------
    // Replace PDF if new base64/URL provided
    // --------------------------
    if (PaperFileUrl && PaperFileUrl !== paper.PaperFileUrl) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old PDF
        if (paper.PaperFileUrl) {
          const publicId = paper.PaperFileUrl.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`PreviousYearPapers/${publicId}`, {
            resource_type: 'raw',
          });
        }

        // Upload new PDF
        const result = await cloudinary.uploader.upload(PaperFileUrl, {
          folder: 'PreviousYearPapers',
          resource_type: 'raw',
        });

        uploadedPaperUrl = result.secure_url;
      } catch (err) {
        console.error('PDF replace failed:', err);
        return res.status(500).json({ message: 'PDF upload failed', error: err });
      }
    }

    // --------------------------
    // Update fields dynamically
    // --------------------------
    const updateData: any = {
      ...(PYPCategoryId && { PYPCategoryId }),
      ...(PaperTitle && { PaperTitle }),
      ...(PaperCode && { PaperCode }),
      ...(Year && { Year }),
      ...(Stage && { Stage }),
      ...(Shift && { Shift }),
      ...(Language && { Language }),
      ...(TotalQuestions && { TotalQuestions }),
      ...(TotalMarks && { TotalMarks }),
      ...(TimeDuration && { TimeDuration }),
      ...(Status && { Status }),
      PaperFileUrl: uploadedPaperUrl,
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    const updatedPaper = await PreviousYearPaperModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: '✅ Paper updated successfully',
      Paper: updatedPaper,
    });
  } catch (err: any) {
    console.error('Update Paper Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update paper', error: err.message });
  }
};


const deletePreviousYearPaper = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const paper = await PreviousYearPaperModel.findById(id);
    if (!paper) {
      res.status(404).json({
        success: false,
        message: 'Paper not found',
      });
      return;
    }

    // --------------------------
    // DELETE FILE FROM CLOUDINARY
    // --------------------------
    if (paper.PaperFileUrl) {
      try {
        const cloudinary = req.app.locals.cloudinary;
        const parts = paper.PaperFileUrl.split('/');
        const fileName = parts[parts.length - 1];
        const publicId = `PreviousYearPapers/${fileName.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId, {
          resource_type: 'raw',
        });
      } catch (err) {
        console.error('Cloudinary file delete failed:', err);
      }
    }

    // --------------------------
    // HARD DELETE FROM DB
    // --------------------------
    await PreviousYearPaperModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Paper permanently deleted',
    });
  } catch (error: any) {
    console.error('Error deleting paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete paper',
      error: error.message,
    });
  }
};


const getPreviousYearPaperByPYPCategoryId = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { PYPCategoryId } = req.params;

    // Find all papers for the category and populate the category title
    const papers = await PreviousYearPaperModel.find({ PYPCategoryId })
      .populate('PYPCategoryId', 'Title'); // only get Title of category

    if (!papers || papers.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No papers found for this category',
      });
      return;
    }

    // Map each paper to include CategoryId for frontend
    const responsePapers = papers.map((paper) => ({
      _id: paper._id,
      PaperTitle: paper.PaperTitle,
      PaperCode: paper.PaperCode,
      Year: paper.Year,
      Stage: paper.Stage,
      Shift: paper.Shift,
      Language: paper.Language,
      TotalQuestions: paper.TotalQuestions,
      TotalMarks: paper.TotalMarks,
      TimeDuration: paper.TimeDuration,
      PaperFileUrl: paper.PaperFileUrl,
      Status: paper.Status,
      PYPCategoryId: paper.PYPCategoryId?._id || null, // id for frontend select
      PYPCategoryTitle: paper.PYPCategoryId?.Title || '', // optional: send title too
    }));

    res.status(200).json({
      success: true,
      Papers: responsePapers,
    });
  } catch (error: any) {
    console.error('Error fetching papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch papers',
      error: error.message,
    });
  }
};

 const deleteAllPreviousYearPapers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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

    // Fetch all papers
    const papers = await PreviousYearPaperModel.find();
    if (!papers.length) {
      res.status(404).json({ success: false, message: 'No papers found' });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // Loop through papers and delete files
    for (const paper of papers) {
      if (paper.PaperFileUrl) {
        try {
          const parts = paper.PaperFileUrl.split('/');
          const fileName = parts[parts.length - 1]; // abc123.pdf
          const publicId = `PreviousYearPapers/${fileName.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        } catch (err) {
          console.error(`Failed to delete file for paper ${paper._id}:`, err);
        }
      }
    }

    // Delete all papers from DB
    await PreviousYearPaperModel.deleteMany();

    res.status(200).json({
      success: true,
      message: '✅ All PreviousYearPapers deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting all PYP papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all papers',
      error: error.message,
    });
  }
};

export default {
  createPreviousYearPaper,
  getAllPreviousYearPapers,
  getPreviousYearPaperById,
  updatePreviousYearPaper,
  deletePreviousYearPaper,
  getPreviousYearPaperByPYPCategoryId,
  deleteAllPreviousYearPapers
};