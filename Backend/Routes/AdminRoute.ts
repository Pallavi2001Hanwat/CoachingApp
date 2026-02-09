import express, { Request, Response } from 'express';
const router = express.Router();
import Usercontroller from '../Controller/UserController';
import { authMiddleware } from '../Middleware/AuthMiddleware';
import CourseController from '../Controller/CourseController';
import CategoryController from '../Controller/CategoryController';
import SubjectController from '../Controller/SubjectController';
import ChapterController from '../Controller/ChapterController';
import TopicOrClassController from '../Controller/TopicOrClassController';
import DashboardItemController from '../Controller/DashboardItemController';
import TestSeriesController from '../Controller/TestSeriesController';
import TestPaperController from '../Controller/TestPaperController';
import QuestionWithOptionsController from '../Controller/QuestionWithOptionsController';
import PreviousYearPaperCategoryController from '../Controller/PreviousYearPaperCategoryController';
import PreviousYearPaperController from '../Controller/PreviousYearPaperController';
import SyllabusController from '../Controller/SyllabusController';

import CurrentAffraisController from '../Controller/CurrentAffraisController';


router.use(authMiddleware);

/* --------------------------- ✅  User Route --------------------------- */

router.post("/addUser", Usercontroller.AddUser);
router.get("/get-AllUser",Usercontroller.GetAllUsers );
router.get("/get-UserById/:id",Usercontroller.GetUserById );
router.put("/update-User/:id",Usercontroller.UpdateUser );
router.delete("/delete-User/:id",Usercontroller.DeleteUser );


/* --------------------------- ✅  Category Route --------------------------- */
router.post("/create-Category",CategoryController.createCategory );
router.get("/get-AllCategory",CategoryController.getAllCategories );
router.get("/get-CategoryById/:id",CategoryController.getCategoryById );
router.put("/update-Category/:id",CategoryController.updateCategory );
router.delete("/delete-Category/:id",CategoryController.deleteCategory );

/* --------------------------- ✅  Course Route --------------------------- */
router.post("/create-Course",CourseController.createCourse );
router.get("/get-AllCourse",CourseController.getAllCourses );
router.get("/get-CourseById/:id",CourseController.getCourseById );
router.put("/update-Course/:id",CourseController.updateCourse );
router.delete("/delete-Course/:id",CourseController.deleteCourse );
router.put("/AddSubject-ToCourse/:id",CourseController.AddSubjectToCourse );

/* --------------------------- ✅  Subject Route --------------------------- */
router.post("/create-Subject",SubjectController.createSubject );
router.get("/get-AllSubject",SubjectController.getAllSubjects );
router.get("/get-SubjectById/:id",SubjectController.getSubjectById );
router.put("/update-Subject/:id",SubjectController.updateSubject );
router.delete("/delete-Subject/:id",SubjectController.deleteSubject );


/* --------------------------- ✅  Chapter Route --------------------------- */
router.post("/create-Chapter",ChapterController.createChapter );
router.get("/get-AllChapter",ChapterController.getAllChapters );
router.get("/get-ChapterById/:id",ChapterController.getChapterById );
router.put("/update-Chapter/:id",ChapterController.updateChapter );
router.delete("/delete-Chapter/:id",ChapterController.deleteChapter );
router.get("/get-ChaptersBySubjectId/:id",ChapterController.getChaptersBySubjectId );


/* --------------------------- ✅  Topic Route --------------------------- */
router.post("/create-Topic",TopicOrClassController.createTopicOrClass );
router.get("/get-AllTopic",TopicOrClassController.getAllTopicOrClasss );
router.get("/get-TopicById/:id",TopicOrClassController.getTopicOrClassById );
router.put("/update-Topic/:id",TopicOrClassController.updateTopicOrClass );
router.delete("/delete-Topic/:id",TopicOrClassController.deleteTopicOrClass );
router.get("/get-TopicsByChapterId/:chapterid",TopicOrClassController.getTopicsByChapterId );


/* --------------------------- ✅  Dashboard Route --------------------------- */
router.post("/create-Dashboard_Item",DashboardItemController.createDashboard_Item );
router.get("/get-AllDashboard_Item",DashboardItemController.getAllDashboard_Items );
router.get("/get-Dashboard_ItemById/:id",DashboardItemController.getDashboard_ItemById );
router.put("/update-Dashboard_Item/:id",DashboardItemController.updateDashboard_Item );
router.delete("/delete-Dashboard_Item/:id",DashboardItemController.deleteDashboard_Item );





/* --------------------------- ✅  TestSeries Route --------------------------- */
router.post("/create-TestSeries",TestSeriesController.createTestSeries );
router.get("/get-AllTestSeries",TestSeriesController.getAllTestSeries );
router.get("/get-TestSeriesById/:id",TestSeriesController.getTestSeriesById );
router.put("/update-TestSeries/:id",TestSeriesController.updateTestSeries );
router.delete("/delete-TestSeries/:id",TestSeriesController.deleteTestSeries );



