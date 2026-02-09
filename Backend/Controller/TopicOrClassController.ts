import { Request, Response } from 'express';
import TopicOrClassModel from '../Models/TopicOrClass';
import { AuthRequest } from '../Middleware/AuthMiddleware';



const createTopicOrClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized: Please login first" });
      return;
    }

    const {
      Title,
      Description,
      VideoURL,        // <-- base64 or temp file path
      Duration,
      videoThumbnail,
      pdfUrl,
      extraFiles,
      classType,
      classOrder,
      duration,
      isFree,
      isLocked,
      ChapterId,
      SubjectId,
      Status,
    } = req.body;

    // --------------------------
    // VALIDATION
    // --------------------------
    if (!Title  || !ChapterId || !SubjectId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: Title, VideoURL, ChapterId, SubjectId are required",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // --------------------------
    // VIDEO UPLOAD
    // --------------------------
    let uploadedVideoUrl = "";
    if(VideoURL){
  try {
      const result = await cloudinary.uploader.upload(VideoURL, {
        folder: "Topics/Videos",
        resource_type: "video",        // VERY IMPORTANT
        chunk_size: 6000000,           // Optional (for large videos)
      });

      uploadedVideoUrl = result.secure_url;
    } catch (err) {
      console.error("Video Upload Error:", err);
      res.status(500).json({ success: false, message: "Video upload failed" });
      return;
    }
    }
  

    // --------------------------
    // THUMBNAIL UPLOAD
    // --------------------------
    let uploadedThumbnailUrl = "";
    if (videoThumbnail) {
      try {
        const result = await cloudinary.uploader.upload(videoThumbnail, {
          folder: "Topics/thumbnails",
        });
        uploadedThumbnailUrl = result.secure_url;
      } catch (err) {
        console.error("Thumbnail Upload Error:", err);
        res.status(500).json({ success: false, message: "Thumbnail upload failed" });
        return;
      }
    }

    // --------------------------
    // PDF UPLOAD
    // --------------------------
    let uploadedPdfUrl = "";
    if (pdfUrl) {
      try {
        const result = await cloudinary.uploader.upload(pdfUrl, {
          folder: "Topics/pdfs",
          resource_type: "raw",       // PDF is raw file
        });
        uploadedPdfUrl = result.secure_url;
      } catch (err) {
        console.error("PDF Upload Error:", err);
        res.status(500).json({ success: false, message: "PDF upload failed" });
        return;
      }
    }

    // --------------------------
    // EXTRA FILES UPLOAD (multiple)
    // --------------------------
    let uploadedExtraFiles: string[] = [];

    if (Array.isArray(extraFiles) && extraFiles.length > 0) {
      try {
        for (const file of extraFiles) {
          const result = await cloudinary.uploader.upload(file, {
            folder: "Topics/extras",
            resource_type: "raw",
          });
          uploadedExtraFiles.push(result.secure_url);
        }
      } catch (err) {
        console.error("Extra Files Upload Error:", err);
        res.status(500).json({ success: false, message: "Extra file upload failed" });
        return;
      }
    }

    // --------------------------
    // CREATE VIDEO DOCUMENT
    // --------------------------
    const newVideo = new TopicOrClassModel({
      Title,
      Description,
      VideoURL: uploadedVideoUrl,
      Duration: Duration || 0,

      videoThumbnail: uploadedThumbnailUrl,
      pdfUrl: uploadedPdfUrl,
      extraFiles: uploadedExtraFiles,

      classType: classType || "",
      classOrder: classOrder || 0,
      duration: duration || 0,

      isFree: isFree ?? false,
      isLocked: isLocked ?? false,

      ChapterId,
      SubjectId,
      TeacherId: user._id,
      CreatedBy: user._id,
      Status: Status || "Active",
    });

    const savedVideo = await newVideo.save();

    res.status(201).json({
      success: true,
      message: "🎉 Video uploaded & created successfully",
      Video: savedVideo,
    });

  } catch (error: any) {
    console.error("❌ Error creating video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create video",
      error: error.message,
    });
  }
};




 const getAllTopicOrClasss = async (req: Request, res: Response): Promise<void> => {
  try {
    const TopicOrClasss = await TopicOrClassModel.find()
      .populate('TeacherId', 'FirstName LastName Email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: TopicOrClasss.length, TopicOrClasss });
  } catch (error: any) {
    console.error('Error fetching TopicOrClasss:', error);
    res.status(500).json({ message: 'Failed to fetch TopicOrClasss', error: error.message });
  }
};


 const getTopicOrClassById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const TopicOrClass = await TopicOrClassModel.findById(id).populate('TeacherId', 'FirstName LastName Email');

    if (!TopicOrClass) {
      res.status(404).json({ message: 'TopicOrClass not found' });
      return;
    }

    res.status(200).json({ success: true, TopicOrClass });
  } catch (error: any) {
    console.error('Error fetching TopicOrClass by ID:', error);
    res.status(500).json({ message: 'Failed to fetch TopicOrClass', error: error.message });
  }
};


const updateTopicOrClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ---------------------------------------
    // 1. Check Authentication
    // ---------------------------------------
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized: Please login first" });
      return;
    }

    // ---------------------------------------
    // 2. Role-based Access
    // ---------------------------------------
    const allowedRoles = ["Admin", "Teacher"];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "Access denied: Only Admin or Teacher can update TopicOrClass",
      });
      return;
    }

    // ---------------------------------------
    // 3. Fetch existing record
    // ---------------------------------------
    const existing = await TopicOrClassModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: "TopicOrClass not found" });
      return;
    }

    // ---------------------------------------
    // 4. Teacher can update only own videos
    // ---------------------------------------
    if (
      req.roles?.includes("Teacher") &&
      existing.CreatedBy.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied: You can only update your own TopicOrClass",
      });
      return;
    }

    // ---------------------------------------
    // 5. Extract incoming fields
    // ---------------------------------------
    const {
      Title,
      Description,
      VideoURL,
      Duration,
      videoThumbnail,
      pdfUrl,
      extraFiles,
      classType,
      classOrder,
      duration,
      isFree,
      isLocked,
      ChapterId,
      SubjectId,
      Status,
    } = req.body;

    const cloudinary = req.app.locals.cloudinary;

    // ---------------------------------------
    // 6. VIDEO UPDATE
    // ---------------------------------------
    let updatedVideoUrl = existing.VideoURL;

    if (VideoURL) {
      try {
        // delete old
        if (existing.VideoURL) {
          const public_id = existing.VideoURL.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`Topics/Videos/${public_id}`, { resource_type: "video" });
        }

        // upload new
        const result = await cloudinary.uploader.upload(VideoURL, {
          folder: "Topics/Videos",
          resource_type: "video",
          chunk_size: 6000000,
        });

        updatedVideoUrl = result.secure_url;
      } catch (err) {
        console.error("Video Update Error:", err);
        res.status(500).json({ success: false, message: "Video update failed" });
        return;
      }
    }

    // ---------------------------------------
    // 7. THUMBNAIL UPDATE
    // ---------------------------------------
    let updatedThumbnailUrl = existing.videoThumbnail;

    if (videoThumbnail) {
      try {
        if (existing.videoThumbnail) {
          const public_id = existing.videoThumbnail.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Topics/thumbnails/${public_id}`);
        }

        const result = await cloudinary.uploader.upload(videoThumbnail, {
          folder: "Topics/thumbnails",
        });

        updatedThumbnailUrl = result.secure_url;
      } catch (err) {
        console.error("Thumbnail Update Error:", err);
        res.status(500).json({ success: false, message: "Thumbnail upload failed" });
        return;
      }
    }

    // ---------------------------------------
    // 8. PDF UPDATE
    // ---------------------------------------
    let updatedPdfUrl = existing.pdfUrl;

    if (pdfUrl) {
      try {
        if (existing.pdfUrl) {
          const public_id = existing.pdfUrl.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Topics/pdfs/${public_id}`, { resource_type: "raw" });
        }

        const result = await cloudinary.uploader.upload(pdfUrl, {
          folder: "Topics/pdfs",
          resource_type: "raw",
        });

        updatedPdfUrl = result.secure_url;
      } catch (err) {
        console.error("PDF Update Error:", err);
        res.status(500).json({ success: false, message: "PDF upload failed" });
        return;
      }
    }

    // ---------------------------------------
    // 9. EXTRA FILES UPDATE
    // ---------------------------------------
    let updatedExtraFiles = existing.extraFiles;

    if (Array.isArray(extraFiles) && extraFiles.length > 0) {
      updatedExtraFiles = [];

      try {
        // delete old files
        for (const fileUrl of existing.extraFiles) {
          const public_id = fileUrl.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Topics/extras/${public_id}`, { resource_type: "raw" });
        }

        // upload new ones
        for (const file of extraFiles) {
          const result = await cloudinary.uploader.upload(file, {
            folder: "Topics/extras",
            resource_type: "raw",
          });
          updatedExtraFiles.push(result.secure_url);
        }
      } catch (err) {
        console.error("Extra Files Update Error:", err);
        res.status(500).json({ success: false, message: "Extra files update failed" });
        return;
      }
    }

    // ---------------------------------------
    // 10. Build Dynamic Update Object
    // ---------------------------------------
    const updateData: any = {
      ...(Title && { Title }),
      ...(Description && { Description }),
      VideoURL: updatedVideoUrl,
      Duration: Duration ?? existing.Duration,

      videoThumbnail: updatedThumbnailUrl,
      pdfUrl: updatedPdfUrl,
      extraFiles: updatedExtraFiles,

      ...(classType && { classType }),
      ...(classOrder && { classOrder }),
      ...(duration && { duration }),
      isFree: isFree ?? existing.isFree,
      isLocked: isLocked ?? existing.isLocked,

      ...(ChapterId && { ChapterId }),
      ...(SubjectId && { SubjectId }),
      ...(Status && { Status }),

      UpdatedBy: user._id,
      UpdatedAt: new Date(),
    };

    // ---------------------------------------
    // 11. Update in DB
    // ---------------------------------------
    const updatedTopic = await TopicOrClassModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "✅ TopicOrClass updated successfully",
      TopicOrClass: updatedTopic,
    });

  } catch (error: any) {
    console.error("❌ Error updating TopicOrClass:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update TopicOrClass",
      error: error.message,
    });
  }
};





const deleteTopicOrClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // ---------------------------------------
    // 1. Authentication Check
    // ---------------------------------------
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // ---------------------------------------
    // 2. Role Check
    // ---------------------------------------
    const allowedRoles = ["Admin", "Teacher"];
    const hasAccess = req.roles?.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "Access denied: Only Admin or Teacher can delete TopicOrClass",
      });
      return;
    }

    // ---------------------------------------
    // 3. Find TopicOrClass
    // ---------------------------------------
    const existing = await TopicOrClassModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: "TopicOrClass not found" });
      return;
    }

    // ---------------------------------------
    // 4. Teacher can delete only own videos
    // ---------------------------------------
    if (
      req.roles?.includes("Teacher") &&
      existing.CreatedBy.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied: You can delete only your own TopicOrClass",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // ---------------------------------------
    // 5. DELETE Cloudinary Assets
    // ---------------------------------------

    // 🗑 DELETE VIDEO
    if (existing.VideoURL) {
      try {
        const publicId = existing.VideoURL.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(`Topics/Videos/${publicId}`, {
          resource_type: "video",
        });
      } catch (err) {
        console.error("Video Delete Error:", err);
      }
    }

    // 🗑 DELETE THUMBNAIL
    if (existing.videoThumbnail) {
      try {
        const publicId = existing.videoThumbnail.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(`Topics/thumbnails/${publicId}`);
      } catch (err) {
        console.error("Thumbnail Delete Error:", err);
      }
    }

    // 🗑 DELETE PDF
    if (existing.pdfUrl) {
      try {
        const publicId = existing.pdfUrl.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(`Topics/pdfs/${publicId}`, {
          resource_type: "raw",
        });
      } catch (err) {
        console.error("PDF Delete Error:", err);
      }
    }

    // 🗑 DELETE EXTRA FILES
    if (Array.isArray(existing.extraFiles) && existing.extraFiles.length > 0) {
      for (const fileUrl of existing.extraFiles) {
        try {
          const publicId = fileUrl.split("/").pop()?.split(".")[0];
          await cloudinary.uploader.destroy(`Topics/extras/${publicId}`, {
            resource_type: "raw",
          });
        } catch (err) {
          console.error("Extra File Delete Error:", err);
        }
      }
    }

    // ---------------------------------------
    // 6. DELETE Document from MongoDB
    // ---------------------------------------
    await TopicOrClassModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "✅ TopicOrClass and all associated files deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting TopicOrClass:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete TopicOrClass",
      error: error.message,
    });
  }
};


const getTopicsByChapterId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chapterid } = req.params;
        const Topics = await TopicOrClassModel.find({ChapterId:chapterid})

        if (!Topics) {
            res.status(404).json({ message: 'Chapter not found' });
            return;
        }

        res.status(200).json({ success: true, Topics });
    } catch (error: any) {
        console.error('Error fetching Topics by ID:', error);
        res.status(500).json({ message: 'Failed to fetch Topics', error: error.message });
    }
};


export default { createTopicOrClass,getAllTopicOrClasss,getTopicOrClassById,updateTopicOrClass,deleteTopicOrClass,getTopicsByChapterId};