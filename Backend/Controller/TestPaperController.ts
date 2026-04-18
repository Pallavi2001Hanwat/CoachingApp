import { Request, Response } from 'express';
import TestPaperModel from '../Models/TestPaper';
import { AuthRequest } from '../Middleware/AuthMiddleware';
import TestPaperQuestionsModel from '../Models/TestPaperQuestions';
import * as XLSX from "xlsx";

const createTestPaper = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 🔐 Step 1: Ensure user is authenticated
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // 📝 Step 2: Extract fields from request body
    const {
      TestSeriesId,
      PaperTitle,
      Description,
      DurationInMinutes,
      TotalMarks,
      PassingMarks,
      TotalQuestions,
      AttemptLimit,
      PaperLevel,
      
      ScheduledDate,
      Status,
    } = req.body;

    // 🔍 Step 3: Required fields validation
    if (
      !TestSeriesId || !PaperTitle || !DurationInMinutes ||
      !TotalMarks || !PassingMarks || !TotalQuestions ||
      !AttemptLimit || !PaperLevel
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    

    // 🏗️ Step 5: Create TestPaper document object
    const newTestPaper = new TestPaperModel({
      TestSeriesId,
      PaperTitle,
      Description,
      DurationInMinutes,
      TotalMarks,
      PassingMarks,
      TotalQuestions,
      AttemptLimit,
      PaperLevel,
      ScheduledDate: ScheduledDate ? new Date(ScheduledDate) : null,
      TeacherId: user._id,
      CreatedBy: user._id,
      Status: Status || 'Active',
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    // 💾 Step 6: Save to DB
    const savedTestPaper = await newTestPaper.save();

    // 🎉 Step 7: Response
    res.status(201).json({
      success: true,
      message: 'TestPaper created successfully',
      TestPaper: savedTestPaper
    });

  } catch (error: any) {
    console.error('Error creating TestPaper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create TestPaper',
      error: error.message
    });
  }
};



 const bulkCreateTestPapers = async (req: any, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // ✅ Step 1: Get TestSeriesId from params
    const testSeriesId = req.params.testSeriesId;

    if (!testSeriesId) {
      return res.status(400).json({
        success: false,
        message: 'TestSeriesId is required in params',
      });
    }

    // ✅ Step 2: Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required',
      });
    }

    // ✅ Step 3: Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty',
      });
    }

    // ✅ Step 4: Convert rows → DB format
    const testPapers = rows.map((row, index) => {
      if (
        !row.PaperTitle ||
        !row.DurationInMinutes ||
        !row.TotalMarks ||
        !row.TotalQuestions ||
        !row.PassingMarks ||
        !row.AttemptLimit ||
        !row.PaperLevel
      ) {
        throw new Error(`Missing fields in row ${index + 1}`);
      }

      return {
        TestSeriesId: testSeriesId, // 🔥 important
        PaperTitle: row.PaperTitle,
        Description: row.Description || '',
        DurationInMinutes: Number(row.DurationInMinutes),
        TotalMarks: Number(row.TotalMarks),
        PassingMarks: Number(row.PassingMarks),
        TotalQuestions: Number(row.TotalQuestions),
        AttemptLimit: Number(row.AttemptLimit),
        PaperLevel: row.PaperLevel,
        ScheduledDate: row.ScheduledDate
          ? new Date(row.ScheduledDate)
          : null,
        Status: row.Status || 'Active',

        TeacherId: user._id,
        CreatedBy: user._id,
        createdDate: new Date(),
        updatedDate: new Date(),
      };
    });

    // ✅ Step 5: Insert in DB
    const saved = await TestPaperModel.insertMany(testPapers);

    // ✅ Step 6: Response
    res.status(201).json({
      success: true,
      message: `${saved.length} Test Papers created successfully`,
      data: saved,
    });

  } catch (error: any) {
    console.error('Bulk create error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Bulk creation failed',
    });
  }
};

