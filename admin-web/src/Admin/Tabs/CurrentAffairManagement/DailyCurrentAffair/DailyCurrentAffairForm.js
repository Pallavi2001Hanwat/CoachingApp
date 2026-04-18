import React, { useEffect, useState, useRef } from "react";
import {
  createDailyCurrentAffair,
  updateDailyCurrentAffair,
  getDailyCurrentAffairById,
} from "../../../../Services/AdminServices/AllServices/DailyCurrentAffairService";

import "../../../AdminStyle/AdminGlobalStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../../Utils/showResponseMessage";

const DailyCurrentAffairForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    Date: "",
    Title: "",
    PdfUrl: "",
    VideoUrl: "",
    Status: "Active"
  });

  const [isTitleEdited, setIsTitleEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // -------- LOAD DATA --------
  useEffect(() => {

    if (!isFetchedRef.current) {

      const loadData = async () => {

        try {

          if (isEditMode && id) {

            const res = await getDailyCurrentAffairById(id);

            if (res?.success) {

              const data = res.DailyCurrentAffair;

              setFormData({
                Date: data.Date ? data.Date.split("T")[0] : "",
                Title: data.Title || "",
                PdfUrl: data.PdfUrl || "",
                VideoUrl: data.VideoUrl || "",
                Status: data.Status || "Active"
              });

              if (data.Title) {
                setIsTitleEdited(true);
              }

            }

          }

        } catch {
          toast.error("Error loading data");
        } finally {
          setIsLoading(false);
        }

      };

      loadData();
      isFetchedRef.current = true;

    }

  }, [isEditMode, id]);

  // -------- AUTO TITLE FROM DATE --------
  useEffect(() => {

    if (formData.Date && !isTitleEdited) {

      const dateObj = new Date(formData.Date);

      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = dateObj.toLocaleString("default", { month: "long" });
      const year = dateObj.getFullYear();

      const formattedTitle = `${day} ${month} ${year} | Current Affairs | Today | Daily Current Affairs | Current Affairs by Me`;

      setFormData(prev => ({
        ...prev,
        Title: formattedTitle
      }));

    }

  }, [formData.Date, isTitleEdited]);

  // -------- INPUT CHANGE --------
  const handleInputChange = (e) => {

    const { name, value } = e.target;

    if (name === "Title") {
      setIsTitleEdited(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  // -------- PDF UPLOAD --------
  const handlePDFUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {

      setFormData(prev => ({
        ...prev,
        PdfUrl: reader.result
      }));

    };

  };

  // -------- VIDEO UPLOAD --------
  const handleVideoUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {

      setFormData(prev => ({
        ...prev,
        VideoUrl: reader.result
      }));

    };

  };

  // -------- SUBMIT --------
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.Date || !formData.Title) {
      toast.error("Date and Title are required");
      return;
    }

    try {

      let response;

      if (isEditMode) {
        response = await updateDailyCurrentAffair(id, formData);
      } else {
        response = await createDailyCurrentAffair(formData);
      }

      showResponseMessage(response);

      if (response.success) {
        setTimeout(() => {
          navigate("/admin/DailyCurrentAffair");
        }, 1500);
      }

    } catch (err) {
      toast.error(err.message);
    }

  };

  // -------- CANCEL --------
  const handleCancel = () => {
    navigate("/admin/DailyCurrentAffair");
  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className="pagetitle">
        {isEditMode ? "Edit Current Affair" : "Create Current Affair"}
      </div>

      <div className="form-800">
        <div className="white-bg">
          <div className='input-form'>
            <form onSubmit={handleSubmit}>
              <table>
                <tbody>

                  {/* Date + Title */}
                  <tr>

                    <td>
                      <div className="formlabel">Date *</div>
                      <input
                        type="date"
                        name="Date"
                        value={formData.Date}
                        onChange={handleInputChange}
                      />
                    </td>

                    <td>
                      <div className="formlabel">Title *</div>
                      <input
                        name="Title"
                        type="text"
                        value={formData.Title}
                        onChange={handleInputChange}
                      />
                    </td>

                  </tr>

                  {/* PDF + VIDEO */}
                  <tr>

                    <td>
                      <div className="formlabel">Upload PDF</div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFUpload}
                      />
                    </td>

                    <td>
                      <div className="formlabel">Upload Video</div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                      />
                    </td>

                  </tr>

                  {/* Status */}
                  <tr>

                    <td>
                      <div className="formlabel">Status</div>
                      <select
                        name="Status"
                        value={formData.Status}
                        onChange={handleInputChange}
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

      </div>

    </div>

  );

};

export default DailyCurrentAffairForm;