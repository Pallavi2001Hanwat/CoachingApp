import React, { useEffect, useState, useRef } from "react";
import {
  createMonthlyCurrentAffair,
  updateMonthlyCurrentAffair,
  getMonthlyCurrentAffairById,
} from "../../../../Services/AdminServices/AllServices/MonthlyCurrentAffairService";

import "../../../AdminStyle/AdminGlobalStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../../Utils/showResponseMessage";

const MonthlyCurrentAffairForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    Month: "",
    PdfTitle: "",
    PdfUrl: "",
    Language: "English",
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

            const res = await getMonthlyCurrentAffairById(id);

            if (res?.success) {

              const data = res.MonthlyCurrentAffair;

              setFormData({
                Month: data.Month || "",
                PdfTitle: data.PdfTitle || "",
                PdfUrl: data.PdfUrl || "",
                Language: data.Language || "English",
                Status: data.Status || "Active"
              });

              // edit mode me manual title ko respect karo
              if (data.PdfTitle) {
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

  // -------- AUTO PDF TITLE --------
  useEffect(() => {

    if (formData.Month && formData.Language && !isTitleEdited) {

      setFormData(prev => ({
        ...prev,
        PdfTitle: `${prev.Month} (${prev.Language})`
      }));

    }

  }, [formData.Month, formData.Language, isTitleEdited]);

  // -------- INPUT CHANGE --------
  const handleInputChange = (e) => {

    const { name, value } = e.target;

    if (name === "PdfTitle") {
      setIsTitleEdited(true); // user manually edit kare
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

  // -------- SUBMIT --------
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.Month) {
      toast.error("Month is required");
      return;
    }

    try {

      let response;

      if (isEditMode) {
        response = await updateMonthlyCurrentAffair(id, formData);
      } else {
        response = await createMonthlyCurrentAffair(formData);
      }

      showResponseMessage(response);

      if (response.success) {
        setTimeout(() => {
          navigate("/admin/MonthlyCurrentAffair");
        }, 1500);
      }

    } catch (err) {
      toast.error(err.message);
    }

  };

  // -------- CANCEL --------
  const handleCancel = () => {
    navigate("/admin/MonthlyCurrentAffair");
  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className="pagetitle">
        {isEditMode ? "Edit Monthly Current Affair" : "Create Monthly Current Affair"}
      </div>

      <div className="form-800">
        <div className="white-bg">

          <form onSubmit={handleSubmit}>
            <table>
              <tbody>

                {/* Month + Language */}
                <tr>

                  <td>
                    <div className="formlabel">Month *</div>

                    <select
                      name="Month"
                      value={formData.Month}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Month</option>

                      {[
                        "January", "February", "March", "April",
                        "May", "June", "July", "August",
                        "September", "October", "November", "December"
                      ].map((month) => (
                        <option key={month} value={`${month} ${new Date().getFullYear()}`}>
                          {month} {new Date().getFullYear()}
                        </option>
                      ))}

                    </select>
                  </td>

                  <td>
                    <div className="formlabel">Language</div>
                    <select
                      name="Language"
                      value={formData.Language}
                      onChange={handleInputChange}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </td>

                </tr>

                {/* PDF Title */}
                <tr>

                  <td colSpan="2">
                    <div className="formlabel">PDF Title</div>
                    <input
                      name="PdfTitle"
                      value={formData.PdfTitle}
                      onChange={handleInputChange}
                    />
                  </td>

                </tr>

                {/* PDF Upload */}
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

  );

};

export default MonthlyCurrentAffairForm;