const getAllTestPapers = async (req: Request, res: Response): Promise<void> => {
  try {
    const testPapers = await TestPaperModel.aggregate([
      // 🔹 Join questions
      {
        $lookup: {
          from: 'testpaperquestions',
          localField: '_id',
          foreignField: 'TestPaperId',
          as: 'questions',
        },
      },

      // 🔹 Add totalQuestions field
      {
        $addFields: {
          totalQuestions: { $size: '$questions' },
        },
      },

      // 🔹 Join TestSeries
      {
        $lookup: {
          from: 'testseries', // collection name (check in DB)
          localField: 'TestSeriesId',
          foreignField: '_id',
          as: 'TestSeries',
        },
      },

      // 🔹 Convert TestSeries array -> object
      {
        $unwind: {
          path: '$TestSeries',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔹 Join Category inside TestSeries
      {
        $lookup: {
          from: 'categories', // collection name
          localField: 'TestSeries.CategoryId',
          foreignField: '_id',
          as: 'Category',
        },
      },

      // 🔹 Convert Category array -> object
      {
        $unwind: {
          path: '$Category',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔹 Attach Category inside TestSeries
      {
        $addFields: {
          'TestSeries.Category': '$Category',
        },
      },

      // 🔹 Remove unwanted fields
      {
        $project: {
          questions: 0,
          Category: 0,
        },
      },

      // 🔹 Sort
      {
        $sort: { createdDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      total: testPapers.length,
      TestPapers: testPapers,
    });
  } catch (error: any) {
    console.error('Error fetching TestPapers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch TestPapers',
      error: error.message,
    });
  }
};


const getTestPaperById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const TestPaper = await TestPaperModel.findById(id)
      .populate('TeacherId', 'FirstName LastName Email') // Teacher info
      .populate({
        path: 'TestSeriesId',           // populate TestSeries
        select: 'Title CategoryId',     // fields from TestSeries
        populate: {
          path: 'CategoryId',           // nested populate Category inside TestSeries
          select: 'CategoryName',      // fields from Category
        },
      });

    if (!TestPaper) {
      res.status(404).json({ message: 'TestPaper not found' });
      return;
    }

    res.status(200).json({ success: true, TestPaper });
  } catch (error: any) {
    console.error('Error fetching TestPaper by ID:', error);
    res.status(500).json({ message: 'Failed to fetch TestPaper', error: error.message });
  }
};


const updateTestPaper = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    // 🔐 1. Check authentication
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // 🔐 2. Role-based access
    const allowedRoles = ['Admin', 'Teacher'];
    const hasAccess = req.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only Admin or Teacher can update TestPaper',
      });
      return;
    }

    // 🔍 3. Fetch existing TestPaper
    const existingTestPaper = await TestPaperModel.findById(id);
    if (!existingTestPaper) {
      res.status(404).json({ success: false, message: 'TestPaper not found' });
      return;
    }

    // 🔐 Teachers can update only their own TestPapers
    if (
      req.roles?.includes('Teacher') &&
      existingTestPaper.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own TestPapers',
      });
      return;
    }

    // 📝 4. Extract updatable fields from request body
    const {
      TestSeriesId,
      PaperTitle,
      Description,
      DurationInMinutes,
      TotalMarks,
      PassingMarks,
      TotalQuestions,
      AttemptLimit,
      PaperLevel,
      
      ScheduledDate,
      Status
    } = req.body;


   

    // 🛠️ 6. Build update object dynamically
    const updateData: any = {
      ...(TestSeriesId && { TestSeriesId }),
      ...(PaperTitle && { PaperTitle }),
      ...(Description && { Description }),
      ...(DurationInMinutes && { DurationInMinutes }),
      ...(TotalMarks && { TotalMarks }),
      ...(PassingMarks && { PassingMarks }),
      ...(TotalQuestions && { TotalQuestions }),
      ...(AttemptLimit && { AttemptLimit }),
      ...(PaperLevel && { PaperLevel }),
      ...(ScheduledDate && { ScheduledDate: new Date(ScheduledDate) }),
      ...(Status && { Status }),
      updatedDate: new Date(),
      UpdatedBy: user._id,
    };

    // 💾 7. Update in DB
    const updatedTestPaper = await TestPaperModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedTestPaper) {
      res.status(404).json({ success: false, message: 'TestPaper not found after update' });
      return;
    }

    // 🎉 8. Response
    res.status(200).json({
      success: true,
      message: 'TestPaper updated successfully',
      TestPaper: updatedTestPaper,
    });

  } catch (error: any) {
    console.error('Error updating TestPaper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update TestPaper',
      error: error.message,
    });
  }
};


 const deleteTestPaper = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(403).json({ success: false, message: 'Access denied: Only Admin or Teacher can delete TestPaper' });
      return;
    }

    // ✅ Find the TestPaper first
    const existingTestPaper = await TestPaperModel.findById(id);
    if (!existingTestPaper) {
      res.status(404).json({ success: false, message: 'TestPaper not found' });
      return;
    }

    // ✅ Only the teacher who owns it or Admin can delete
    if (
      req.roles?.includes('Teacher') &&
      existingTestPaper.TeacherId.toString() !== user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Access denied: You can only delete your own TestPapers' });
      return;
    }



    // ✅ Delete the TestPaper from MongoDB
    await TestPaperModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '✅ TestPaper and associated image deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting TestPaper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete TestPaper',
      error: error.message,
    });
  }
};


