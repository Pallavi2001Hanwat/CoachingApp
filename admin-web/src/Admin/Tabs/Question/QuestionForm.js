import React, { useState, useEffect, useRef } from 'react';
import {
  createQuestionOption,
  updateQuestionOption,
  getQuestionOptionById,
  bulkUploadQuestions
} from '../../../Services/AdminServices/AllServices/QuestionWithOptionService';

import { getAllSubjects } from '../../../Services/AdminServices/AllServices/SubjectService';
import { getChaptersBySubjectId } from '../../../Services/AdminServices/AllServices/ChapterService';
import { getTopicsByChapterId } from '../../../Services/AdminServices/AllServices/TopicService';

import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const QuestionForm = ({ isEditMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isFetchedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  // ✅ BULK STATE
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  // 🔹 Subject → Chapter → Topic
  const [Subjects, setSubjects] = useState([]);
  const [Chapters, setChapters] = useState([]);
  const [Topics, setTopics] = useState([]);

  const [SubjectId, setSubjectId] = useState("");
  const [ChapterId, setChapterId] = useState("");
  const [TopicId, setTopicId] = useState("");

  // 🔹 Question fields
  const [QuestionText, setQuestionText] = useState("");
  const [QuestionImage, setQuestionImage] = useState("");
  const [previewSource, setPreviewSource] = useState("");

  const [QuestionType, setQuestionType] = useState("MCQ");
  const [DifficultyLevel, setDifficultyLevel] = useState("Easy");

  const [Marks, setMarks] = useState("1");
  const [NegativeMarks, setNegativeMarks] = useState("0");
  const [TimeAllowedInSeconds, setTimeAllowedInSeconds] = useState("60");

  const [Explanation, setExplanation] = useState("");
  const [Status, setStatus] = useState("Active");
  const [Tags, setTags] = useState("");

  const [Options, setOptions] = useState([]);

  // ---------------- LOAD SUBJECTS ----------------
  useEffect(() => {
    loadSubjects();

    if (isEditMode && id && !isFetchedRef.current) {
      loadQuestion(id);
      isFetchedRef.current = true;
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadSubjects = async () => {
    const res = await getAllSubjects();
    if (res?.success) setSubjects(res.Subjects);
  };

  // ---------------- SUBJECT → CHAPTER ----------------
  useEffect(() => {
    if (!SubjectId) return;

    setChapterId("");
    setTopicId("");

    getChaptersBySubjectId(SubjectId).then(res => {
      if (res?.success) setChapters(res.Chapters);
    });
  }, [SubjectId]);

  // ---------------- CHAPTER → TOPIC ----------------
  useEffect(() => {
    if (!ChapterId) return;

    setTopicId("");

    getTopicsByChapterId(ChapterId).then(res => {
      if (res?.success) setTopics(res.Topics);
    });
  }, [ChapterId]);

  // ---------------- LOAD QUESTION ----------------
  const loadQuestion = async (id) => {
    try {
      const res = await getQuestionOptionById(id);

      if (res?.success) {
        const q = res.questionwithoption.question;

        setQuestionText(q.QuestionText);
        setQuestionImage(q.QuestionImage);
        setPreviewSource(q.QuestionImage);

        setQuestionType(q.QuestionType);
        setDifficultyLevel(q.DifficultyLevel);
        setMarks(q.Marks);
        setNegativeMarks(q.NegativeMarks);
        setTimeAllowedInSeconds(q.TimeAllowedInSeconds);
        setExplanation(q.Explanation);
        setStatus(q.Status);
        setTags(q.Tags?.join(","));

        setSubjectId(q.SubjectId?._id);
        setChapterId(q.ChapterId?._id);
        setTopicId(q.TopicId?._id);

        setOptions(res.questionwithoption.options || []);
      }

    } catch {
      toast.error("Error loading question");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- BULK UPLOAD ----------------
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Select file");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const res = await bulkUploadQuestions(formData);
      showResponseMessage(res);

      if (res.success) {
        setBulkFile(null);
        navigate("/admin/Questions");
      }
    } catch {
      toast.error("Bulk upload failed");
    }
  };

  // ---------------- IMAGE ----------------
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setPreviewSource(reader.result);
      setQuestionImage(reader.result);
    };
  };

  // ---------------- OPTIONS ----------------
  const addOption = () => {
    setOptions([...Options, { OptionText: "", IsCorrect: false }]);
  };

  const updateOption = (index, key, value) => {
    const updated = [...Options];
    updated[index][key] = value;
    setOptions(updated);
  };

  const removeOption = (index) => {
    setOptions(Options.filter((_, i) => i !== index));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      QuestionText,
      QuestionImage,
      QuestionType,
      DifficultyLevel,
      Marks: Number(Marks),
      NegativeMarks: Number(NegativeMarks),
      TimeAllowedInSeconds: Number(TimeAllowedInSeconds),
      Explanation,
      Tags: Tags.split(","),
      Status,
      SubjectId,
      ChapterId,
      TopicId,
      Options
    };

    try {
      let res;

      if (isEditMode) {
        res = await updateQuestionOption(id, payload);
      } else {
        res = await createQuestionOption(payload);
      }

      showResponseMessage(res);

      if (res.success) navigate('/admin/Questions');

    } catch {
      toast.error("Error saving question");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-center position-relative mb-3">
        <div className="pagetitle">
          {isEditMode ? 'Edit Question' : 'Create Question'}
        </div>

        <button
          className="button"
          onClick={() => setShowBulkUpload(!showBulkUpload)}
        >
          Bulk Upload
        </button>
      </div>

      {/* BULK */}
      {showBulkUpload ? (
        <div className="form-800">
          <div className="white-bg">
            <h3>Bulk Upload</h3>

            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setBulkFile(e.target.files[0])}
            />

            <button className="button" onClick={handleBulkUpload}>
              Upload
            </button>
          </div>
        </div>
      ) : (

        <div className="form-800">
          <div className="white-bg">

            <form onSubmit={handleSubmit}>
              <table>
                <tbody>

                  {/* QUESTION */}
                  <tr>
                    <td colSpan="2">
                      <div className="formlabel">Question</div>
                      <textarea value={QuestionText} onChange={(e) => setQuestionText(e.target.value)} />
                    </td>
                  </tr>

                  {/* SUBJECT CHAIN */}
                  <tr>
                    <td>
                      <div className="formlabel">Subject</div>
                      <select value={SubjectId} onChange={(e) => setSubjectId(e.target.value)}>
                        <option value="">Select</option>
                        {Subjects.map(s => <option key={s._id} value={s._id}>{s.Title}</option>)}
                      </select>
                    </td>

                    <td>
                      <div className="formlabel">Chapter</div>
                      <select value={ChapterId} onChange={(e) => setChapterId(e.target.value)}>
                        <option value="">Select</option>
                        {Chapters.map(c => <option key={c._id} value={c._id}>{c.Title}</option>)}
                      </select>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="formlabel">Topic</div>
                      <select value={TopicId} onChange={(e) => setTopicId(e.target.value)}>
                        <option value="">Select</option>
                        {Topics.map(t => <option key={t._id} value={t._id}>{t.Title}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* OPTIONS */}
                  <tr>
                    <td colSpan="2">
                      <div className="formlabel">Options</div>

                      {Options.map((opt, i) => (
                        <div key={i}>
                          <input
                            value={opt.OptionText}
                            onChange={(e) => updateOption(i, "OptionText", e.target.value)}
                          />

                          <button type="button" onClick={() => removeOption(i)}>Delete</button>

                          <button
                            type="button"
                            onClick={() => updateOption(i, "IsCorrect", !opt.IsCorrect)}
                          >
                            {opt.IsCorrect ? "Correct" : "Mark Correct"}
                          </button>
                        </div>
                      ))}

                      <button type="button" onClick={addOption}>
                        + Add Option
                      </button>
                    </td>
                  </tr>

                  {/* SUBMIT */}
                  <tr>
                    <td>
                      <button type="submit" className="button">
                        {isEditMode ? 'Update' : 'Submit'}
                      </button>

                      <button
                        type="button"
                        className="button cancel-button"
                        onClick={() => navigate('/admin/Questions')}
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
      )}

    </div>
  );
};

export default QuestionForm;