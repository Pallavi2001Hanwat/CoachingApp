// src/Controllers/SyllabusCategoryController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../Middleware/AuthMiddleware";
import SyllabusCategory from "../Models/SyllabusCategory";
import Syllabus from "../Models/Syllabus";
/**
 * CREATE CATEGORY
 */
 const createSyllabusCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { CategoryName, Description, Status } = req.body;

    if (!CategoryName) {
      res.status(400).json({
        success: false,
        message: "CategoryName is required",
      });
      return;
    }

    const category = new SyllabusCategory({
      CategoryName,
      Description,
      Status: Status || "Active",
    });

    const saved = await category.save();

    res.status(201).json({
      success: true,
      message: "✅ Syllabus Category created successfully",
      data: saved,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

/**
 * GET ALL CATEGORIES
 */
 const getAllSyllabusCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await SyllabusCategory.find().sort({ CreatedAt: -1 });

    res.status(200).json({
      success: true,
      SyllabusCategories:data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * UPDATE CATEGORY
 */
 const updateSyllabusCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { CategoryName, Description, Status } = req.body;

    const category = await SyllabusCategory.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    category.CategoryName = CategoryName || category.CategoryName;
    category.Description = Description || category.Description;
    category.Status = Status || category.Status;

    const updated = await category.save();

    res.status(200).json({
      success: true,
      message: "✅ Category updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * DELETE CATEGORY
 */
 const deleteSyllabusCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await SyllabusCategory.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "🗑️ Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

const deleteAllSyllabusCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 🔐 Optional: Only Admin
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    if (!req.roles?.includes("Admin")&& !req.roles?.includes("Teacher")) {
      res.status(403).json({ success: false, message: "Only Admin or Teacher can delete all categories" });
      return;
    }

    // ✅ 1. Get all categories
    const allCategories = await SyllabusCategory.find();

    if (allCategories.length === 0) {
      res.status(200).json({ success: true, message: "No categories found" });
      return;
    }

    // ✅ 2. Delete all related syllabus for each category
    const cloudinary = req.app.locals.cloudinary;

    for (const category of allCategories) {
      const syllabusList = await Syllabus.find({ SyllabusCategoryId: category._id });

      // 🔥 Delete PDFs if stored in Cloudinary
      for (const syllabus of syllabusList) {
        if (syllabus.PdfUrl) {
          const public_id = syllabus.PdfUrl.split('/').pop()?.split('.')[0];
          if (public_id) {
            await cloudinary.uploader.destroy(`Syllabus/${public_id}`);
          }
        }
      }

      // Delete syllabus in DB
      await Syllabus.deleteMany({ SyllabusCategoryId: category._id });
    }

    // ✅ 3. Delete all categories
    await SyllabusCategory.deleteMany({});

    res.status(200).json({
      success: true,
      message: "🗑️ All Syllabus Categories and related Syllabus deleted successfully",
    });

  } catch (error: any) {
    console.error("❌ Error deleting all syllabus categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all syllabus categories",
      error: error.message,
    });
  }
};

 const getSyllabusCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const data = await SyllabusCategory.findById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      SyllabusCategory:data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch record",
      error: error.message,
    });
  }
};






/**
 * CREATE SYLLABUS
 */
 const createSyllabus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { Title, Description, SyllabusCategoryId, PdfUrl, Status } = req.body;

    if (!Title || !SyllabusCategoryId) {
      res.status(400).json({
        success: false,
        message: "Title and CategoryId are required",
      });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    let uploadedPdfUrl = "";
    if (PdfUrl) {
      const result = await cloudinary.uploader.upload(PdfUrl, {
        folder: "Syllabus/pdfs",
        resource_type: "raw",
      });
      uploadedPdfUrl = result.secure_url;
    }

    const syllabus = new Syllabus({
      Title,
      Description,
      SyllabusCategoryId,
      PdfUrl: uploadedPdfUrl,
      Status: Status || "Active",
    });

    const saved = await syllabus.save();

    res.status(201).json({
      success: true,
      message: "✅ Syllabus created successfully",
      data: saved,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create syllabus",
      error: error.message,
    });
  }
};

