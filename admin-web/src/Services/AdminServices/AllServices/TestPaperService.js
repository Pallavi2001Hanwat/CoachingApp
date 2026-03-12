import api from '../Api_Intersecptor/AxiosAdmin';

// Add TestPaper
export const createTestPaper = async (TestPaperData) => {
    try {
        
      const response = await api.post('/create-TestPaper', TestPaperData, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };
  

// Get All Categories
export const getAllTestPapers = async () => {
    try {
        const response = await api.get('/get-AllTestPapers');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Get TestPaper by Slug
export const getTestPaperById = async (Id) => {
    try {
        
        const response = await api.get(`/get-TestPaperById/${Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching TestPaper by Id:', error);
        throw error;
    }
};

// Update TestPaper
export const updateTestPaper = async (Id, TestPaperData) => {
    try {
        const response = await api.put(`/update-TestPaper/${Id}`, TestPaperData);
        return response.data;
    } catch (error) {
        console.error('Error updating TestPaper:', error);
        throw error;
    }
};

// Delete TestPaper
export const deleteTestPaper = async (TestPaperId) => {
    try {
        const response = await api.delete(`/delete-TestPaper/${TestPaperId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting TestPaper:', error);
        throw error;
    }
};




// ✅ Save selected questions to test paper
export const saveQuestionToTestPaper = async (SaveTestPaperQuestionsPayload) => {
    try {
        
      const response = await api.post('/TestPaper-save-questions', SaveTestPaperQuestionsPayload, {
        validateStatus: () => true   // ab har status ka response yaha milega, catch me nahi jayega
      });
      return response.data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  // Delete TestPaper
export const removeAllSelectedQuestionsFromTestPaper = async (testpaperid) => {
    try {
        const response = await api.delete(`/TestPaper-delete-questions/${testpaperid}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting TestPaper:', error);
        throw error;
    }
};