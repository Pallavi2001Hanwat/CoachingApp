import api from '../Api_Intersecptor/AxiosAdmin';

// Add PreviousYearPaperCategory
export const addPreviousYearPaperCategory = async (PreviousYearPaperCategoryData) => {
    try {
        
      const response = await api.post('/create-PYPCategory', PreviousYearPaperCategoryData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllPreviousYearPaperCategorys = async () => {
    try {;
        const response = await api.get('/get-AllPYPCategories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get PreviousYearPaperCategory by Slug
export const getPreviousYearPaperCategoryById = async (Id) => {
    try {
        
        const response = await api.get(`/get-PYPCategoryById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching PreviousYearPaperCategory by Id:', error);
        throw error;
    }
};

// Update PreviousYearPaperCategory
export const updatePreviousYearPaperCategory = async (Id, PreviousYearPaperCategoryData) => {
    try {
        const response = await api.put(`/update-PYPCategory/${Id}`, PreviousYearPaperCategoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating PreviousYearPaperCategory:', error);
        throw error;
    }
};

// Delete PreviousYearPaperCategory
export const deletePreviousYearPaperCategory = async (PreviousYearPaperCategoryId) => {
    try {
        const response = await api.delete(`/delete-PYPCategory/${PreviousYearPaperCategoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting PreviousYearPaperCategory:', error);
        throw error;
    }
};


// Delete All PreviousYearPaperCategory
export const deleteAllPreviousYearPaperCategorys = async () => {
    try {
        const response = await api.delete('/deleteAllPYPCategories');
        return response.data;
    } catch (error) {
        console.error('Error deleting PreviousYearPaperCategory:', error);
        throw error;
    }
};