/**
 * GET ALL SYLLABUS
 */
 const getAllSyllabus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await Syllabus.find()
      .sort({ CreatedAt: -1 });

    res.status(200).json({ success: true, Syllabus:data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch syllabus",
      error: error.message,
    });
  }
};

/**
 * GET SYLLABUS BY ID
 */
 const getSyllabusById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const data = await Syllabus.findById(id).populate(
      "SyllabusCategoryId",
      "CategoryName"
    );

    if (!data) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    res.status(200).json({ success: true, Syllabus:data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch record",
      error: error.message,
    });
  }
};

/**
 * UPDATE SYLLABUS
 */
 const updateSyllabus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { Title, Description, SyllabusCategoryId, PdfUrl, Status } = req.body;

    const syllabus = await Syllabus.findById(id);
    if (!syllabus) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    if (PdfUrl) {
      const result = await cloudinary.uploader.upload(PdfUrl, {
        folder: "Syllabus/pdfs",
        resource_type: "raw",
      });
      syllabus.PdfUrl = result.secure_url;
    }

    syllabus.Title = Title || syllabus.Title;
    syllabus.Description = Description || syllabus.Description;
    syllabus.SyllabusCategoryId = SyllabusCategoryId || syllabus.SyllabusCategoryId;
    syllabus.Status = Status || syllabus.Status;

    const updated = await syllabus.save();

    res.status(200).json({
      success: true,
      message: "✅ Syllabus updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * DELETE SYLLABUS
 */
 const deleteSyllabus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findById(id);
    if (!syllabus) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    await syllabus.deleteOne();

    res.status(200).json({
      success: true,
      message: "🗑️ Syllabus deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};


const deleteAllSyllabus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 🔐 Admin check
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    if (!req.roles?.includes("Admin")&& !req.roles?.includes("Teacher")) {
      res.status(403).json({ success: false, message: "Only Admin or Teacher can delete all syllabus" });
      return;
    }

    // ✅ Get all syllabus
    const allSyllabus = await Syllabus.find();

    if (allSyllabus.length === 0) {
      res.status(200).json({ success: true, message: "No syllabus found" });
      return;
    }

    // ✅ Delete PDFs from Cloudinary if exists
    const cloudinary = req.app.locals.cloudinary;

    for (const syllabus of allSyllabus) {
      if (syllabus.PdfUrl) {
        const public_id = syllabus.PdfUrl.split('/').pop()?.split('.')[0];
        if (public_id) {
          await cloudinary.uploader.destroy(`Syllabus/${public_id}`);
        }
      }
    }

    // ✅ Delete all syllabus from DB
    await Syllabus.deleteMany({});

    res.status(200).json({
      success: true,
      message: "🗑️ All Syllabus and related PDFs deleted successfully",
    });

  } catch (error: any) {
    console.error("❌ Error deleting all syllabus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all syllabus",
      error: error.message,
    });
  }
};

 const getSyllabusBySyllabusCategoryId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { SyllabusCategoryId } = req.params;

    const data = await Syllabus.find({SyllabusCategoryId:SyllabusCategoryId}).populate(
      "SyllabusCategoryId",
      "CategoryName"
    );

    if (!data) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    res.status(200).json({ success: true, Syllabus:data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch record",
      error: error.message,
    });
  }
};

export default {createSyllabusCategory,getAllSyllabusCategories,updateSyllabusCategory,getSyllabusCategoryById,deleteSyllabusCategory,deleteAllSyllabusCategories,
  createSyllabus,getAllSyllabus,getSyllabusById,updateSyllabus ,deleteSyllabus,getSyllabusBySyllabusCategoryId,deleteAllSyllabus};