import { Request, Response } from 'express';
import SubjectModel from '../Models/Subject';
import ChapterModel from '../Models/Chapter';

import { AuthRequest } from '../Middleware/AuthMiddleware';
import mongoose from "mongoose";
import TopicModel from "../Models/TopicOrClass";
import QuestionModel from "../Models/Question";
import QuestionOptionModel from '../Models/QuestionOption';


const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ✅ Step 1: Ensure user is authenticated
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // ✅ Step 2: Extract Subject data from request body
    const {
      Title,
      SubjectCode,
      Description,
      Image,
      Status
      
    } = req.body;

    // ✅ Step 3: Validate required fields
    if (!Title || !Description || !Image ) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

     let uploadedImageUrl = '';
        if (Image) {
            try {
                const cloudinary = req.app.locals.cloudinary;
                const result = await cloudinary.uploader.upload(Image, {
                    folder: 'Subjects'
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

    // ✅ Step 4: Create Subject document
    const newSubject = new SubjectModel({
      Title,
      Description,
      Image: uploadedImageUrl || '',
      SubjectCode,
      TeacherId: user._id, // 
      Status: Status || 'Active',
       CreatedBy: user._id,
    });

    // ✅ Step 5: Save Subject to database
    const savedSubject = await newSubject.save();

    // ✅ Step 6: Send success response
    res.status(201).json({
      success: true,
      message: '✅ Subject created successfully',
      Subject: savedSubject,
    });
  } catch (error: any) {
    console.error('❌ Error creating Subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Subject',
      error: error.message,
    });
  }
};



 const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const Subjects = await SubjectModel.find()
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: Subjects.length, Subjects });
  } catch (error: any) {
    console.error('Error fetching Subjects:', error);
    res.status(500).json({ message: 'Failed to fetch Subjects', error: error.message });
  }
};


 const getSubjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const Subject = await SubjectModel.findById(id).populate('TeacherId', 'FirstName LastName Email');

    if (!Subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    res.status(200).json({ success: true, Subject });
  } catch (error: any) {
    console.error('Error fetching Subject by ID:', error);
    res.status(500).json({ message: 'Failed to fetch Subject', error: error.message });
  }
};


const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const existingSubject = await SubjectModel.findById(id);
    if (!existingSubject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    // ✅ Teachers can update only their own Subjects
    if (
      req.roles?.includes('Teacher') &&
      existingSubject.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own Subjects',
      });
      return;
    }

    // ✅ 4. Extract updatable fields
    const {
    Title,
      SubjectCode,
      Description,
      Image,
      Status
    } = req.body;

    // ✅ 5. Handle Cloudinary image upload if a new base64 image is sent
    let uploadedImageUrl = existingSubject.Image; // default to old one

    if (Image && Image !== existingSubject.Image) {
      try {
        const cloudinary = req.app.locals.cloudinary;

        // Delete old image if exists
        if (existingSubject.Image) {
          const public_id = existingSubject.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Subjects/${public_id}`);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(Image, {
          folder: 'Subjects',
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
      ...(SubjectCode && { SubjectCode }),
        Image: uploadedImageUrl,
      ...(Status && { Status }),
      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    // ✅ 7. Update and return latest version
    const updatedSubject = await SubjectModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedSubject) {
      res.status(404).json({ success: false, message: 'Subject not found after update' });
      return;
    }

    // ✅ 8. Success Response
    res.status(200).json({
      success: true,
      message: '✅ Subject updated successfully',
      Subject: updatedSubject,
    });
  } catch (error: any) {
    console.error('❌ Error updating Subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Subject',
      error: error.message,
    });
  }
};




 const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const existingSubject = await SubjectModel.findById(id);
    if (!existingSubject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    // ✅ Only the teacher who owns it or Admin can delete
    if (
      req.roles?.includes('Teacher') &&
      existingSubject.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Access denied: You can only delete your own Subjects' });
      return;
    }

    // ✅ Delete from Cloudinary if Image exists
   if (existingSubject.Image) {
     const cloudinary = req.app.locals.cloudinary;
          const public_id = existingSubject.Image.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Subjects/${public_id}`);
        }

    // ✅ Delete the Subject from MongoDB
    await SubjectModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ Subject and associated image deleted successfully',
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


const deleteAllSubjects = async (req: AuthRequest, res: Response): Promise<void> => {

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
        message: 'Access denied: Only Admin or Teacher can delete Subjects'
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // ✅ 1. Get Subjects
    let subjects;

    if (req.roles?.includes('Admin') || req.roles?.includes('Teacher')) {
      subjects = await SubjectModel.find({}, "_id Image").session(session);
    } else {
      subjects = await SubjectModel.find({ TeacherId: user._id }, "_id Image").session(session);
    }

    if (!subjects.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'No subjects found to delete'
      });
    }

    const subjectIds = subjects.map(s => s._id);

    // ✅ 2. Get Chapters
    const chapters = await ChapterModel.find({
      SubjectId: { $in: subjectIds }
    }).session(session);

    const chapterIds = chapters.map(c => c._id);

    // ✅ 3. Get Topics
    const topics = await TopicModel.find({
      SubjectId: { $in: subjectIds }
    }).session(session);

    // ✅ 4. Get Questions (SAFE FILTER)
    const questions = await QuestionModel.find({
      $or: [
        {
          SubjectId: { $exists: true, $ne: null, $in: subjectIds }
        },
        {
          ChapterId: { $exists: true, $ne: null, $in: chapterIds }
        }
      ]
    }).session(session);

    const questionIds = questions.map(q => q._id);

    // ================== ☁️ CLOUDINARY DELETE ==================

    // ✅ Subjects Images
    await Promise.all(subjects.map(async (s) => {
      if (s.Image) {
        const public_id = s.Image.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Subjects/${public_id}`);
      }
    }));

    // ✅ Chapters Images
    await Promise.all(chapters.map(async (c) => {
      if (c.Image) {
        const public_id = c.Image.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Chapters/${public_id}`);
      }
    }));

    // ✅ Topics Thumbnails
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

    // ✅ Questions (SAFE DELETE)
    await QuestionModel.deleteMany({
      $or: [
        {
          SubjectId: { $exists: true, $ne: null, $in: subjectIds }
        },
        {
          ChapterId: { $exists: true, $ne: null, $in: chapterIds }
        }
      ]
    }).session(session);

    // ✅ Topics
    await TopicModel.deleteMany({
      SubjectId: { $in: subjectIds }
    }).session(session);

    // ✅ Chapters
    await ChapterModel.deleteMany({
      SubjectId: { $in: subjectIds }
    }).session(session);

    // ✅ Subjects
   
      await SubjectModel.deleteMany({}).session(session);
    

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: '✅ All subjects and related data deleted successfully',
    });

  } catch (error: any) {

    await session.abortTransaction();
    session.endSession();

    console.error('❌ Error deleting all subjects:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete subjects',
      error: error.message,
    });
  }
};

 const getChaptersBySubjectId = async (
  req: Request,
  res: Response
) => {
  try {
    const { subjectId } = req.params;

    const chapters = await ChapterModel.find({
      SubjectId: subjectId,
      Status: 'Active',
    }).sort({ createdDate: 1 });

    return res.status(200).json({
      success: true,
      chapters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default { createSubject,getAllSubjects,getSubjectById,updateSubject,deleteSubject,getChaptersBySubjectId,deleteAllSubjects};