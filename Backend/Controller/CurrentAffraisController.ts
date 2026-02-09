import { Request, Response } from "express";
import { AuthRequest } from '../Middleware/AuthMiddleware';

import DailyCurrentAffairsModel from "../Models/DailyCurrentAffairs";
import MonthlyCurrentAffairsModel from "../Models/MonthlyCurrentAffairs";






const createDailyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Please login first",
      });
      return;
    }

    // --------------------------
    // DESTRUCTURE BODY
    // --------------------------
    const {
      Date: affairDate, // rename to avoid shadowing global Date
      Title,
      PdfUrl,     // base64 / temp path
      VideoUrl,   // base64 / temp path
      Status,
    } = req.body;

    // --------------------------
    // VALIDATION
    // --------------------------
    if (!affairDate) {
      res.status(400).json({
        success: false,
        message: "Date is required",
      });
      return;
    }

    const dateObj = new Date(affairDate);
    if (isNaN(dateObj.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid Date format",
      });
      return;
    }

    // --------------------------
    // AUTO MONTH FROM DATE
    // --------------------------
    const Month = `${dateObj.toLocaleString("en-US", { month: "long" })} ${dateObj.getFullYear()}`;
    // Example: "January 2026"

    const cloudinary = req.app.locals.cloudinary;

    // --------------------------
    // PDF UPLOAD
    // --------------------------
    let uploadedPdfUrl = "";
    if (PdfUrl) {
      try {
        const result = await cloudinary.uploader.upload(PdfUrl, {
          folder: "DailyCurrentAffairs/pdfs",
          resource_type: "raw",
        });
        uploadedPdfUrl = result.secure_url;
      } catch (err) {
        console.error("PDF Upload Error:", err);
        res.status(500).json({
          success: false,
          message: "PDF upload failed",
        });
        return;
      }
    }

    // --------------------------
    // VIDEO UPLOAD
    // --------------------------
    let uploadedVideoUrl = "";
    if (VideoUrl) {
      try {
        const result = await cloudinary.uploader.upload(VideoUrl, {
          folder: "DailyCurrentAffairs/videos",
          resource_type: "video",
          chunk_size: 6000000,
        });
        uploadedVideoUrl = result.secure_url;
      } catch (err) {
        console.error("Video Upload Error:", err);
        res.status(500).json({
          success: false,
          message: "Video upload failed",
        });
        return;
      }
    }

    // --------------------------
    // CREATE DOCUMENT
    // --------------------------
    const newAffair = new DailyCurrentAffairsModel({
      Date: dateObj,
      Month, // auto-generated
      Title: Title || "Daily Current Affairs",
      PdfUrl: uploadedPdfUrl,
      VideoUrl: uploadedVideoUrl,
      TeacherId: user._id,
      CreatedBy: user._id,
      Status: Status || "Active",
    });

    const savedAffair = await newAffair.save();

    res.status(201).json({
      success: true,
      message: "✅ Daily Current Affairs created successfully",
      data: savedAffair,
    });
  } catch (error: any) {
    console.error("❌ Error creating Daily Current Affairs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Daily Current Affairs",
      error: error.message,
    });
  }
};




 const getAllDailyCurrentAffairs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await DailyCurrentAffairsModel.find()
      .sort({ Date: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Daily Current Affairs",
      error: error.message,
    });
  }
};


 const getDailyCurrentAffairsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const data = await DailyCurrentAffairsModel.findById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch record",
      error: error.message,
    });
  }
};


const updateDailyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await DailyCurrentAffairsModel.findById(id);
    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    const {
      Date: affairDate, // rename to avoid conflict with JS Date
      Title,
      PdfUrl,
      VideoUrl,
      Status,
    } = req.body;

    const cloudinary = req.app.locals.cloudinary;

    // --------------------------
    // HELPER TO PARSE PUBLIC ID FROM URL
    // --------------------------
    const getCloudinaryPublicId = (url: string) => {
      if (!url) return null;
      // Example URL:
      // https://res.cloudinary.com/<cloud_name>/raw/upload/v123456789/folder/filename.ext
      const parts = url.split("/upload/");
      if (parts.length < 2) return null;

      let path = parts[1]; // "v123456789/folder/filename.ext"
      const lastDot = path.lastIndexOf(".");
      if (lastDot !== -1) path = path.substring(0, lastDot); // remove extension
      // remove version prefix if present
      const firstSlash = path.indexOf("/");
      if (firstSlash !== -1) path = path.substring(firstSlash + 1);
      return path;
    };

    // ---- DATE & MONTH UPDATE
    if (affairDate) {
      const dateObj = new Date(affairDate);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid Date format",
        });
        return;
      }
      record.Date = dateObj;
      record.Month = `${dateObj.toLocaleString("en-US", { month: "long" })} ${dateObj.getFullYear()}`;
    }

    // ---- PDF UPDATE
    if (PdfUrl) {
      if (record.PdfUrl) {
        try {
          const pdfPublicId = getCloudinaryPublicId(record.PdfUrl);
          if (pdfPublicId) {
            await cloudinary.uploader.destroy(pdfPublicId, { resource_type: "raw" });
          }
        } catch (err: any) {
          console.warn("PDF deletion failed (ignored):", err.message);
        }
      }

      const pdfResult = await cloudinary.uploader.upload(PdfUrl, {
        folder: "DailyCurrentAffairs/pdfs",
        resource_type: "raw",
      });
      record.PdfUrl = pdfResult.secure_url;
    }

    // ---- VIDEO UPDATE
    if (VideoUrl) {
      if (record.VideoUrl) {
        try {
          const videoPublicId = getCloudinaryPublicId(record.VideoUrl);
          if (videoPublicId) {
            await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
          }
        } catch (err: any) {
          console.warn("Video deletion failed (ignored):", err.message);
        }
      }

      const videoResult = await cloudinary.uploader.upload(VideoUrl, {
        folder: "DailyCurrentAffairs/videos",
        resource_type: "video",
        chunk_size: 6000000,
      });
      record.VideoUrl = videoResult.secure_url;
    }

    // ---- OTHER FIELDS
    record.Title = Title || record.Title;
    record.Status = Status || record.Status;

    const updated = await record.save();

    res.status(200).json({
      success: true,
      message: "✅ Daily Current Affairs updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Error updating Daily Current Affairs:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};


 const deleteDailyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await DailyCurrentAffairsModel.findById(id);
    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // ---- DELETE PDF FROM CLOUDINARY
    if (record.PdfUrl) {
      const publicId = record.PdfUrl.split("/").pop()?.split(".")[0];
      await cloudinary.uploader.destroy(
        `DailyCurrentAffairs/pdfs/${publicId}`,
        { resource_type: "raw" }
      );
    }

    // ---- DELETE VIDEO FROM CLOUDINARY
    if (record.VideoUrl) {
      const publicId = record.VideoUrl.split("/").pop()?.split(".")[0];
      await cloudinary.uploader.destroy(
        `DailyCurrentAffairs/videos/${publicId}`,
        { resource_type: "video" }
      );
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "🗑️ Daily Current Affairs deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};


const createMonthlyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Please login first",
      });
      return;
    }

    const {
      Month,
      PdfTitle,
      PdfUrl,
      Language,
      Status,
    } = req.body;

    // --------------------------
    // VALIDATION
    // --------------------------
    if (!Month) {
      res.status(400).json({
        success: false,
        message: "Month is required (e.g. January 2026)",
      });
      return;
    }

    if (!Language || !["Hindi", "English"].includes(Language)) {
      res.status(400).json({
        success: false,
        message: "Language must be Hindi or English",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // --------------------------
    // PDF UPLOAD
    // --------------------------
    let uploadedPdfUrl = "";
    if (PdfUrl) {
      try {
        const result = await cloudinary.uploader.upload(PdfUrl, {
          folder: "MonthlyCurrentAffairs/pdfs",
          resource_type: "raw",
        });
        uploadedPdfUrl = result.secure_url;
      } catch (err) {
        console.error("PDF Upload Error:", err);
        res.status(500).json({
          success: false,
          message: "PDF upload failed",
        });
        return;
      }
    }

    // --------------------------
    // CREATE DOCUMENT
    // --------------------------
    const record = new MonthlyCurrentAffairsModel({
      Month,
      PdfTitle,
      PdfUrl: uploadedPdfUrl,
      Language,
      TeacherId: user._id,
      CreatedBy: user._id,
      Status: Status || "Active",
    });

    const saved = await record.save();

    res.status(201).json({
      success: true,
      message: "✅ Monthly Current Affairs created successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("❌ Error creating Monthly Current Affairs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Monthly Current Affairs",
      error: error.message,
    });
  }
};


const getAllMonthlyCurrentAffairs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await MonthlyCurrentAffairsModel.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Monthly Current Affairs",
      error: error.message,
    });
  }
};
const getMonthlyCurrentAffairsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const data = await MonthlyCurrentAffairsModel.findById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch record",
      error: error.message,
    });
  }
};


const updateMonthlyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await MonthlyCurrentAffairsModel.findById(id);
    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    const {
      Month,
      PdfTitle,
      PdfUrl,
      Language,
      Status,
    } = req.body;

    const cloudinary = req.app.locals.cloudinary;

    // ---- PDF UPDATE
    if (PdfUrl) {
      if (record.PdfUrl) {
        try {
          const publicId = record.PdfUrl.split("/upload/")[1]
            ?.split(".")[0]
            ?.replace(/^v\d+\//, "");
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "raw",
            });
          }
        } catch (err) {
          console.warn("Old PDF delete failed (ignored)");
        }
      }

      const pdfResult = await cloudinary.uploader.upload(PdfUrl, {
        folder: "MonthlyCurrentAffairs/pdfs",
        resource_type: "raw",
      });
      record.PdfUrl = pdfResult.secure_url;
    }

    // ---- OTHER FIELDS
    record.Month = Month || record.Month;
    record.PdfTitle = PdfTitle || record.PdfTitle;
    record.Language = Language || record.Language;
    record.Status = Status || record.Status;

    const updated = await record.save();

    res.status(200).json({
      success: true,
      message: "✅ Monthly Current Affairs updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Error updating Monthly Current Affairs:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

const deleteMonthlyCurrentAffairs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await MonthlyCurrentAffairsModel.findById(id);
    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    if (record.PdfUrl) {
      const publicId = record.PdfUrl.split("/upload/")[1]
        ?.split(".")[0]
        ?.replace(/^v\d+\//, "");
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "🗑️ Monthly Current Affairs deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};


export default { createDailyCurrentAffairs,getAllDailyCurrentAffairs,
    getDailyCurrentAffairsById,updateDailyCurrentAffairs,deleteDailyCurrentAffairs
,deleteMonthlyCurrentAffairs,updateMonthlyCurrentAffairs,getMonthlyCurrentAffairsById,
getAllMonthlyCurrentAffairs,createMonthlyCurrentAffairs
};