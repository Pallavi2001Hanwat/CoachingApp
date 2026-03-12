import api from '../Api_Intersecptor/AxiosAdmin';

// Add Chapter
export const addChapter = async (ChapterData) => {
    try {
        
      const response = await api.post('/create-Chapter', ChapterData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllChapters = async () => {
    try {
        console.log('getAllChapters called');
        const response = await api.get('/get-AllChapter');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get Chapter by Slug
export const getChapterById = async (Id) => {
    try {
        
        const response = await api.get(`/get-ChapterById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Chapter by Id:', error);
        throw error;
    }
};

// Update Chapter
export const updateChapter = async (Id, ChapterData) => {
    try {
        const response = await api.put(`/update-Chapter/${Id}`, ChapterData);
        return response.data;
    } catch (error) {
        console.error('Error updating Chapter:', error);
        throw error;
    }
};

// Delete Chapter
export const deleteChapter = async (ChapterId) => {
    try {
        const response = await api.delete(`/delete-Chapter/${ChapterId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting Chapter:', error);
        throw error;
    }
};


// Get Chapter by Slug
export const getChaptersBySubjectId = async (Id) => {
    try {
        
        const response = await api.get(`/get-ChaptersBySubjectId/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Chapter by Id:', error);
        throw error;
    }
};


