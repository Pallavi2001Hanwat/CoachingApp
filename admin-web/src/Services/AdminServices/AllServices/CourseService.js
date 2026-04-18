import api from '../Api_Intersecptor/AxiosAdmin';

// Add Course
export const addCourse = async (CourseData) => {
    try {
        
      const response = await api.post('/create-Course', CourseData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllCourses = async () => {
    try {
        const response = await api.get('/get-AllCourse');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Course by Slug
export const getCourseById = async (Id) => {
    try {
        
        const response = await api.get(`/get-CourseById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Course by Id:', error);
        throw error;
    }
};

// Update Course
export const updateCourse = async (Id, CourseData) => {
    try {
        const response = await api.put(`/update-Course/${Id}`, CourseData);
        return response.data;
    } catch (error) {
        console.error('Error updating Course:', error);
        throw error;
    }
};

// Delete Course
export const deleteCourse = async (CourseId) => {
    try {
        const response = await api.delete(`/delete-Course/${CourseId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Course:', error);
        throw error;
    }
};

// Delete All Courses
export const deleteAllCourses = async () => {
    try {
        const response = await api.delete('/delete-AllCourses');
        return response.data;
    } catch (error) {
        console.error('Error deleting Course:', error);
        throw error;
    }
};

export const addSubjectToCourse = async (CourseId,CourseData) => {
    try {
        const response = await api.put(`/AddSubject-ToCourse/${CourseId}`, CourseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
