import { Request, Response } from 'express';
import ChapterModel from '../Models/Chapter';
import { AuthRequest } from '../Middleware/AuthMiddleware';
import mongoose from "mongoose";
import TopicModel from "../Models/TopicOrClass";
import QuestionModel from "../Models/Question";
import QuestionOptionModel from '../Models/QuestionOption';


const createChapter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // ✅ Step 1: Ensure user is authenticated
        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
            return;
        }

        // ✅ Step 2: Extract Chapter data from request body
        const {
            Title,
            Description,
            Image,
            
            SubjectId,
            Status

        } = req.body;

        // ✅ Step 3: Validate required fields
        if (!Title || !Description || !Image) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }

        let uploadedImageUrl = '';
        if (Image) {
            try {
                const cloudinary = req.app.locals.cloudinary;
                const result = await cloudinary.uploader.upload(Image, {
                    folder: 'Chapters'
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

        // ✅ Step 4: Create Chapter document
        const newChapter = new ChapterModel({
            Title,
            Description,
            Image: uploadedImageUrl || '',
            SubjectId,
            Status: Status || 'Active',
            CreatedBy: user._id,
        });

        // ✅ Step 5: Save Chapter to database
        const savedChapter = await newChapter.save();

        // ✅ Step 6: Send success response
        res.status(201).json({
            success: true,
            message: '✅ Chapter created successfully',
            Chapter: savedChapter,
        });
    } catch (error: any) {
        console.error('❌ Error creating Chapter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Chapter',
            error: error.message,
        });
    }
};



const getAllChapters = async (req: Request, res: Response): Promise<void> => {
    try {
        const Chapters = await ChapterModel.find()
            .populate('SubjectId', 'Title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: Chapters.length, Chapters });
    } catch (error: any) {
        console.error('Error fetching Chapters:', error);
        res.status(500).json({ message: 'Failed to fetch Chapters', error: error.message });
    }
};


const getChapterById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const Chapter = await ChapterModel.findById(id)
        .populate('SubjectId', 'Title');

        if (!Chapter) {
            res.status(404).json({ message: 'Chapter not found' });
            return;
        }

        res.status(200).json({ success: true, Chapter });
    } catch (error: any) {
        console.error('Error fetching Chapter by ID:', error);
        res.status(500).json({ message: 'Failed to fetch Chapter', error: error.message });
    }
};


const updateChapter = async (req: AuthRequest, res: Response): Promise<void> => {
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
                message: 'Access denied: Only Admin or Teacher can update Chapter',
            });
            return;
        }

        // ✅ 3. Fetch existing Chapter
        const existingChapter = await ChapterModel.findById(id);
        if (!existingChapter) {
            res.status(404).json({ success: false, message: 'Chapter not found' });
            return;
        }

      

        // ✅ 4. Extract updatable fields
        const {
            Title,
            Description,
            Image,
            SubjectId,
            Status
        } = req.body;

        // ✅ 5. Handle Cloudinary image upload if a new base64 image is sent
        let uploadedImageUrl = existingChapter.Image; // default to old one

        if (Image && Image !== existingChapter.Image) {
            try {
                const cloudinary = req.app.locals.cloudinary;

                // Delete old image if exists
                if (existingChapter.Image) {
                    const public_id = existingChapter.Image.split('/').pop()?.split('.')[0];
                    await cloudinary.uploader.destroy(`Chapters/${public_id}`);
                }

                // Upload new image
                const result = await cloudinary.uploader.upload(Image, {
                    folder: 'Chapters',
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
            ...(Title && { Title }),
            ...(Description && { Description }),
            ...(SubjectId && { SubjectId }),
            Image: uploadedImageUrl,
            ...(Status && { Status }),
            UpdatedBy: user._id,
            UpdatedAt: new Date(),
        };

        // ✅ 7. Update and return latest version
        const updatedChapter = await ChapterModel.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedChapter) {
            res.status(404).json({ success: false, message: 'Chapter not found after update' });
            return;
        }

        // ✅ 8. Success Response
        res.status(200).json({
            success: true,
            message: '✅ Chapter updated successfully',
            Chapter: updatedChapter,
        });
    } catch (error: any) {
        console.error('❌ Error updating Chapter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update Chapter',
            error: error.message,
        });
    }
};




