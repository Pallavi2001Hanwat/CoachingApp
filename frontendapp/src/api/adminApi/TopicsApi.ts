import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for Topic
export type Topic = {
  _id?: string;
  Title: string;
  Description?: string;

  VideoURL: string;
  Duration?: number;

  videoThumbnail?: string;
  pdfUrl?: string;
  extraFiles?: string[];       // assuming array of file URLs
  classType?: string;          // string because type not specified
  classOrder?: number;
  duration?: number;           // duplicate of Duration?
  isFree?: boolean;
  isLocked?: boolean;

  ChapterId:string;
  SubjectId: string;
  CreatedBy: string;
 TeacherId:  string;

  Status: "Active" | "Inactive";

  CreatedAt?: string;
  UpdatedAt?: string;
};


// ✅ Get all Topics
export const getAllTopics = async (): Promise<Topic[]> => {
  const { data } = await axiosInstance.get('/get-AllTopic');
  return data;
};

// ✅ Get single Topic by ID
export const getTopicById = async (id: string): Promise<Topic> => {
  const { data } = await axiosInstance.get(`/get-TopicById/${id}`);
  return data;
};

// ✅ Create new Topic
export const createTopic = async (TopicData: Topic): Promise<Topic> => {
  const { data } = await axiosInstance.post(
    '/create-Topic',
    TopicData,
    {
      timeout: 120000, // ⏳ 2 minutes
    }
  );

  return data;
};


// ✅ Update Topic
export const updateTopic = async (id: string, TopicData: Partial<Topic>): Promise<Topic> => {
  const { data } = await axiosInstance.put(`/update-Topic/${id}`, TopicData);
  return data;
};

// ✅ Delete Topic
export const deleteTopic = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Topic/${id}`);
  return data;
};


export const getTopicsByChapterId = async (chapterid: string): Promise<Topic> => {
    const { data } = await axiosInstance.get(`/get-TopicsByChapterId/${chapterid}`);
    return data;
};