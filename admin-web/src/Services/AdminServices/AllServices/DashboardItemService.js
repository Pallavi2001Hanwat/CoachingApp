import api from '../Api_Intersecptor/AxiosAdmin';

// Add DashboardItem
export const addDashboardItem = async (DashboardItemData) => {
    try {
        
      const response = await api.post('/create-Dashboard_Item', DashboardItemData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllDashboardItems = async () => {
    try {
        const response = await api.get('/get-AllDashboard_Item');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get DashboardItem by Slug
export const getDashboardItemById = async (Id) => {
    try {
        
        const response = await api.get(`/get-Dashboard_ItemById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching DashboardItem by Id:', error);
        throw error;
    }
};

// Update DashboardItem
export const updateDashboardItem = async (Id, DashboardItemData) => {
    try {
        const response = await api.put(`/update-Dashboard_Item/${Id}`, DashboardItemData);
        return response.data;
    } catch (error) {
        console.error('Error updating DashboardItem:', error);
        throw error;
    }
};

// Delete DashboardItem
export const deleteDashboardItem = async (DashboardItemId) => {
    try {
        const response = await api.delete(`/delete-Dashboard_Item/${DashboardItemId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting DashboardItem:', error);
        throw error;
    }
};


