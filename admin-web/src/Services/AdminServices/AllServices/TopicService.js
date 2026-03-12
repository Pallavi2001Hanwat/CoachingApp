import api from '../Api_Intersecptor/AxiosAdmin';

// Add Topic
export const addTopic = async (TopicData) => {
    try {
        
      const response = await api.post('/create-Topic', TopicData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllTopics = async () => {
    try {
       
        const response = await api.get('/get-AllTopic');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Topic by Slug
export const getTopicById = async (Id) => {
    try {
        
        const response = await api.get(`/get-TopicById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Topic by Id:', error);
        throw error;
    }
};

// Update Topic
export const updateTopic = async (Id, TopicData) => {
    try {
        const response = await api.put(`/update-Topic/${Id}`, TopicData);
        return response.data;
    } catch (error) {
        console.error('Error updating Topic:', error);
        throw error;
    }
};

// Delete Topic
export const deleteTopic = async (TopicId) => {
    try {
        const response = await api.delete(`/delete-Topic/${TopicId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Topic:', error);
        throw error;
    }
};


// Get Topic by Slug
export const getTopicsByChapterId = async (Id) => {
    try {
        
        const response = await api.get(`/get-TopicsByChapterId/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Topic by Id:', error);
        throw error;
    }
};


