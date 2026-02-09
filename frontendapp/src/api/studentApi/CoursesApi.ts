import axiosInstance from '../api_Intersecptor/user_axiosInstance';

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


export interface Subject {
  _id: string;
  Title: string;
  SubjectCode: string;
  Description?: string;
  Image?: string;
  Status: 'Active' | 'Inactive';
}



export const getCoursesByCategoryId = async (categoryId: string): Promise<Course> => {
  const { data } = await axiosInstance.get(`/student/get-AllCoursesByCategoryId/${categoryId}`);
  return data;
};

export const getAll_Free_Courses = async (): Promise<Course> => {
  const { data } = await axiosInstance.get(`/student/getAll-Free_Courses`);
  return data;
};

export const getAllCourses = async (): Promise<Course[]> => {
  const { data } = await axiosInstance.get('/student/get-All-Active-Course');
  return data;
};

export const getSubjectsByCourseId = async (
  courseId: string
): Promise<Subject[]> => {
  const { data } = await axiosInstance.get(
    `/student/get-AllsubjectsByCourseId/${courseId}`
  );

  return data;
};
