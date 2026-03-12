import React from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import AuthGuard from '../Services/AdminServices/AllServices/AuthGuard';
import AdminLayout from '../Admin/Layout/AdminLayout';

import UserList from '../Admin/Tabs/UserManagement/UserList';
import UserForm from '../Admin/Tabs/UserManagement/UserForm';

import CategoryForm from '../Admin/Tabs/Category/CategoryForm';
import CategoryList from '../Admin/Tabs/Category/CategoryList';
import CourseForm from '../Admin/Tabs/Courses/CourseForm';
import CourseList from '../Admin/Tabs/Courses/CourseList';
import DashboardItemList from '../Admin/Tabs/DashboardItem/DashboardItemList';
import DashboardItemForm from '../Admin/Tabs/DashboardItem/DashboardItemForm';
import SubjectList from '../Admin/Tabs/Subject/SubjectList';
import SubjectForm from '../Admin/Tabs/Subject/SubjectForm';
import ChapterList from '../Admin/Tabs/Chapters/ChapterList';
import ChapterForm from '../Admin/Tabs/Chapters/ChapterForm';
import TopicList from '../Admin/Tabs/Topics/TopicList';
import TopicForm from '../Admin/Tabs/Topics/TopicForm';
import PreviousYearPaperCategoryForm from '../Admin/Tabs/PYPCategory/PreviousYearPaperCategoryForm';
import PreviousYearPaperCategoryList from '../Admin/Tabs/PYPCategory/PreviousYearPaperCategoryList';
import PreviousYearPaperForm from '../Admin/Tabs/PreviousYearPaper/PreviousYearPaperForm';
import PreviousYearPaperList from '../Admin/Tabs/PreviousYearPaper/PreviousYearPaperList';
import TestSeriesForm from '../Admin/Tabs/TestSeries/TestSeriesForm';
import TestSeriesList from '../Admin/Tabs/TestSeries/TestSeriesList';
import TestPaperList from '../Admin/Tabs/TestPaper/TestPaperList';
import TestPaperForm from '../Admin/Tabs/TestPaper/TestPaperForm';




const AdminRoutes = () => {

  const location = useLocation();

  //  Valid admin paths — base prefixes only
  const validAdminPaths = [


    "/admin/users",
    "/admin/user",
    "/admin/category",
    "/admin/Courses",
    "/admin/Course",
    "/admin/DashboardItems",
    "/admin/DashboardItem",
     "/admin/Subjects",
    "/admin/Subject",
     "/admin/Chapters",
    "/admin/Chapter",
     "/admin/Topics",
    "/admin/Topic",
     "/admin/PreviousYearPaperCategorys",
    "/admin/PreviousYearPaperCategory",
 "/admin/PreviousYearPapers",
    "/admin/PreviousYearPaper",
    "/admin/TestSeries",
    "/admin/TestPaper",
    "/admin/TestPapers",






  ];
  debugger
  const isValidPath = validAdminPaths.some(path =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  // 🧩 If invalid admin path — show LoginForm (without AdminLayout)
  if (!isValidPath)
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>404 Not found </h2>
        <p>Please login to access this page.</p>
        <Link to="/admin/login">
          <button
            className='button'
          >
            Go to Login
          </button>
        </Link>
      </div>
    );
  return (
    <AdminLayout>
      <Routes>





        {/* Users route */}
        <Route
          path="/Users"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <UserList />
            </AuthGuard>
          }
        />
        <Route
          path="/User/create"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <UserForm isEditMode={false} />
            </AuthGuard>
          }
        />
        <Route
          path="/User/Edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <UserForm isEditMode={true} />
            </AuthGuard>
          }
        />


        {/* Category route */}
        <Route path="/Category/create" element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <CategoryForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/Category/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <CategoryForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/Category"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <CategoryList />
            </AuthGuard>
          }
        />


        {/* Course route */}
        <Route path="/Course/create" element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <CourseForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/Course/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <CourseForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/Courses"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <CourseList />
            </AuthGuard>
          }
        />



        {/* DashboardItem route */}
        <Route path="/DashboardItem/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <DashboardItemForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/DashboardItem/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <DashboardItemForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/DashboardItems"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <DashboardItemList />
            </AuthGuard>
          }
        />



        {/* Subjects route */}
        <Route path="/Subject/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <SubjectForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/Subject/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <SubjectForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/Subjects"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <SubjectList />
            </AuthGuard>
          }
        />



        {/* Chapter route */}
        <Route path="/Chapter/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <ChapterForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/Chapter/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <ChapterForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/Chapters"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <ChapterList />
            </AuthGuard>
          }
        />



         {/* Topic route */}
        <Route path="/Topic/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <TopicForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/Topic/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TopicForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/Topics"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TopicList />
            </AuthGuard>
          }
        />


        
         {/* PreviousYearPaperCategory route */}
        <Route path="/PreviousYearPaperCategory/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <PreviousYearPaperCategoryForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/PreviousYearPaperCategory/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <PreviousYearPaperCategoryForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/PreviousYearPaperCategorys"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <PreviousYearPaperCategoryList />
            </AuthGuard>
          }
        />


{/* PreviousYearPaper route */}
        <Route path="/PreviousYearPaper/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <PreviousYearPaperForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/PreviousYearPaper/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <PreviousYearPaperForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/PreviousYearPapers"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <PreviousYearPaperList />
            </AuthGuard>
          }
        />

        {/* TestSeries route */}
        <Route path="/TestSeries/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <TestSeriesForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/TestSeries/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TestSeriesForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/TestSeries"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TestSeriesList />
            </AuthGuard>
          }
        />


         {/* TestPaper route */}
        <Route path="/TestPaper/create"
          element={<AuthGuard allowedRoles={['Admin', 'Teacher']}> <TestPaperForm isEditMode={false} /> </AuthGuard>} />
        <Route
          path="/TestPaper/edit/:id"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TestPaperForm isEditMode={true} />
            </AuthGuard>
          }
        />
        <Route
          path="/TestPapers"
          element={
            <AuthGuard allowedRoles={['Admin', 'Teacher']}>
              <TestPaperList />
            </AuthGuard>
          }
        />


      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
