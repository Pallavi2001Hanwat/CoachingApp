import { Request, Response } from 'express';
import QuestionModel from '../Models/Question';
import { AuthRequest } from '../Middleware/AuthMiddleware';
import QuestionOptionModel from '../Models/QuestionOption';
import TestPaperQuestionModel from '../Models/TestPaperQuestions';
import TestPaperModel from '../Models/TestPaper';



const createQuestionWithOption = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ✅ Step 1: Check if user is logged in
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Please login first' });
      return;
    }

    // ✅ Step 2: Extract question data from request body
    const {
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      SubjectId,
      TopicId,
      ChapterId,
      Marks,
      NegativeMarks,
      TimeAllowedInSeconds,
      Explanation,
      Tags,
      Status,
      Options, // array of options from frontend
    } = req.body;

    // ✅ Step 3: Validate required fields
    if (!QuestionText || !QuestionType || !Marks || !TimeAllowedInSeconds) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: QuestionText, QuestionType, Marks, TimeAllowedInSeconds are required',
      });
      return;
    }

    // ⭕ Optional validation to ensure MCQ has at least 2 options
    if (QuestionType === 'MCQ' && (!Options || Options.length < 2)) {
      res.status(400).json({
        success: false,
        message: 'MCQ type must contain at least 2 options',
      });
      return;
    }

    // 🔹 Upload Question Image to Cloudinary (if exists)
    let uploadedImageUrl = '';
    if (QuestionImage) {
      try {
        const cloudinary = req.app.locals.cloudinary;
        const result = await cloudinary.uploader.upload(QuestionImage, {
          folder: 'Questions'
        });
        uploadedImageUrl = result.secure_url;
      } catch (error) {
        console.error("Error uploading question image:", error);
        return res.status(500).json({
          message: 'Error uploading question image to Cloudinary',
          data: null,
          error
        });
      }
    }

    // 🟢 Step 4: Create Question document first
    const newQuestion = new QuestionModel({
      QuestionText,
      QuestionImage: uploadedImageUrl || null,
      QuestionType,
      DifficultyLevel: DifficultyLevel || 'Easy',
      SubjectId: SubjectId || null,
      TopicId: TopicId || null,
      ChapterId: ChapterId || null,
      Marks,
      NegativeMarks: NegativeMarks || 0,
      TimeAllowedInSeconds,
      Explanation: Explanation || '',
      Tags: Tags || [],
      TeacherId: user._id,
      CreatedBy: user._id,
      Status: Status || 'Active',
    });

    const savedQuestion = await newQuestion.save();

    // 🟢 Step 5: Process options + upload images if available
    if (Options && Options.length > 0) {
      const cloudinary = req.app.locals.cloudinary;

      const mappedOptions = await Promise.all(
        Options.map(async (opt: any) => {
          let uploadedOptionImageUrl = '';

          if (opt.OptionImage) {
            try {
              const result = await cloudinary.uploader.upload(opt.OptionImage, {
                folder: 'QuestionOptions'
              });
              uploadedOptionImageUrl = result.secure_url;
            } catch (error) {
              console.error("Error uploading option image:", error);
              return res.status(500).json({
                message: 'Error uploading option image to Cloudinary',
                data: null,
                error
              });
            }
          }

          return {
            QuestionId: savedQuestion._id,
            OptionText: opt.OptionText,
            OptionImage: uploadedOptionImageUrl || null,
            IsCorrect: opt.IsCorrect ?? false,
            Status: 'Active',
          };
        })
      );

      // insert all options after image uploads
      await QuestionOptionModel.insertMany(mappedOptions);
    }

    // 🟢 Step 6: Send response
    res.status(201).json({
      success: true,
      message: '✅ Question and options created successfully',
      questionId: savedQuestion._id,
    });

  } catch (error: any) {
    console.error('❌ Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message,
    });
  }
};

