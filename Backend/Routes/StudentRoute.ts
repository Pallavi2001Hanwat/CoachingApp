import express, { Request, Response } from 'express';
const router = express.Router();


import DashboardItemController from '../Controller/DashboardItemController';
import CategoryController from '../Controller/CategoryController';
import CourseController from '../Controller/CourseController';
import TestSeriesController from '../Controller/TestSeriesController';
import TestPaperController from '../Controller/TestPaperController';
import QuestionWithOptionsController from '../Controller/QuestionWithOptionsController';
import AttemptTestController from '../Controller/AttemptTestController';
import SubjectController from '../Controller/SubjectController';
import TopicOrClassController from '../Controller/TopicOrClassController';
import PreviousYearPaperCategoryController from '../Controller/PreviousYearPaperCategoryController';
import PreviousYearPaperController from '../Controller/PreviousYearPaperController';
import CurrentAffraisController from '../Controller/CurrentAffraisController';
import Usercontroller from '../Controller/UserController';
import { studentMiddleware } from '../Middleware/studentMiddleware';

import SyllabusController from '../Controller/SyllabusController';
/* --------------------------- ✅  Dashboard Route --------------------------- */
router.get("/get-All_Active_Dashboard_Items",DashboardItemController.getAll_Active_Dashboard_Items );

/* --------------------------- ✅  category Route --------------------------- */
router.get("/get-PaidCourseCategories",CategoryController.getPaidCourseCategories );
router.get("/get-AllCategories",CategoryController.getAllCategories );


/* --------------------------- ✅  courses Route --------------------------- */
router.get("/get-AllCoursesByCategoryId/:categoryId",CourseController.getAll_Paid_CoursesByCategoryId );
router.get("/getAll-Free_Courses",CourseController.getAll_Free_Courses );
router.get("/get-All-Active-Course",CourseController.getAllActiveCourses );
router.get("/get-AllsubjectsByCourseId/:courseId",CourseController.getCourseSubjects );


/* --------------------------- ✅  TestSeries Route --------------------------- */
router.get("/get-All-Paid-TestSeries",TestSeriesController.getAllPaidTestSeries );
router.get("/get-All-Free-TestSeries",TestSeriesController.getAllFreeTestSeries );
router.get("/get-AllTestSeriesByCategoryId/:categoryId",TestSeriesController.getTestSeriesByCategoryId );

/* --------------------------- ✅  TestPaper Route --------------------------- */
router.get("/test-papers/:testSeriesId", TestPaperController.getTestPaperByTestSeriesId);

/* --------------------------- ✅  TestPaperQuestion Route --------------------------- */
router.get("/get-QuestionByTestPaperId/:testpaperid",QuestionWithOptionsController.getQuestionByTestPaperId );



/* --------------------------- ✅  SubmitTest Route --------------------------- */
router.post("/SubmitTest",AttemptTestController.submitStudentTest );
router.post('/StartOrResumeTest', AttemptTestController.startOrResumeTest);
router.get('/TestResult/:AttemptId', AttemptTestController.getStudentTestResult);
router.get('/Test-Progress/:testSeriesId', AttemptTestController.getStudentTestProgress);


/* --------------------------- ✅  Chapters Route --------------------------- */
router.get("/get-AllChaptersBySubjectId/:subjectId",SubjectController.getChaptersBySubjectId );
router.get("/get-TopicsByChapterId/:chapterid",TopicOrClassController.getTopicsByChapterId );


/* --------------------------- ✅  PreviousYearPaper Route --------------------------- */

router.get("/get-AllPYPCategories",PreviousYearPaperCategoryController.getAllPYPCategories );
router.get("/get-AllPreviousYearPapers/:PYPCategoryId",PreviousYearPaperController.getPreviousYearPaperByPYPCategoryId );


/* --------------------------- ✅  CurrentAffrais Route --------------------------- */
router.get("/get-AllDailyCurrentAffairs",CurrentAffraisController.getAllDailyCurrentAffairs );
router.get("/get-AllMonthlyCurrentAffairs",CurrentAffraisController.getAllMonthlyCurrentAffairs );
/* --------------------------- ✅  User Route --------------------------- */


/* --------------------------- ✅  Syllabus Route --------------------------- */
router.get("/get-AllSyllabusCategories",SyllabusController.getAllSyllabusCategories );
router.get("/get-Syllabus/:SyllabusCategoryId",SyllabusController.getSyllabusBySyllabusCategoryId );
/* --------------------------- ✅  User Route --------------------------- */

router.get('/student-profile', studentMiddleware, Usercontroller.GetUserProfile);



export default router