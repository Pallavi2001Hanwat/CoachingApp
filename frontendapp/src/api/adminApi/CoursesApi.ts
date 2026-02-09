import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for Course
export type Course = {
  _id?: string;
  Title: string;
  Description: string;
  Category: string;
  Level: string;
  Price: number;
  IsPaid: boolean;
  Language?: string;
  Image?: string;
  TeacherId: string; 
  ExpiryDate?: string; // Date → string for frontend
  StartingDate?: string; // Date → string for frontend
  DiscountPercentage?: number;

  Sections?: {
    title: string;
    description?: string;
    videoUrl?: string;
    pdfUrl?: string;
    order: number;
  }[];

  LiveClasses?: {
    title: string;
    date: string;   // Date → string for frontend
    time: string;
    link: string;
    duration?: number;
    status: string;
  }[];

  Materials?: {
    title: string;
    fileUrl: string;
    uploadedAt: string; // Date → string
  }[];

  EnrolledStudents?: string[]; // ObjectId[] → string[]

  Ratings?: {
    studentId: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }[];

 SelectedSubjects?: string[]; 
 SelectedChapters?: string[]; 
 SelectedTopics?: string[]; 

  AverageRating?: number;
  TotalStudents?: number;
  Status: 'draft' | 'published' | 'archived';
  CreatedAt?: string;
  UpdatedAt?: string;
};


// ✅ Get all Courses
export const getAllCourses = async (): Promise<Course[]> => {
  const { data } = await axiosInstance.get('/get-AllCourse');
  return data;
};

// ✅ Get single Course by ID
export const getCourseById = async (id: string): Promise<Course> => {
  const { data } = await axiosInstance.get(`/get-CourseById/${id}`);
  return data;
};

// ✅ Create new Course
export const createCourse = async (CourseData: Course): Promise<Course> => {

  const { data } = await axiosInstance.post('/create-Course', CourseData);
  return data;
};

// ✅ Update Course
export const updateCourse = async (id: string, CourseData: Partial<Course>): Promise<Course> => {
  const { data } = await axiosInstance.put(`/update-Course/${id}`, CourseData);
  return data;
};

// ✅ Delete Course
export const deleteCourse = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Course/${id}`);
  return data;
};


export const addSubjectToCourse = async (id: string, CourseData: Partial<Course>): Promise<Course> => {
  const { data } = await axiosInstance.put(`/AddSubject-ToCourse/${id}`, CourseData);
  return data;
};