const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Login required' });
      return;
    }
        const { id } = req.params;

    const {
      
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      SubjectId,
      TopicId,
      ChapterId,
      Marks,
      NegativeMarks,
      TimeAllowedInSeconds,
      Explanation,
      Tags,
      Status,
      Options // array of option objects
    } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'QuestionId is required' });
      return;
    }

    // 🔍 Fetch Existing Question
    const existingQuestion = await QuestionModel.findById(id);
    if (!existingQuestion) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // 🖼️ Question Image Update Logic
    let updatedQuestionImage = existingQuestion.QuestionImage; // old image

    if (QuestionImage && QuestionImage !== existingQuestion.QuestionImage) {
      try {
        // Delete old Question image if exists
        if (existingQuestion.QuestionImage) {
          const public_id = existingQuestion.QuestionImage.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Questions/${public_id}`);
        }

        // Upload new Question image
        const uploadRes = await cloudinary.uploader.upload(QuestionImage, {
          folder: 'Questions',
        });
        updatedQuestionImage = uploadRes.secure_url;

      } catch (error) {
        console.error("Question Image Update Error:", error);
        res.status(500).json({ message: 'Error updating Question image', error });
        return;
      }
    }

    // 🟢 Update Question fields
    existingQuestion.QuestionText = QuestionText || existingQuestion.QuestionText;
    existingQuestion.QuestionImage = updatedQuestionImage;
    existingQuestion.QuestionType = QuestionType || existingQuestion.QuestionType;
    existingQuestion.DifficultyLevel = DifficultyLevel ?? existingQuestion.DifficultyLevel;
    existingQuestion.SubjectId = SubjectId ?? existingQuestion.SubjectId;
    existingQuestion.TopicId = TopicId ?? existingQuestion.TopicId;
    existingQuestion.ChapterId = ChapterId ?? existingQuestion.ChapterId;
    existingQuestion.Marks = Marks ?? existingQuestion.Marks;
    existingQuestion.NegativeMarks = NegativeMarks ?? existingQuestion.NegativeMarks;
    existingQuestion.TimeAllowedInSeconds = TimeAllowedInSeconds ?? existingQuestion.TimeAllowedInSeconds;
    existingQuestion.Explanation = Explanation ?? existingQuestion.Explanation;
    existingQuestion.Tags = Tags ?? existingQuestion.Tags;
    existingQuestion.Status = Status ?? existingQuestion.Status;
    existingQuestion.updatedDate = new Date();

    await existingQuestion.save();

    // 🟡 Update Options (Add / Update / Delete old)
    const existingOptions = await QuestionOptionModel.find({ id });

    // Delete removed options
    const incomingIds = Options.filter(o => o._id).map(o => o._id.toString());
    const deleteOptions = existingOptions.filter(o => !incomingIds.includes(o._id.toString()));

    for (const opt of deleteOptions) {
      // Delete Option Image if exists
      if (opt.OptionImage) {
        const public_id = opt.OptionImage.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Options/${public_id}`);
      }
      await QuestionOptionModel.findByIdAndDelete(opt._id);
    }

    // Add / Update options
    for (const opt of Options) {
      if (opt._id) {
        // UPDATE existing option
        const existingOpt = await QuestionOptionModel.findById(opt._id);
        if (!existingOpt) continue;

        let updatedOptImage = existingOpt.OptionImage;

        if (opt.OptionImage && opt.OptionImage !== existingOpt.OptionImage) {
          // Delete old image
          if (existingOpt.OptionImage) {
            const public_id = existingOpt.OptionImage.split('/').pop()?.split('.')[0];
            await cloudinary.uploader.destroy(`Options/${public_id}`);
          }

          // Upload new image
          const uploadRes = await cloudinary.uploader.upload(opt.OptionImage, {
            folder: 'Options',
          });
          updatedOptImage = uploadRes.secure_url;
        }

        existingOpt.OptionText = opt.OptionText;
        existingOpt.OptionImage = updatedOptImage;
        existingOpt.IsCorrect = opt.IsCorrect ?? existingOpt.IsCorrect;
        await existingOpt.save();

      } else {
        // CREATE new option
        let uploadedNewOptImage = null;

        if (opt.OptionImage) {
          const uploadRes = await cloudinary.uploader.upload(opt.OptionImage, {
            folder: 'Options',
          });
          uploadedNewOptImage = uploadRes.secure_url;
        }

        await QuestionOptionModel.create({
          QuestionId:existingQuestion._id,
          OptionText: opt.OptionText,
          OptionImage: uploadedNewOptImage,
          IsCorrect: opt.IsCorrect ?? false,
          Status: 'Active'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Question and options updated successfully',
      
    });

  } catch (error: any) {
    console.error('Update Question Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
  }
};


const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const questionswithoption = await QuestionModel.find()
      .populate('SubjectId')
      .populate('ChapterId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'All questions fetched successfully',
      questionswithoption,
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};


const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await QuestionModel.findById(id)
      .populate('SubjectId')
       .populate('ChapterId')
      .populate('TopicId');
     

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    const options = await QuestionOptionModel.find({ QuestionId: id });

    res.status(200).json({
      success: true,
      message: 'Question fetched successfully',
      questionwithoption: {
        question,
        options,
      },
    });

  } catch (error: any) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message,
    });
  }
};


