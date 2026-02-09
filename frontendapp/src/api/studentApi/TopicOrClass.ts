import axiosInstance from '../api_Intersecptor/user_axiosInstance';

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


export const getTopicsByChapterId = async (chapterid: string): Promise<Topic> => {
    const { data } = await axiosInstance.get(`/student/get-TopicsByChapterId/${chapterid}`);
    return data;
};