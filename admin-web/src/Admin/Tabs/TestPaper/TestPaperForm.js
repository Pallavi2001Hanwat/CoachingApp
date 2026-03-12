import React, { useEffect, useState, useRef } from "react";
import {
  createTestPaper,
  updateTestPaper,
  getTestPaperById,
} from "../../../Services/AdminServices/AllServices/TestPaperService";
import {
  getAllTestSeriess
} from "../../../Services/AdminServices/AllServices/TestSeriesService";

import { getAllCategories } from "../../../Services/AdminServices/AllServices/CategoryService";


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
  const [image, setImage] = useState("");
  const [previewSource, setPreviewSource] = useState("");
  const [status, setStatus] = useState("Active");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [testSeriesList, setTestSeriesList] = useState([]);
  const [filteredTestSeries, setFilteredTestSeries] = useState([]);
  const [testSeriesId, setTestSeriesId] = useState("");

  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");

  const [attemptLimit, setAttemptLimit] = useState("1");
  const [paperLevel, setPaperLevel] = useState("Easy");
  const [scheduledDate, setScheduledDate] = useState("");

  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [validityDays, setValidityDays] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!isFetchedRef.current) {
      const loadData = async () => {
        try {
          const categoryRes = await getAllCategories();
          if (categoryRes.success) setCategories(categoryRes.categories);

          const seriesRes = await getAllTestSeriess();
          if (seriesRes.success) setTestSeriesList(seriesRes.TestSeries);

          if (isEditMode && id) {
            const res = await getTestPaperById(id);
            if (res?.success) {
              const t = res.TestPaper;
              setTitle(t.PaperTitle || t.Title || "");
              setDescription(t.Description || "");
              setImage(t.Image || "");
              setPreviewSource(t.Image || "");

              setStatus(t.Status || "Active");
              setIsPaid(t.IsPaid || false);

              setCategory(t.CategoryId?._id || "");
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

              setPrice(t.Price || "");
              setDiscountPrice(t.DiscountPrice || "");
              setValidityDays(t.ValidityDays || "");
            }
          }
        } catch (err) {
          toast.error("Error loading TestPaper data");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
      isFetchedRef.current = true;
    }
  }, [isEditMode, id]);

  // ---------------- FILTER TEST SERIES ----------------
  useEffect(() => {
    if (category) {
      const filtered = testSeriesList.filter(
        (ts) => ts.CategoryId === category
      );
      setFilteredTestSeries(filtered);

      if (!filtered.find((ts) => ts._id === testSeriesId)) setTestSeriesId("");
    } else {
      setFilteredTestSeries([]);
      setTestSeriesId("");
    }
  }, [category, testSeriesList]);

  // ---------------- IMAGE ----------------
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource(reader.result);
        setImage(reader.result);
      };
    } else {
      toast.error("Please upload a valid image");
    }
  };

  // ---------------- CANCEL ----------------
  const handleCancel = () => {
    navigate("/admin/TestPapers");
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !testSeriesId) {
      toast.error("Title, Category, and Test Series are required");
      return;
    }

    const payload = {
      CategoryId: category,
      TestSeriesId: testSeriesId,
      PaperTitle: title,
      Description: description,
      Image: image,
      Status: status,
      IsPaid: isPaid,
      Price: isPaid ? Number(price) : 0,
      DiscountPrice: isPaid ? Number(discountPrice) : 0,
      ValidityDays: isPaid ? Number(validityDays) : 0,
      DurationInMinutes: Number(duration),
      TotalMarks: Number(totalMarks),
      PassingMarks: Number(passingMarks),
      TotalQuestions: Number(totalQuestions),
      AttemptLimit: attemptLimit === "Unlimited" ? "Unlimited" : Number(attemptLimit),
      PaperLevel: paperLevel,
      ScheduledDate: scheduledDate || null,
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
      toast.error(`Error submitting form: ${err.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="pagetitle">
        {isEditMode ? "Edit Test Paper" : "Create Test Paper"}
      </div>

      <div className="form-800">
        <div className="white-bg">
          <form onSubmit={handleSubmit}>
            <table>
              <tbody>
                {/* Category & Status */}
                <tr>
                  <td>
                    <div className="formlabel">Category</div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.CategoryName}
                        </option>
                      ))}
                    </select>
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
                      {filteredTestSeries.map((ts) => (
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
                    <div className="formlabel">Title</div>
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

                {/* Image & Is Paid */}
                <tr>
                  <td>
                    <div className="formlabel">Image</div>
                    <input type="file" onChange={handleFileInputChange} />
                    <div className="pt-2">
                      {(previewSource || image) && (
                        <img
                          src={previewSource || image}
                          alt="preview"
                          style={{ height: "150px" }}
                        />
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="formlabel">Is Paid</div>
                    <select
                      value={isPaid}
                      onChange={(e) => setIsPaid(e.target.value === "true")}
                    >
                      <option value="false">Free</option>
                      <option value="true">Paid</option>
                    </select>
                  </td>
                </tr>

                {/* Paid Fields */}
                {isPaid && (
                  <>
                    <tr>
                      <td>
                        <div className="formlabel">Price</div>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="formlabel">Discount Price</div>
                        <input
                          type="number"
                          value={discountPrice}
                          onChange={(e) => setDiscountPrice(e.target.value)}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className="formlabel">Validity Days</div>
                        <input
                          type="number"
                          value={validityDays}
                          onChange={(e) => setValidityDays(e.target.value)}
                        />
                      </td>
                    </tr>
                  </>
                )}

                {/* Exam Fields */}
                <tr>
                  <td>
                    <div className="formlabel">Duration (Minutes)</div>
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

                {/* Attempt Limit & Paper Level */}
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

                {/* Scheduled Date */}
                <tr>
                  <td>
                    <div className="formlabel">Scheduled Date</div>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
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
    </div>
  );
};

export default TestPaperForm;