const deleteChapter = async (req: AuthRequest, res: Response): Promise<void> => {
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
            res.status(403).json({ success: false, message: 'Access denied: Only Admin or Teacher can delete Chapter' });
            return;
        }

        // ✅ Find the Chapter first
        const existingChapter = await ChapterModel.findById(id);
        if (!existingChapter) {
            res.status(404).json({ success: false, message: 'Chapter not found' });
            return;
        }

      

        // ✅ Delete from Cloudinary if Image exists
        if (existingChapter.Image) {
            const cloudinary = req.app.locals.cloudinary;
            const public_id = existingChapter.Image.split('/').pop()?.split('.')[0];
            await cloudinary.uploader.destroy(`Chapters/${public_id}`);
        }

        // ✅ Delete the Chapter from MongoDB
        await ChapterModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: '✅ Chapter and associated image deleted successfully',
        });
    } catch (error: any) {
        console.error('❌ Error deleting Chapter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete Chapter',
            error: error.message,
        });
    }
};


const deleteAllChapters = async (req: AuthRequest, res: Response): Promise<void> => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;

    // ✅ Auth check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ✅ Role check
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only Admin or Teacher can delete Chapters'
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // ✅ 1. Get Chapters
    let chapters;

    if (req.roles?.includes('Admin') || req.roles?.includes('Teacher')) {
      chapters = await ChapterModel.find({}, "_id Image").session(session);
    } else {
      chapters = await ChapterModel.find({ TeacherId: user._id }, "_id Image").session(session);
    }

    if (!chapters.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'No chapters found to delete'
      });
    }

    const chapterIds = chapters.map(c => c._id);

    // ✅ 2. Get Topics
    const topics = await TopicModel.find({
      ChapterId: { $in: chapterIds }
    }).session(session);

    // ✅ 3. Get Questions (SAFE FILTER)
    const questions = await QuestionModel.find({
      ChapterId: { $exists: true, $ne: null, $in: chapterIds }
    }).session(session);

    const questionIds = questions.map(q => q._id);

    // ================== ☁️ CLOUDINARY DELETE ==================

    // ✅ Chapter Images
    await Promise.all(chapters.map(async (c) => {
      if (c.Image) {
        const public_id = c.Image.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Chapters/${public_id}`);
      }
    }));

    // ✅ Topic Thumbnails
    await Promise.all(topics.map(async (t) => {
      if (t.videoThumbnail) {
        const public_id = t.videoThumbnail.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Topics/${public_id}`);
      }
    }));

    // ✅ Question Images
    await Promise.all(questions.map(async (q) => {
      if (q.QuestionImage) {
        const public_id = q.QuestionImage.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Questions/${public_id}`);
      }
    }));

    // ================== 🧹 DATABASE DELETE ==================

    // ✅ Question Options
    await QuestionOptionModel.deleteMany({
      QuestionId: { $in: questionIds }
    }).session(session);

    // ✅ Questions
    await QuestionModel.deleteMany({
      ChapterId: { $exists: true, $ne: null, $in: chapterIds }
    }).session(session);

    // ✅ Topics
    await TopicModel.deleteMany({
      ChapterId: { $in: chapterIds }
    }).session(session);

    // ✅ Chapters
    await ChapterModel.deleteMany({}).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: '✅ All chapters and related data deleted successfully',
    });

  } catch (error: any) {

    await session.abortTransaction();
    session.endSession();

    console.error('❌ Error deleting all chapters:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete chapters',
      error: error.message,
    });
  }
};

const getChaptersBySubjectId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const Chapters = await ChapterModel.find({SubjectId:id})

        if (!Chapters) {
            res.status(404).json({ message: 'Chapter not found' });
            return;
        }

        res.status(200).json({ success: true, Chapters });
    } catch (error: any) {
        console.error('Error fetching Chapter by ID:', error);
        res.status(500).json({ message: 'Failed to fetch Chapter', error: error.message });
    }
};

export default { createChapter, getAllChapters, getChapterById, updateChapter, deleteChapter,getChaptersBySubjectId ,deleteAllChapters};