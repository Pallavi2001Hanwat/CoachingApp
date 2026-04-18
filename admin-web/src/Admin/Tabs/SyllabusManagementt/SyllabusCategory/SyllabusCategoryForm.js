import React, { useEffect, useState, useRef } from "react";
import {
  createSyllabusCategory,
  updateSyllabusCategory,
  getSyllabusCategoryById,
} from "../../../../Services/AdminServices/AllServices/SyllabusCategoryService";

import "../../../AdminStyle/AdminGlobalStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../../Utils/showResponseMessage";

const SyllabusCategoryForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [isLoading, setIsLoading] = useState(true);

  // -------- LOAD DATA --------
  useEffect(() => {

    if (!isFetchedRef.current) {

      const loadData = async () => {
        try {
          if (isEditMode && id) {

            const res = await getSyllabusCategoryById(id);

            if (res?.success) {

              const data = res.SyllabusCategory;

              setCategoryName(data.CategoryName || "");
              setDescription(data.Description || "");
              setStatus(data.Status || "Active");

            }
          }
        } catch (err) {
          toast.error("Error loading Category");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
      isFetchedRef.current = true;
    }

  }, [isEditMode, id]);

  // -------- CANCEL --------
  const handleCancel = () => {
    navigate("/admin/SyllabusCategory");
  };

  // -------- SUBMIT --------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      CategoryName: categoryName,
      Description: description,
      Status: status,
    };

    try {
      let response;

      if (isEditMode) {
        response = await updateSyllabusCategory(id, payload);
      } else {
        response = await createSyllabusCategory(payload);
      }

      showResponseMessage(response);

      if (response.success) {
        setTimeout(() => {
          navigate("/admin/SyllabusCategory");
        }, 1500);
      }

    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>

      <div className="pagetitle">
        {isEditMode ? "Edit Category" : "Create Category"}
      </div>

      <div className="form-800">
        <div className="white-bg">

          <form onSubmit={handleSubmit}>
            <table>
              <tbody>

                {/* Category Name */}
                <tr>
                  <td colSpan="2">
                    <div className="formlabel">Category Name</div>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
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

                {/* Status */}
                <tr>
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

    </div>
  );
};

export default SyllabusCategoryForm;