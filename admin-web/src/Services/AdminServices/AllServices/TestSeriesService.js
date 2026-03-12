import api from '../Api_Intersecptor/AxiosAdmin';

// Add TestSeries
export const createTestSeries = async (TestSeriesData) => {
    try {
        
      const response = await api.post('/create-TestSeries', TestSeriesData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllTestSeriess = async () => {
    try {
        const response = await api.get('/get-AllTestSeries');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get TestSeries by Slug
export const getTestSeriesById = async (Id) => {
    try {
        
        const response = await api.get(`/get-TestSeriesById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching TestSeries by Id:', error);
        throw error;
    }
};

// Update TestSeries
export const updateTestSeries = async (Id, TestSeriesData) => {
    try {
        const response = await api.put(`/update-TestSeries/${Id}`, TestSeriesData);
        return response.data;
    } catch (error) {
        console.error('Error updating TestSeries:', error);
        throw error;
    }
};

// Delete TestSeries
export const deleteTestSeries = async (TestSeriesId) => {
    try {
        const response = await api.delete(`/delete-TestSeries/${TestSeriesId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting TestSeries:', error);
        throw error;
    }
};


export const getTestSeriesByCategory = async (categoryId) => {
    try {
        
        const response = await api.get(`/get-AllTestSeriesByCategoryId/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching TestSeries by Id:', error);
        throw error;
    }
};


