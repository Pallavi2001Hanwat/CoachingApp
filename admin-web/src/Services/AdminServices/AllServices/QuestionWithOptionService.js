import api from '../Api_Intersecptor/AxiosAdmin';


// Get All Questions
export const getAllQuestionOptions = async () => {
  try {
    const response = await api.get('/get-AllQuestions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Get Question by ID
export const getQuestionOptionById = async (id) => {
  try {
    const response = await api.get(`/get-QuestionById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    throw error;
  }
};

// Create Question
export const createQuestionOption = async (QuestionWithOptionData) => {
  try {
    const response = await api.post(
      '/create-Question',
      QuestionWithOptionData,
      {
        validateStatus: () => true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Update Question
export const updateQuestionOption = async (id, QuestionWithOptionData) => {
  try {
    const response = await api.put(
      `/update-Question/${id}`,
      QuestionWithOptionData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete Question
export const deleteQuestionOption = async (id) => {
  try {
    const response = await api.delete(`/delete-Question/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

export const deleteAllQuestionOptions = async () => {
  try {
    const response = await api.delete('/delete-AllQuestions');
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Get Questions by Subject
export const getAllQuestionsBySubject = async (SelectedIdsData) => {
  try {
    const response = await api.post(
      '/get-AllQuestionsBySubject',
      SelectedIdsData
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by subject:', error);
    throw error;
  }
};

// Get Questions by Test Paper ID
export const getQuestionByTestPaperId = async (testpaperid) => {
  try {
    const response = await api.get(
      `/get-QuestionByTestPaperId/${testpaperid}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by test paper ID:', error);
    throw error;
  }
};

// Create Question + Add to Test Paper
export const createQuestionWithOption_and_addtoTestPaper = async (QuestionWithOptionData) => {
  try {
    const response = await api.post(
      '/createquestion-addin-testpaper',
      QuestionWithOptionData,
      {
        validateStatus: () => true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export const bulkUploadQuestions = async ( formData) => {
  try {
    const response = await api.post(
      `/bulk-upload-questions`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating TestPaper:", error);
    throw error;
  }
};