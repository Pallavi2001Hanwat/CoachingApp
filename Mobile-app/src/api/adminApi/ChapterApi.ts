import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for Chapter
export type Chapter = {
    _id?: string;
    Title: string;
    Image?: string;
    Description?: string;
    SubjectId: string;
    createdDate: Date;
    updatedDate: Date;
    Status: 'Active' | 'Inactive';

};


// ✅ Get all Chapters
export const getAllChapters = async (): Promise<Chapter[]> => {
    const { data } = await axiosInstance.get('/get-AllChapter');
    return data;
};

// ✅ Get single Chapter by ID
export const getChapterById = async (id: string): Promise<Chapter> => {
    const { data } = await axiosInstance.get(`/get-ChapterById/${id}`);
    return data;
};

// ✅ Create new Chapter
export const createChapter = async (ChapterData: Chapter): Promise<Chapter> => {
    const { data } = await axiosInstance.post('/create-Chapter', ChapterData);
    return data;
};

// ✅ Update Chapter
export const updateChapter = async (id: string, ChapterData: Partial<Chapter>): Promise<Chapter> => {
    const { data } = await axiosInstance.put(`/update-Chapter/${id}`, ChapterData);
    return data;
};

// ✅ Delete Chapter
export const deleteChapter = async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/delete-Chapter/${id}`);
    return data;
};


export const getChaptersBySubjectId = async (id: string): Promise<Chapter> => {
    const { data } = await axiosInstance.get(`/get-ChaptersBySubjectId/${id}`);
    return data;
};