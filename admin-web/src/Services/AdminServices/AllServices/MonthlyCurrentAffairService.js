import api from '../Api_Intersecptor/AxiosAdmin';

// Add MonthlyCurrentAffair
export const createMonthlyCurrentAffair = async (MonthlyCurrentAffairData) => {
    try {
        
      const response = await api.post('/create-MonthlyCurrentAffairs', MonthlyCurrentAffairData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllMonthlyCurrentAffairs = async () => {
    try {
        const response = await api.get('/get-AllMonthlyCurrentAffairs');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get MonthlyCurrentAffair by Slug
export const getMonthlyCurrentAffairById = async (Id) => {
    try {
        
        const response = await api.get(`/get-MonthlyCurrentAffairsById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching MonthlyCurrentAffair by Id:', error);
        throw error;
    }
};

// Update MonthlyCurrentAffair
export const updateMonthlyCurrentAffair = async (Id, MonthlyCurrentAffairData) => {
    try {
        const response = await api.put(`/update-MonthlyCurrentAffairs/${Id}`, MonthlyCurrentAffairData);
        return response.data;
    } catch (error) {
        console.error('Error updating MonthlyCurrentAffair:', error);
        throw error;
    }
};

// Delete MonthlyCurrentAffair
export const deleteMonthlyCurrentAffair = async (MonthlyCurrentAffairId) => {
    try {
        const response = await api.delete(`/delete-MonthlyCurrentAffairs/${MonthlyCurrentAffairId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting MonthlyCurrentAffair:', error);
        throw error;
    }
};

// Delete MonthlyCurrentAffair
export const deleteAllMonthlyCurrentAffair = async () => {
    try {
        const response = await api.delete(`/delete-AllMonthlyCurrentAffairs`);
        return response.data;
    } catch (error) {
        console.error('Error deleting MonthlyCurrentAffair:', error);
        throw error;
    }
};





