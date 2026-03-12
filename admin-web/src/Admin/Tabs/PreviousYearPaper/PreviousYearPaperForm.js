import React, { useState, useEffect, useRef } from 'react';
import {
  addPreviousYearPaper,
  updatePreviousYearPaper,
  getPreviousYearPaperById
} from '../../../Services/AdminServices/AllServices/PreviousYearPaperService';

import { getAllPreviousYearPaperCategorys } from '../../../Services/AdminServices/AllServices/PreviousYearPaperCategoryService';

import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const PreviousYearPaperForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();
  const isFetchedRef = useRef(false);

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    PYPCategoryId: '',
    PaperTitle: '',
    PaperCode: '',
    Year: '',
    Stage: '',
    Shift: '',
    Language: '',
    TotalQuestions: '',
    TotalMarks: '',
    TimeDuration: '',
    PaperFileUrl: '',
    Status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (!isFetchedRef.current) {

      const loadData = async () => {

        try {

          const catRes = await getAllPreviousYearPaperCategorys();
          console.log("Categories fetched:", catRes);
          setCategories(catRes.Categories || []);

          if (isEditMode && id) {

            const res = await getPreviousYearPaperById(id);

            if (!res.Paper) return;

            const p = res.Paper;

            setFormData({
              PYPCategoryId: p.PYPCategoryId || '',
              PaperTitle: p.PaperTitle || '',
              PaperCode: p.PaperCode || '',
              Year: p.Year || '',
              Stage: p.Stage || '',
              Shift: p.Shift || '',
              Language: p.Language || '',
              TotalQuestions: p.TotalQuestions || '',
              TotalMarks: p.TotalMarks || '',
              TimeDuration: p.TimeDuration || '',
              PaperFileUrl: p.PaperFileUrl || '',
              Status: p.Status || 'Active'
            });

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

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

  };

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
        PaperFileUrl: reader.result
      }));

    };

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.PYPCategoryId || !formData.PaperTitle || !formData.PaperCode || !formData.Year || !formData.PaperFileUrl) {

      toast.error("Please fill required fields");
      return;

    }

    const payload = {
      ...formData,
      Year: Number(formData.Year),
      TotalQuestions: Number(formData.TotalQuestions) || 0,
      TotalMarks: Number(formData.TotalMarks) || 0,
      TimeDuration: Number(formData.TimeDuration) || 0
    };

    try {

      let response;

      if (isEditMode) {
        response = await updatePreviousYearPaper(id, payload);
      } else {
        response = await addPreviousYearPaper(payload);
      }

      showResponseMessage(response);

      if (response.success) {

        setTimeout(() => {
          navigate('/admin/PreviousYearPapers');
        }, 2000);

      }

    } catch (err) {

      toast.error(err.message);

    }

  };

  const handleCancel = () => {
    navigate('/admin/PreviousYearPapers');
  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className='pagetitle'>
        {isEditMode ? 'Edit Previous Year Paper' : 'Create Previous Year Paper'}
      </div>

      <div className="form-800">

        <div className="white-bg">

          <form onSubmit={handleSubmit}>

            <table>

              <tbody>

                <tr>

                  <td>

                    <div className="formlabel">Category *</div>

                    <select
                      name="PYPCategoryId"
                      value={formData.PYPCategoryId}
                      onChange={handleInputChange}
                    >

                      <option value="">Select Category</option>

                      {categories.map((cat) => (

                        <option key={cat._id} value={cat._id}>
                          {cat.Title}
                        </option>

                      ))}

                    </select>

                  </td>

                  <td>

                    <div className="formlabel">Paper Title *</div>

                    <input
                      name="PaperTitle"
                      value={formData.PaperTitle}
                      onChange={handleInputChange}
                      required
                    />

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Paper Code *</div>

                    <input
                      name="PaperCode"
                      value={formData.PaperCode}
                      onChange={handleInputChange}
                    />

                  </td>

                  <td>

                    <div className="formlabel">Year *</div>

                    <input
                      type="number"
                      name="Year"
                      value={formData.Year}
                      onChange={handleInputChange}
                    />

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Stage</div>

                    <input
                      name="Stage"
                      value={formData.Stage}
                      onChange={handleInputChange}
                    />

                  </td>

                  <td>

                    <div className="formlabel">Shift</div>

                    <input
                      name="Shift"
                      value={formData.Shift}
                      onChange={handleInputChange}
                    />

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Language</div>

                    <input
                      name="Language"
                      value={formData.Language}
                      onChange={handleInputChange}
                    />

                  </td>

                  <td>

                    <div className="formlabel">Total Questions</div>

                    <input
                      type="number"
                      name="TotalQuestions"
                      value={formData.TotalQuestions}
                      onChange={handleInputChange}
                    />

                  </td>

                </tr>

                <tr>

                  <td>

                    <div className="formlabel">Total Marks</div>

                    <input
                      type="number"
                      name="TotalMarks"
                      value={formData.TotalMarks}
                      onChange={handleInputChange}
                    />

                  </td>

                  <td>

                    <div className="formlabel">Time Duration (minutes)</div>

                    <input
                      type="number"
                      name="TimeDuration"
                      value={formData.TimeDuration}
                      onChange={handleInputChange}
                    />

                  </td>

                </tr>

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

                <tr>

                  <td>

                    <button type="submit" className="button">
                      {isEditMode ? 'Update Paper' : 'Add Paper'}
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

export default PreviousYearPaperForm;