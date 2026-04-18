import api from '../Api_Intersecptor/AxiosAdmin';

// Add Category
export const addCategory = async (CategoryData) => {
    try {
        
      const response = await api.post('/create-Category', CategoryData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllCategories = async () => {
    try {
        const response = await api.get('/get-AllCategory');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Category by Slug
export const getCategoryById = async (Id) => {
    try {
        
        const response = await api.get(`/get-CategoryById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching category by Id:', error);
        throw error;
    }
};

// Update Category
export const updateCategory = async (Id, CategoryData) => {
    try {
        const response = await api.put(`/update-Category/${Id}`, CategoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

// Delete Category
export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/delete-Category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};


// Delete AllCategory
export const deleteAllCategories = async () => {
    try {
        const response = await api.delete(`/delete-AllCategory`);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