const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await QuestionModel.findById(id);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }

    const cloudinary = req.app.locals.cloudinary;

    // 🚮 Delete Question Image
    if (question.QuestionImage) {
      try {
        const public_id = question.QuestionImage.split('/').pop()?.split('.')[0];
        await cloudinary.uploader.destroy(`Question/${public_id}`);
      } catch (err) {
        console.log('Error deleting question image from Cloudinary:', err);
      }
    }

    // 🔍 Find options of question
    const options = await QuestionOptionModel.find({ QuestionId: id });

    // 🚮 Delete option images from Cloudinary
    for (const opt of options) {
      if (opt.OptionImage) {
        try {
          const public_id = opt.OptionImage.split('/').pop()?.split('.')[0];
          await cloudinary.uploader.destroy(`Options/${public_id}`);
        } catch (err) {
          console.log('Error deleting option image:', err);
        }
      }
    }

    // ❌ Delete options from DB
    await QuestionOptionModel.deleteMany({ QuestionId: id });

    // ❌ Delete Question
    await QuestionModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Question and its options deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message,
    });
  }
};


const getAllQuestionsBySubject = async (req: Request, res: Response) => {
  try {
 
    const { SubjectId, ChapterId, TopicId } = req.body;

    // ✅ 3 IDs required
    if (!SubjectId || !ChapterId || !TopicId) {
      return res.status(400).json({
        success: false,
        message: "SubjectId, ChapterId and TopicId are required",
        questionswithoption: []
      });
    }

    const filter = {
      SubjectId,
      ChapterId,
      TopicId,
    };

    const questionswithoption = await QuestionModel.find(filter)
      .populate('SubjectId')
      .populate('ChapterId')
      .populate('TopicId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      questionswithoption,
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

const getQuestionByTestPaperId = async (req: Request, res: Response) => {
  try {
    const { testpaperid } = req.params;

    // 0️⃣ Get TestPaper details
    const testPaper = await TestPaperModel.findById(testpaperid);

    if (!testPaper) {
      return res.status(404).json({
        success: false,
        message: 'Test paper not found',
      });
    }

    // 1️⃣ Get questions by TestPaperId
    const questions = await TestPaperQuestionModel.find({
      TestPaperId: testpaperid,
    }).populate('QuestionId');

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questions not found for this test paper',
      });
    }

    // 2️⃣ Extract QuestionIds
    const questionIds = questions.map(
      (q: any) => q.QuestionId?._id || q.QuestionId
    );

    // 3️⃣ Get options for all questions
    const options = await QuestionOptionModel.find({
      QuestionId: { $in: questionIds },
    });

    // 4️⃣ Combine questions with options
    const questionWithOptions = questions.map((q: any) => {
      const questionOptions = options.filter(
        (opt: any) =>
          opt.QuestionId.toString() ===
          (q.QuestionId?._id || q.QuestionId).toString()
      );

      return {
        ...q.toObject(),
        options: questionOptions,
      };
    });

    // 5️⃣ Final Response (TestPaper + Questions)
    res.status(200).json({
      success: true,
      message: 'Test paper with questions fetched successfully',
      data: {
        testPaper,          // 👈 full test paper data
        questions: questionWithOptions,
      },
    });

  } catch (error: any) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message,
    });
  }
};


