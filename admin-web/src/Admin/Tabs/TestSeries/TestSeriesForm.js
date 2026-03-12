import React, { useEffect, useState, useRef } from "react";
import {
  createTestSeries,
  updateTestSeries,
  getTestSeriesById,
} from "../../../Services/AdminServices/AllServices/TestSeriesService";

import { getAllCategories } from "../../../Services/AdminServices/AllServices/CategoryService";

import "../../AdminStyle/AdminGlobalStyle.css";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { showResponseMessage } from "../../../Utils/showResponseMessage";

const TestSeriesForm = ({ isEditMode = false }) => {

  const navigate = useNavigate();
  const { id } = useParams();

  const isFetchedRef = useRef(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState("");
  const [previewSource, setPreviewSource] = useState("");

  const [status, setStatus] = useState("Active");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

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

          if (categoryRes.success) {
            setCategories(categoryRes.categories);
          }

          if (isEditMode && id) {

            const res = await getTestSeriesById(id);

            if (res?.success) {

              const t = res.TestSeries;

              setTitle(t.Title || "");
              setDescription(t.Description || "");
              setImage(t.Image || "");
              setPreviewSource(t.Image || "");

              setStatus(t.Status || "Active");
              setIsPaid(t.IsPaid || false);

              setCategory(t.CategoryId?._id || "");

              setPrice(t.Price || "");
              setDiscountPrice(t.DiscountPrice || "");
              setValidityDays(t.ValidityDays || "");

            }

          }

        } catch (err) {

          toast.error("Error loading TestSeries");

        } finally {

          setIsLoading(false);

        }

      };

      loadData();
      isFetchedRef.current = true;

    }

  }, [isEditMode, id]);

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

    navigate("/admin/TestSeries");

  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    const payload = {

      Title: title,
      Description: description,
      Image: image,
      Status: status,
      CategoryId: category,
      IsPaid: isPaid,

      Price: isPaid ? Number(price) : 0,
      DiscountPrice: isPaid ? Number(discountPrice) : 0,
      ValidityDays: isPaid ? Number(validityDays) : 0,

    };

    try {

      let response;

      if (isEditMode) {
        response = await updateTestSeries(id, payload);
      } else {
        response = await createTestSeries(payload);
      }

      showResponseMessage(response);

      if (response.success) {

        setTimeout(() => {

          navigate("/admin/TestSeries");

        }, 2000);

      }

    } catch (err) {

      toast.error(`Error submitting form: ${err.message}`);

    }

  };

  if (isLoading) return <div>Loading...</div>;

  return (

    <div>

      <div className="pagetitle">
        {isEditMode ? "Edit Test Series" : "Create Test Series"}
      </div>

      <div className="form-800">

        <div className="white-bg">

          <form onSubmit={handleSubmit}>

            <table>

              <tbody>

                {/* Category */}

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

                {/* Image */}

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

export default TestSeriesForm;