const deleteAllTestPapers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    // ✅ Auth check
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

   


    // ✅ Delete all TestPapers
    await TestPaperModel.deleteMany({});

    res.status(200).json({
      success: true,
      message: '🔥 All TestPapers and their images deleted successfully',
    });

  } catch (error: any) {
    console.error('❌ Error deleting all TestPapers:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete all TestPapers',
      error: error.message,
    });
  }
};

const saveSelectedQuestionsToTestPaper = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { TestPaperId, SelectedQuestions } = req.body;
    const user = req.user;

    if (
      !TestPaperId ||
      !Array.isArray(SelectedQuestions) ||
      SelectedQuestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'TestPaperId and QuestionIds are required',
      });
    }

    const createdBy = user._id;
    const teacherId = user._id;

    // 🔹 STEP 1: Find already saved questions
    const existingQuestions = await TestPaperQuestionsModel.find(
      {
        TestPaperId,
        QuestionId: { $in: SelectedQuestions },
      },
      { QuestionId: 1 }
    );

    const existingQuestionIds = existingQuestions.map(
      (q) => q.QuestionId.toString()
    );

    // 🔹 STEP 2: Filter only NEW questions
    const newQuestionIds = SelectedQuestions.filter(
      (qid: string) => !existingQuestionIds.includes(qid)
    );

    if (newQuestionIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All selected questions already exist in test paper',
      });
    }

    // 🔹 STEP 3: Get last order
    const lastQuestion = await TestPaperQuestionsModel.findOne(
      { TestPaperId },
      { order: 1 }
    ).sort({ order: -1 });

    let startOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    // 🔹 STEP 4: Prepare docs
    const docs = newQuestionIds.map((qid: string, index: number) => ({
      TestPaperId,
      QuestionId: qid,
      order: startOrder + index,
      CreatedBy: createdBy,
      TeacherId: teacherId,
    }));

    await TestPaperQuestionsModel.insertMany(docs);

    return res.status(200).json({
      success: true,
      message: 'New questions added to test paper successfully',
      addedCount: docs.length,
    });
  } catch (error) {
    console.error('Save TestPaper Questions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

 const removeAllSelectedQuestionsFromTestPaper = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { testpaperid } = req.params;

    if (!testpaperid) {
      res.status(400).json({ success: false, message: "TestPaper ID is required" });
      return;
    }

    const result = await TestPaperQuestionsModel.deleteMany({
      TestPaperId: testpaperid,
    });

    res.status(200).json({
      success: true,
      message: "All questions removed from test paper successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Error removing questions from TestPaper:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove questions from TestPaper",
      error: error.message,
    });
  }
};

 const getTestPaperByTestSeriesId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { testSeriesId } = req.params;
    const { isPaid } = req.query;

    const filter: any = {
      TestSeriesId: testSeriesId,
    };

    // 🔥 Free / Paid logic
    if (isPaid !== undefined) {
      filter.IsPaid = isPaid === 'true';
    }

    const testPapers = await TestPaperModel
      .find({TestSeriesId:testSeriesId,IsPaid:isPaid})
      .populate('TeacherId', 'FirstName LastName Email');

    res.status(200).json({
      success: true,
      count: testPapers.length,
      testPapers,
    });

  } catch (error: any) {
    console.error('Error fetching TestPaper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch TestPaper',
      error: error.message,
    });
  }
};




export default { createTestPaper,getAllTestPapers,getTestPaperById,
  updateTestPaper,deleteTestPaper,saveSelectedQuestionsToTestPaper,
  removeAllSelectedQuestionsFromTestPaper,getTestPaperByTestSeriesId,deleteAllTestPapers,
bulkCreateTestPapers};