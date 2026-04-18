import api from '../Api_Intersecptor/AxiosAdmin';

// Add SyllabusCategory
export const createSyllabusCategory = async (SyllabusCategoryData) => {
    try {
        
      const response = await api.post('/create-SyllabusCategory', SyllabusCategoryData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllSyllabusCategorys = async () => {
    try {
        const response = await api.get('/get-AllSyllabusCategories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get SyllabusCategory by Slug
export const getSyllabusCategoryById = async (Id) => {
    try {
        
        const response = await api.get(`/get-SyllabusCategoryById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching SyllabusCategory by Id:', error);
        throw error;
    }
};

// Update SyllabusCategory
export const updateSyllabusCategory = async (Id, SyllabusCategoryData) => {
    try {
        const response = await api.put(`/update-SyllabusCategory/${Id}`, SyllabusCategoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating SyllabusCategory:', error);
        throw error;
    }
};

// Delete SyllabusCategory
export const deleteSyllabusCategory = async (SyllabusCategoryId) => {
    try {
        const response = await api.delete(`/delete-SyllabusCategory/${SyllabusCategoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting SyllabusCategory:', error);
        throw error;
    }
};


// Delete SyllabusCategory
export const deleteAllSyllabusCategory = async (SyllabusCategoryId) => {
    try {
        const response = await api.delete(`/deleteAll-SyllabusCategories`);
        return response.data;
    } catch (error) {
        console.error('Error deleting SyllabusCategory:', error);
        throw error;
    }
};





