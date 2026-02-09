import { Request, Response } from 'express';
import StudentTestAttemptModel from '../Models/StudentTestAttempt';
import StudentQuestionResponseModel from '../Models/StudentQuestionResponse';
import QuestionOptionModel from '../Models/QuestionOption';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/User';
import TestPaperQuestionModel from '../Models/TestPaperQuestions';
import TestPaperModel from '../Models/TestPaper';


const startOrResumeTest = async (req: Request, res: Response) => {
  try {
    const { TestPaperId } = req.body;

    /* ---------- TOKEN ---------- */
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    /* ---------- USER ---------- */
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user',
      });
    }

    const StudentId = user._id;

    if (!TestPaperId) {
      return res.status(400).json({
        success: false,
        message: 'TestPaperId is required',
      });
    }

    /* ---------- CHECK RUNNING ATTEMPT ---------- */
    const existingAttempt = await StudentTestAttemptModel.findOne({
      StudentId,
      TestPaperId,
      AttemptStatus: 'InProgress',
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        resume: true,
        AttemptId: existingAttempt._id,
        StartTime: existingAttempt.StartTime,
      });
    }

    /* ---------- CREATE NEW ATTEMPT ---------- */
    const attemptCount = await StudentTestAttemptModel.countDocuments({
      StudentId,
      TestPaperId,
    });

    const attempt = await StudentTestAttemptModel.create({
      StudentId,
      TestPaperId,
      AttemptNo: attemptCount + 1,
      StartTime: new Date(),
      AttemptStatus: 'InProgress',
      TotalObtainedMarks: 0,
      CorrectCount: 0,
      WrongCount: 0,
      SkippedCount: 0,
      TotalTimeTaken: 0,
      createdDate: new Date(),
    });

    return res.status(200).json({
      success: true,
      resume: false,
      AttemptId: attempt._id,
      StartTime: attempt.StartTime,
    });
  } catch (error: any) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};



const submitStudentTest = async (req: Request, res: Response) => {
  try {
    const { AttemptId, TestPaperId, answers = {}, totalTimeSpent = 0 } = req.body;

    if (!AttemptId || !TestPaperId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submit data',
      });
    }

    const attempt = await StudentTestAttemptModel.findById(AttemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    if (attempt.AttemptStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted',
      });
    }

    const allQuestions = await TestPaperQuestionModel.find({ TestPaperId });

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let totalMarks = 0;

  for (const tpQuestion of allQuestions) {
  const questionId = tpQuestion.QuestionId.toString(); // ✅ REAL QuestionId
  const selectedOptionId = answers[questionId] || null;

  let isCorrect = false;
  let marksAwarded = 0;

  if (!selectedOptionId) {
    skippedCount++;
  } else {
    const option = await QuestionOptionModel.findById(selectedOptionId);
    if (option?.IsCorrect) {
      isCorrect = true;
      marksAwarded = 1;
      correctCount++;
      totalMarks++;
    } else {
      wrongCount++;
    }
  }

  await StudentQuestionResponseModel.findOneAndUpdate(
    {
      AttemptId: AttemptId,
      QuestionId: tpQuestion.QuestionId, // ✅ REAL QuestionId
    },
    {
      $set: {
        SelectedOptionId: selectedOptionId,
        IsCorrect: isCorrect,
        MarksAwarded: marksAwarded,
        TimeTakenInSeconds: 0,
      },
      $setOnInsert: {
        AttemptId: AttemptId,
        QuestionId: tpQuestion.QuestionId,
        createdDate: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}


    attempt.EndTime = new Date();
    attempt.AttemptStatus = 'Completed';
    attempt.TotalObtainedMarks = totalMarks;
    attempt.CorrectCount = correctCount;
    attempt.WrongCount = wrongCount;
    attempt.SkippedCount = skippedCount;
    attempt.TotalTimeTaken = totalTimeSpent;

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      result: {
        TotalMarks: totalMarks,
        Correct: correctCount,
        Wrong: wrongCount,
        Skipped: skippedCount,
        TimeTaken: totalTimeSpent,
      },
    });
  } catch (error: any) {
    console.error('SUBMIT TEST ERROR 👉', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


const getStudentTestResult = async (req: Request, res: Response) => {
  try {
    const { AttemptId } = req.params;

    if (!AttemptId) {
      return res.status(400).json({
        success: false,
        message: 'AttemptId is required',
      });
    }

    // 1️⃣ Attempt summary
    const attempt = await StudentTestAttemptModel.findById(AttemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    // 2️⃣ Student responses
    const responses = await StudentQuestionResponseModel.find({
      AttemptId,
    })
      .populate({
        path: 'QuestionId',
        select: 'QuestionText Marks NegativeMarks Explanation',
      })
      .populate({
        path: 'SelectedOptionId',
        select: 'OptionText IsCorrect',
      });

    // 3️⃣ Format result
    const questionResults = responses.map((res) => {
      const question: any = res.QuestionId;
      const selectedOption: any = res.SelectedOptionId;

      return {
        QuestionId: question?._id,
        QuestionText: question?.QuestionText,
        Marks: question?.Marks,
        SelectedOption: selectedOption
          ? selectedOption.OptionText
          : null,
        IsCorrect: res.IsCorrect,
        MarksAwarded: res.MarksAwarded,
        Explanation: question?.Explanation,
      };
    });

    // 4️⃣ Final response
    return res.status(200).json({
      success: true,
      result: {
        AttemptId: attempt._id,
        TotalMarks: attempt.TotalObtainedMarks,
        Correct: attempt.CorrectCount,
        Wrong: attempt.WrongCount,
        Skipped: attempt.SkippedCount,
        TimeTaken: attempt.TotalTimeTaken,
        Questions: questionResults,
      },
    });
  } catch (error: any) {
    console.error('GET RESULT ERROR 👉', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


const getStudentTestProgress = async (req: Request, res: Response) => {
 try {

     /* ---------- TOKEN ---------- */
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    /* ---------- USER ---------- */
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user',
      });
    }

    const studentId = user._id;

   const { testSeriesId } = req.params;

    // saare test papers
    const testPapers = await TestPaperModel.find({
      TestSeriesId: testSeriesId,
    }).select('_id');

    const testPaperIds = testPapers.map(tp => tp._id);

    // student attempts
    const attempts = await StudentTestAttemptModel.find({
      StudentId: studentId,
      TestPaperId: { $in: testPaperIds },
    }).lean();

    const progressMap: any = {};

    attempts.forEach(att => {
      progressMap[att.TestPaperId.toString()] = {
        AttemptId: att._id,
        AttemptStatus: att.AttemptStatus,
      };
    });

    return res.status(200).json({
      success: true,
      progressMap,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export default {submitStudentTest,startOrResumeTest,getStudentTestResult,getStudentTestProgress}