const createQuestionWithOption_and_addtoTestPaper = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // ✅ Step 1: Auth check
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ✅ Step 2: Extract body
    const {
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      SubjectId,
      TopicId,
      ChapterId,
      Marks,
      NegativeMarks,
      TimeAllowedInSeconds,
      Explanation,
      Tags,
      Status,
      Options,
      TestPaperId, // 🔥 important
    } = req.body;

    // ✅ Step 3: Validate
    if (!QuestionText || !QuestionType || !Marks || !TimeAllowedInSeconds || !TestPaperId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    if (QuestionType === 'MCQ' && (!Options || Options.length < 2)) {
      res.status(400).json({
        success: false,
        message: 'MCQ must have at least 2 options',
      });
      return;
    }

    // 🔹 Upload Question Image
    let uploadedImageUrl = '';
    if (QuestionImage) {
      const cloudinary = req.app.locals.cloudinary;
      const result = await cloudinary.uploader.upload(QuestionImage, {
        folder: 'Questions',
      });
      uploadedImageUrl = result.secure_url;
    }

    // 🟢 Step 4: Create Question
    const question = new QuestionModel({
      QuestionText,
      QuestionImage: uploadedImageUrl || null,
      QuestionType,
      DifficultyLevel: DifficultyLevel || 'Easy',
      SubjectId,
      TopicId,
      ChapterId,
      Marks,
      NegativeMarks: NegativeMarks || 0,
      TimeAllowedInSeconds,
      Explanation: Explanation || '',
      Tags: Tags || [],
      Status: Status || 'Active',
      CreatedBy: user._id,
      TeacherId: user._id,
    });

    const savedQuestion = await question.save();

    // 🟢 Step 5: Create Options
    if (Options?.length) {
      const cloudinary = req.app.locals.cloudinary;

      const optionDocs = await Promise.all(
        Options.map(async (opt: any) => {
          let optionImage = '';

          if (opt.OptionImage) {
            const result = await cloudinary.uploader.upload(opt.OptionImage, {
              folder: 'QuestionOptions',
            });
            optionImage = result.secure_url;
          }

          return {
            QuestionId: savedQuestion._id,
            OptionText: opt.OptionText,
            OptionImage: optionImage || null,
            IsCorrect: opt.IsCorrect ?? false,
            Status: 'Active',
          };
        })
      );

      await QuestionOptionModel.insertMany(optionDocs);
    }

    // 🟢 Step 6: 🔥 ADD QUESTION TO TEST PAPER
    const testPaperQuestion = new TestPaperQuestionModel({
      TestPaperId: TestPaperId,
      QuestionId: savedQuestion._id,
      order: 0, // ya calculate kar sakte ho later
      CreatedBy: user._id,
      TeacherId: user._id,
    });

    await testPaperQuestion.save();

    // ✅ Final Response
    res.status(201).json({
      success: true,
      message: '✅ Question created & added to Test Paper successfully',
      questionId: savedQuestion._id,
      testPaperQuestionId: testPaperQuestion._id,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question and add to test paper',
      error: error.message,
    });
  }
};




export default { createQuestionWithOption,getQuestionById,deleteQuestion,
  getAllQuestions,updateQuestion,getAllQuestionsBySubject,getQuestionByTestPaperId,createQuestionWithOption_and_addtoTestPaper};