/* --------------------------- ✅  TestPaper Route --------------------------- */
router.post("/create-TestPaper",TestPaperController.createTestPaper );
router.get("/get-AllTestPapers",TestPaperController.getAllTestPapers );
router.get("/get-TestPaperById/:id",TestPaperController.getTestPaperById );
router.put("/update-TestPaper/:id",TestPaperController.updateTestPaper );
router.delete("/delete-TestPaper/:id",TestPaperController.deleteTestPaper );
router.post("/TestPaper-save-questions",TestPaperController.saveSelectedQuestionsToTestPaper );
router.delete("/TestPaper-delete-questions/:testpaperid",TestPaperController.removeAllSelectedQuestionsFromTestPaper );



/* --------------------------- ✅  QuestionWith Option  Route --------------------------- */
router.post("/create-Question",QuestionWithOptionsController.createQuestionWithOption );
router.get("/get-AllQuestions",QuestionWithOptionsController.getAllQuestions );
router.get("/get-QuestionById/:id",QuestionWithOptionsController.getQuestionById );
router.put("/update-Question/:id",QuestionWithOptionsController.updateQuestion );
router.delete("/delete-Question/:id",QuestionWithOptionsController.deleteQuestion );
router.post("/get-AllQuestionsBySubject",QuestionWithOptionsController.getAllQuestionsBySubject );
router.get("/get-QuestionByTestPaperId/:testpaperid",QuestionWithOptionsController.getQuestionByTestPaperId );
router.post("/createquestion-addin-testpaper",QuestionWithOptionsController.createQuestionWithOption_and_addtoTestPaper );






/* --------------------------- ✅  PreviousYearPaper Route --------------------------- */
router.post("/create-PYPCategory",PreviousYearPaperCategoryController.createPYPCategory );
router.get("/get-AllPYPCategories",PreviousYearPaperCategoryController.getAllPYPCategories );
router.get("/get-PYPCategoryById/:id",PreviousYearPaperCategoryController.getPYPCategoryById );
router.put("/update-PYPCategory/:id",PreviousYearPaperCategoryController.updatePYPCategory );
router.delete("/delete-PYPCategory/:id",PreviousYearPaperCategoryController.deletePYPCategory );


router.post("/create-PreviousYearPaper",PreviousYearPaperController.createPreviousYearPaper );
router.get("/get-AllPreviousYearPapers",PreviousYearPaperController.getAllPreviousYearPapers );
router.get("/get-PreviousYearPaperById/:id",PreviousYearPaperController.getPreviousYearPaperById );
router.put("/update-PreviousYearPaper/:id",PreviousYearPaperController.updatePreviousYearPaper );
router.delete("/delete-PreviousYearPaper/:id",PreviousYearPaperController.deletePreviousYearPaper );





/* --------------------------- ✅  Current Affairs  Route --------------------------- */
router.post("/create-DailyCurrentAffairs",CurrentAffraisController.createDailyCurrentAffairs );
router.get("/get-AllDailyCurrentAffairs",CurrentAffraisController.getAllDailyCurrentAffairs );
router.get("/get-DailyCurrentAffairsById/:id",CurrentAffraisController.getDailyCurrentAffairsById );
router.put("/update-DailyCurrentAffairs/:id",CurrentAffraisController.updateDailyCurrentAffairs );
router.delete("/delete-DailyCurrentAffairs/:id",CurrentAffraisController.deleteDailyCurrentAffairs );


router.post("/create-MonthlyCurrentAffairs",CurrentAffraisController.createMonthlyCurrentAffairs );
router.get("/get-AllMonthlyCurrentAffairs",CurrentAffraisController.getAllMonthlyCurrentAffairs );
router.get("/get-MonthlyCurrentAffairsById/:id",CurrentAffraisController.getMonthlyCurrentAffairsById );
router.put("/update-MonthlyCurrentAffairs/:id",CurrentAffraisController.updateMonthlyCurrentAffairs );
router.delete("/delete-MonthlyCurrentAffairs/:id",CurrentAffraisController.deleteMonthlyCurrentAffairs );





/* --------------------------- ✅  SyllabusController Route --------------------------- */
router.post("/create-SyllabusCategory",SyllabusController.createSyllabusCategory );
router.get("/get-AllSyllabusCategories",SyllabusController.getAllSyllabusCategories );
router.get("/get-SyllabusCategoryById/:id",SyllabusController.getSyllabusCategoryById );
router.put("/update-SyllabusCategory/:id",SyllabusController.updateSyllabusCategory );
router.delete("/delete-SyllabusCategory/:id",SyllabusController.deleteSyllabusCategory );


router.post("/create-Syllabus",SyllabusController.createSyllabus );
router.get("/get-AllSyllabus",SyllabusController.getAllSyllabus );
router.get("/get-SyllabusById/:id",SyllabusController.getSyllabusById );
router.put("/update-Syllabus/:id",SyllabusController.updateSyllabus );
router.delete("/delete-Syllabus/:id",SyllabusController.deleteSyllabus );


export default router