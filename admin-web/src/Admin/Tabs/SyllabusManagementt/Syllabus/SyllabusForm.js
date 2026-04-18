import React, { useState, useEffect, useRef } from 'react';
import {
  createSyllabus,
  updateSyllabus,
  getSyllabusById
} from '../.../../../../../Services/AdminServices/AllServices/SyllabusService';

import { getAllSyllabusCategorys } from '../.../../../../../Services/AdminServices/AllServices/SyllabusCategoryService';

import '../../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../../Utils/showResponseMessage';

const SyllabusForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    SyllabusCategoryId: '',
    PdfUrl: '',
    Status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(true);

  // -------- LOAD DATA --------
  useEffect(() => {

    if (!isFetchedRef.current) {

      const loadData = async () => {

        try {

          const catRes = await getAllSyllabusCategorys();
          setCategories(catRes.SyllabusCategories || []);

          if (isEditMode && id) {

            const res = await getSyllabusById(id);

            if (!res?.Syllabus) return;

            const s = res.Syllabus;

            setFormData({
              Title: s.Title || '',
              Description: s.Description || '',
              SyllabusCategoryId: s.SyllabusCategoryId?._id || '',
              PdfUrl: s.PdfUrl || '',
              Status: s.Status || 'Active'
            });

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

  // -------- INPUT CHANGE --------
  const handleInputChange = (e) => {

    const { name, value } = e.target;

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

    if (!formData.Title || !formData.SyllabusCategoryId || !formData.PdfUrl) {
      toast.error("Please fill required fields");
      return;
    }

    try {

      let response;

      if (isEditMode) {
        response = await updateSyllabus(id, formData);
      } else {
        response = await createSyllabus(formData);
      }

      showResponseMessage(response);

      if (response.success) {
        setTimeout(() => {
          navigate('/admin/Syllabus');
        }, 1500);
      }

    } catch (err) {
      toast.error(err.message);
    }

  };

  const handleCancel = () => {
    navigate('/admin/Syllabus');
  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className='pagetitle'>
        {isEditMode ? 'Edit Syllabus' : 'Create Syllabus'}
      </div>

      <div className="form-800">

        <div className="white-bg">

          <form onSubmit={handleSubmit}>

            <table>
              <tbody>

                {/* Category + Title */}
                <tr>

                  <td>
                    <div className="formlabel">Category *</div>
                    <select
                      name="SyllabusCategoryId"
                      value={formData.SyllabusCategoryId}
                      onChange={handleInputChange}
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
                    <div className="formlabel">Title *</div>
                    <input
                      name="Title"
                      value={formData.Title}
                      onChange={handleInputChange}
                    />
                  </td>

                </tr>

                {/* Description */}
                <tr>
                  <td colSpan="2">
                    <div className="formlabel">Description</div>
                    <textarea
                      name="Description"
                      value={formData.Description}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>

                {/* PDF + Status */}
                <tr>

                  <td>
                    <div className="formlabel">Upload PDF *</div>
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
                      {isEditMode ? 'Update' : 'Submit'}
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

export default SyllabusForm;