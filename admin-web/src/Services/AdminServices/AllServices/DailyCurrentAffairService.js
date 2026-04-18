import api from '../Api_Intersecptor/AxiosAdmin';

// Add DailyCurrentAffair
export const createDailyCurrentAffair = async (DailyCurrentAffairData) => {
    try {
        
      const response = await api.post('/create-DailyCurrentAffairs', DailyCurrentAffairData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllDailyCurrentAffairs = async () => {
    try {
        const response = await api.get('/get-AllDailyCurrentAffairs');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get DailyCurrentAffair by Slug
export const getDailyCurrentAffairById = async (Id) => {
    try {
        
        const response = await api.get(`/get-DailyCurrentAffairsById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching DailyCurrentAffair by Id:', error);
        throw error;
    }
};

// Update DailyCurrentAffair
export const updateDailyCurrentAffair = async (Id, DailyCurrentAffairData) => {
    try {
        const response = await api.put(`/update-DailyCurrentAffairs/${Id}`, DailyCurrentAffairData);
        return response.data;
    } catch (error) {
        console.error('Error updating DailyCurrentAffair:', error);
        throw error;
    }
};

// Delete DailyCurrentAffair
export const deleteDailyCurrentAffair = async (DailyCurrentAffairId) => {
    try {
        const response = await api.delete(`/delete-DailyCurrentAffairs/${DailyCurrentAffairId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting DailyCurrentAffair:', error);
        throw error;
    }
};


// Delete DailyCurrentAffair
export const deleteAllDailyCurrentAffair = async () => {
    try {
        const response = await api.delete(`/delete-AllDailyCurrentAffairs`);
        return response.data;
    } catch (error) {
        console.error('Error deleting DailyCurrentAffair:', error);
        throw error;
    }
};




