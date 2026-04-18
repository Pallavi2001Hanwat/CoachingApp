import api from '../Api_Intersecptor/AxiosAdmin';

// Add Syllabus
export const createSyllabus = async (SyllabusData) => {
    try {
        
      const response = await api.post('/create-Syllabus', SyllabusData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllSyllabuss = async () => {
    try {
        const response = await api.get('/get-AllSyllabus');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Syllabus by Slug
export const getSyllabusById = async (Id) => {
    try {
        
        const response = await api.get(`/get-SyllabusById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Syllabus by Id:', error);
        throw error;
    }
};

// Update Syllabus
export const updateSyllabus = async (Id, SyllabusData) => {
    try {
        const response = await api.put(`/update-Syllabus/${Id}`, SyllabusData);
        return response.data;
    } catch (error) {
        console.error('Error updating Syllabus:', error);
        throw error;
    }
};

// Delete Syllabus
export const deleteSyllabus = async (SyllabusId) => {
    try {
        const response = await api.delete(`/delete-Syllabus/${SyllabusId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Syllabus:', error);
        throw error;
    }
};

// Delete All Syllabus
export const deleteAllSyllabus = async (SyllabusId) => {
    try {
        const response = await api.delete(`/deleteAll-Syllabus`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Syllabus:', error);
        throw error;
    }
};





