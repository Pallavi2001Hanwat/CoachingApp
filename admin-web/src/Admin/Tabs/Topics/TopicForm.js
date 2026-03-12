import React, { useState, useEffect, useRef } from "react";
import {
  addTopic,
  updateTopic,
  getTopicById,
} from "../../../Services/AdminServices/AllServices/TopicService";

import { getAllSubjects } from "../../../Services/AdminServices/AllServices/SubjectService";
import { getChaptersBySubjectId } from "../../../Services/AdminServices/AllServices/ChapterService";

import "../../AdminStyle/AdminGlobalStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../Utils/showResponseMessage";

const TopicForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [VideoURL, setVideoURL] = useState("");
  const [Duration, setDuration] = useState("");

  const [pdfUrl, setPdfUrl] = useState("");
  const [extraFiles, setExtraFiles] = useState([]);

  const [classType, setClassType] = useState("");
  const [classOrder, setClassOrder] = useState("");

  const [duration, setDuration2] = useState("");

  const [isFree, setIsFree] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [SubjectId, setSubjectId] = useState("");
  const [ChapterId, setChapterId] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [Status, setStatus] = useState("Active");

  useEffect(() => {

    if (!isFetchedRef.current) {

      const loadData = async () => {

        try {

          const subjectRes = await getAllSubjects();
          setSubjects(subjectRes.Subjects || []);

          if (isEditMode && id) {

            const response = await getTopicById(id);
console.log("getTopicById response:", response.TopicOrClass);
            if (!response.TopicOrClass) return;

            const t = response.TopicOrClass;

            setTitle(t.Title || "");
            setDescription(t.Description || "");
            setVideoURL(t.VideoURL || "");
            setDuration(t.Duration || "");
            setPdfUrl(t.pdfUrl || "");
            setExtraFiles(t.extraFiles || []);

            setClassType(t.classType || "");
            setClassOrder(t.classOrder || "");
            setDuration2(t.duration || "");

            setIsFree(!!t.isFree);
            setIsLocked(!!t.isLocked);

            setSubjectId(t.SubjectId || "");
            setChapterId(t.ChapterId || "");

            setStatus(t.Status || "Active");

            if (t.SubjectId) {
              const chRes = await getChaptersBySubjectId(t.SubjectId);
              setChapters(chRes.Chapters || []);
            }

          }

        } catch (err) {

          toast.error("Error loading data");

        } finally {

          setIsLoading(false);

        }

      };

      loadData();
      isFetchedRef.current = true;

    }

  }, [isEditMode, id]);

  const handleCancel = () => {
    navigate("/admin/Topics");
  };

  const handleFileToBase64 = (file, callback) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      callback(reader.result);
    };

  };

  const handleVideoChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    handleFileToBase64(file, setVideoURL);

  };

  const handlePdfChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    handleFileToBase64(file, setPdfUrl);

  };

  const handleExtraFiles = (e) => {

    const files = Array.from(e.target.files);

    files.forEach((file) => {

      handleFileToBase64(file, (base64) => {
        setExtraFiles((prev) => [...prev, base64]);
      });

    });

  };

  const handleSubjectChange = async (value) => {

    setSubjectId(value);
    setChapterId("");

    try {

      const res = await getChaptersBySubjectId(value);
      setChapters(res.Chapters || []);

    } catch {

      toast.error("Failed to load chapters");

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!title) {
      toast.error("Title required");
      return;
    }

    const payload = {

      Title: title,
      Description: description,

      VideoURL,
      Duration: Number(Duration),

      pdfUrl,
      extraFiles,

      classType,
      classOrder: Number(classOrder),

      duration: Number(duration),

      isFree,
      isLocked,

      ChapterId,
      SubjectId,

      Status,

    };

    try {

      let response;

      if (isEditMode) {
        response = await updateTopic(id, payload);
      } else {
        response = await addTopic(payload);
      }

      showResponseMessage(response);

      if (response.success) {

        setTimeout(() => {
          navigate("/admin/Topics");
        }, 2000);

      }

    } catch (err) {

      toast.error(err.message);

    }

  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className="pagetitle">
        {isEditMode ? "Edit Topic/Class" : "Create Topic/Class"}
      </div>

      <div className="form-800">

        <div className="white-bg">

          <form onSubmit={handleSubmit}>

            <table>

              <tbody>

                <tr>

                  <td>
                    <div className="formlabel">Title *</div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </td>

                  <td>

                    <div className="formlabel">Class Type</div>

                    <select
                      value={classType}
                      onChange={(e) => setClassType(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Video">Video</option>
                      <option value="PDF">PDF</option>
                      <option value="Assignment">Assignment</option>
                    </select>

                  </td>

                </tr>

                <tr>

                  <td colSpan="2">

                    <div className="formlabel">Description</div>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Subject</div>

                    <select
                      value={SubjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                    >

                      <option value="">Select Subject</option>

                      {subjects.map((s) => (

                        <option key={s._id} value={s._id}>
                          {s.Title}
                        </option>

                      ))}

                    </select>

                  </td>

                  <td>

                    <div className="formlabel">Chapter</div>

                    <select
                      value={ChapterId}
                      onChange={(e) => setChapterId(e.target.value)}
                    >

                      <option value="">Select Chapter</option>

                      {chapters.map((c) => (

                        <option key={c._id} value={c._id}>
                          {c.Title}
                        </option>

                      ))}

                    </select>

                  </td>

                </tr>

                <tr>

                  <td>
                    <div className="formlabel">Class Order</div>
                    <input
                      type="number"
                      value={classOrder}
                      onChange={(e) => setClassOrder(e.target.value)}
                    />
                  </td>

                  <td>
                    <div className="formlabel">Duration</div>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration2(e.target.value)}
                    />
                  </td>

                </tr>

                <tr>

                  <td>
                    <div className="formlabel">Video Upload</div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} />
                  </td>

                  <td>
                    <div className="formlabel">PDF Upload</div>
                    <input type="file" accept="application/pdf" onChange={handlePdfChange} />
                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Extra Files</div>

                    <input type="file" multiple onChange={handleExtraFiles} />

                  </td>

                </tr>

                <tr>

                  <td>

                    <label>
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                      />
                      Is Free
                    </label>

                  </td>

                  <td>

                    <label>
                      <input
                        type="checkbox"
                        checked={isLocked}
                        onChange={(e) => setIsLocked(e.target.checked)}
                      />
                      Is Locked
                    </label>

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Status</div>

                    <select
                      value={Status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                  </td>

                </tr>

                <tr>

                  <td>

                    <button type="submit" className="button">
                      {isEditMode ? "Update Topic" : "Add Topic"}
                    </button>

                    <button
                      type="button"
                      className="button cancel-button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>

                  </td>

                </tr>

              </tbody>

            </table>

          </form>

        </div>

      </div>

    </div>

  );

};

export default TopicForm;