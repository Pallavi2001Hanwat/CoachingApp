import api from '../Api_Intersecptor/AxiosAdmin';

// Add PreviousYearPaper
export const addPreviousYearPaper = async (PreviousYearPaperData) => {
    try {
        
      const response = await api.post('/create-PreviousYearPaper', PreviousYearPaperData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllPreviousYearPapers = async () => {
    try {
        const response = await api.get('/get-AllPreviousYearPapers');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get PreviousYearPaper by Slug
export const getPreviousYearPaperById = async (Id) => {
    try {
        
        const response = await api.get(`/get-PreviousYearPaperById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching PreviousYearPaper by Id:', error);
        throw error;
    }
};

// Update PreviousYearPaper
export const updatePreviousYearPaper = async (Id, PreviousYearPaperData) => {
    try {
        const response = await api.put(`/update-PreviousYearPaper/${Id}`, PreviousYearPaperData);
        return response.data;
    } catch (error) {
        console.error('Error updating PreviousYearPaper:', error);
        throw error;
    }
};

// Delete PreviousYearPaper
export const deletePreviousYearPaper = async (PreviousYearPaperId) => {
    try {
        const response = await api.delete(`/delete-PreviousYearPaper/${PreviousYearPaperId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting PreviousYearPaper:', error);
        throw error;
    }
};

// Delete PreviousYearPaper
export const deleteAllPreviousYearPapers = async () => {
    try {
        const response = await api.delete('/delete-AllPreviousYearPapers');
        return response.data;
    } catch (error) {
        console.error('Error deleting PreviousYearPaper:', error);
        throw error;
    }
};
