import React, { useEffect, useState, useRef } from "react";
import {
  createTestPaper,
  updateTestPaper,
  getTestPaperById,
  bulkCreateTestPapers
} from "../../../Services/AdminServices/AllServices/TestPaperService";
import {
  getAllTestSeriess
} from "../../../Services/AdminServices/AllServices/TestSeriesService";

import "../../AdminStyle/AdminGlobalStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../Utils/showResponseMessage";

const TestPaperForm = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  // ---------------- STATE ----------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [testSeriesList, setTestSeriesList] = useState([]);
  const [testSeriesId, setTestSeriesId] = useState("");

  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");

  const [attemptLimit, setAttemptLimit] = useState("1");
  const [paperLevel, setPaperLevel] = useState("Easy");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState("Active");

  const [isLoading, setIsLoading] = useState(true);

  // ---------------- BULK STATE ----------------
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkTestSeriesId, setBulkTestSeriesId] = useState("");

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!isFetchedRef.current) {
      const loadData = async () => {
        try {
          const seriesRes = await getAllTestSeriess();
          if (seriesRes.success) setTestSeriesList(seriesRes.TestSeries);

          if (isEditMode && id) {
            const res = await getTestPaperById(id);
            if (res?.success) {
              const t = res.TestPaper;

              setTitle(t.PaperTitle || "");
              setDescription(t.Description || "");
              setTestSeriesId(t.TestSeriesId?._id || "");

              setDuration(t.DurationInMinutes || "");
              setTotalMarks(t.TotalMarks || "");
              setPassingMarks(t.PassingMarks || "");
              setTotalQuestions(t.TotalQuestions || "");

              setAttemptLimit(t.AttemptLimit || "1");
              setPaperLevel(t.PaperLevel || "Easy");

              setScheduledDate(
                t.ScheduledDate ? t.ScheduledDate.split("T")[0] : ""
              );

              setStatus(t.Status || "Active");
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

  // ---------------- BULK UPLOAD ----------------
  const handleBulkUpload = async () => {
    if (!bulkTestSeriesId || !bulkFile) {
      toast.error("Select Test Series & file");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const res = await bulkCreateTestPapers(bulkTestSeriesId, formData);
      showResponseMessage(res);

      if (res.success) {
        setBulkFile(null);
        setBulkTestSeriesId("");
        navigate("/admin/TestPapers");
      }
    } catch {
      toast.error("Bulk upload failed");
    }
  };

  // ---------------- CANCEL ----------------
  const handleCancel = () => {
    navigate("/admin/TestPapers");
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !testSeriesId) {
      toast.error("Title & Test Series are required");
      return;
    }

    const payload = {
      TestSeriesId: testSeriesId,
      PaperTitle: title,
      Description: description,
      DurationInMinutes: Number(duration),
      TotalMarks: Number(totalMarks),
      PassingMarks: Number(passingMarks),
      TotalQuestions: Number(totalQuestions),
      AttemptLimit:
        attemptLimit === "Unlimited"
          ? "Unlimited"
          : Number(attemptLimit),
      PaperLevel: paperLevel,
      ScheduledDate: scheduledDate || null,
      Status: status,
    };

    try {
      let response;
      if (isEditMode) {
        response = await updateTestPaper(id, payload);
      } else {
        response = await createTestPaper(payload);
      }

      showResponseMessage(response);

      if (response.success) {
        setTimeout(() => {
          navigate("/admin/TestPapers");
        }, 1500);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>

      {/* HEADER */}
      <div >
        <div className="pagetitle text-center">
          {isEditMode ? "Edit Test Paper" : "Create Test Paper"}
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
          <div className="white-bg mt-2">
            <h3>Bulk Upload</h3>

            <select
              value={bulkTestSeriesId}
              onChange={(e) => setBulkTestSeriesId(e.target.value)}
            >
              <option value="">Select Test Series</option>
              {testSeriesList.map((ts) => (
                <option key={ts._id} value={ts._id}>
                  {ts.Title}
                </option>
              ))}
            </select>

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

                  {/* Test Series */}
                  <tr>
                    <td colSpan="2">
                      <div className="formlabel">Test Series</div>
                      <select
                        value={testSeriesId}
                        onChange={(e) => setTestSeriesId(e.target.value)}
                        required
                      >
                        <option value="">Select Test Series</option>
                        {testSeriesList.map((ts) => (
                          <option key={ts._id} value={ts._id}>
                            {ts.Title}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* Title */}
                  <tr>
                    <td colSpan="2">
                      <div className="formlabel">Paper Title</div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </td>
                  </tr>

                  {/* Description */}
                  <tr>
                    <td colSpan="2">
                      <div className="formlabel">Description</div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </td>
                  </tr>

                  {/* Duration & Marks */}
                  <tr>
                    <td>
                      <div className="formlabel">Duration</div>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="formlabel">Total Marks</div>
                      <input
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                      />
                    </td>
                  </tr>

                  {/* Passing & Questions */}
                  <tr>
                    <td>
                      <div className="formlabel">Passing Marks</div>
                      <input
                        type="number"
                        value={passingMarks}
                        onChange={(e) => setPassingMarks(e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="formlabel">Total Questions</div>
                      <input
                        type="number"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(e.target.value)}
                      />
                    </td>
                  </tr>

                  {/* Attempt & Level */}
                  <tr>
                    <td>
                      <div className="formlabel">Attempt Limit</div>
                      <select
                        value={attemptLimit}
                        onChange={(e) => setAttemptLimit(e.target.value)}
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </td>
                    <td>
                      <div className="formlabel">Paper Level</div>
                      <select
                        value={paperLevel}
                        onChange={(e) => setPaperLevel(e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </td>
                  </tr>

                  {/* Date & Status */}
                  <tr>
                    <td>
                      <div className="formlabel">Scheduled Date</div>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="formlabel">Status</div>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>

                  {/* Buttons */}
                  <tr>
                    <td>
                      <button type="submit" className="button">
                        {isEditMode ? "Update" : "Submit"}
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
      )}

    </div>
  );
};

export default TestPaperForm;