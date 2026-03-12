import api from '../Api_Intersecptor/AxiosAdmin';

// Add Subject
export const addSubject = async (SubjectData) => {
    try {
        
      const response = await api.post('/create-Subject', SubjectData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllSubjects = async () => {
    try {
        const response = await api.get('/get-AllSubject');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Subject by Slug
export const getSubjectById = async (Id) => {
    try {
        
        const response = await api.get(`/get-SubjectById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Subject by Id:', error);
        throw error;
    }
};

// Update Subject
export const updateSubject = async (Id, SubjectData) => {
    try {
        const response = await api.put(`/update-Subject/${Id}`, SubjectData);
        return response.data;
    } catch (error) {
        console.error('Error updating Subject:', error);
        throw error;
    }
};

// Delete Subject
export const deleteSubject = async (SubjectId) => {
    try {
        const response = await api.delete(`/delete-Subject/${SubjectId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Subject:', error);
        throw error;
    }
};
