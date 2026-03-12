import React, { useState, useEffect, useRef } from 'react';
import { addCategory, updateCategory, getCategoryById } from '../../../Services/AdminServices/AllServices/CategoryService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const CategoryForm = ({ isEditMode = false }) => {

    const [previewSource, setPreviewSource] = useState('');

    const [formData, setFormData] = useState({
        CategoryName: '',
        CategoryCode: '',
        Description: '',
        Image: '',
        CreatedBy: '',
        createdDate: '',
        updatedDate: '',
        Status: 'Active'
    });

    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);

    // Load Category
    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadCategory = async () => {

                try {
debugger
                    const response = await getCategoryById(id);
console.log('Fetched category:', response);
                 //  showResponseMessage(response.message);

                    if (!response.category) return;

                    const category = response.category;

                    setFormData({
                        CategoryName: category.CategoryName || '',
                        CategoryCode: category.CategoryCode || '',
                        Description: category.Description || '',
                        Image: category.Image || '',
                        CreatedBy: category.CreatedBy || '',
                        createdDate: category.createdDate || '',
                        updatedDate: category.updatedDate || '',
                        Status: category.Status || 'Active'
                    });

                } catch (err) {

                    toast.error(`Error fetching category: ${err.message}`);

                } finally {

                    setIsLoading(false);

                }

            };

            if (isEditMode && id) {
                loadCategory();
            } else {
                setIsLoading(false);
            }

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



    const handleCancel = () => {
        navigate('/admin/Category');
    };



    const handleFileInputChange = (e) => {

        const file = e.target.files[0];

        if (file && file.type.startsWith('image/')) {

            previewFile(file);

        } else {

            toast.error('Please upload a valid image file.');

        }
    };



    const previewFile = (file) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = () => {

            setPreviewSource(reader.result);

            setFormData((prevData) => ({
                ...prevData,
                Image: reader.result
            }));

        };
    };



    const handleSubmitFile = async (e) => {

        e.preventDefault();

        try {

            let response;

            if (isEditMode) {
                response = await updateCategory(id, formData);
                console.log('Update response:', response.message);
            } else {
                response = await addCategory(formData);
            }

           showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/Category');
                }, 2000);

            }

        } catch (err) {

            if (err.response) {

                showResponseMessage(err.response);

            } else {

                toast.error(`Error submitting form: ${err.message}`);

            }

        }
    };


    if (isLoading) return <div>Loading...</div>;


    return (

        <div>

            <div className='pagetitle'>
                {isEditMode ? 'Edit Category' : 'Create Category'}
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <div className='input-form'>

                        <form onSubmit={handleSubmitFile}>

                            <table>

                                <tbody>

                                    <tr>

                                        <td>

                                            <div className="formlabel">Category Name</div>

                                            <input
                                                type="text"
                                                name="CategoryName"
                                                value={formData.CategoryName}
                                                onChange={handleInputChange}
                                                required
                                            />

                                        </td>

                                        <td>

                                            <div className="formlabel">Category Code</div>

                                            <input
                                                type="text"
                                                name="CategoryCode"
                                                value={formData.CategoryCode}
                                                onChange={handleInputChange}
                                                required
                                            />

                                        </td>

                                    </tr>


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


                                    <tr>

                                        <td>

                                            <div className="formlabel">Image</div>

                                            <input
                                                type="file"
                                                name="Image"
                                                onChange={handleFileInputChange}
                                                required={!isEditMode}
                                            />

                                            <div className='pt-2'>

                                                {(previewSource || (isEditMode && formData.Image)) && (

                                                    <img
                                                        src={previewSource || formData.Image}
                                                        alt="Selected"
                                                        style={{ height: '180px' }}
                                                    />

                                                )}

                                            </div>

                                        </td>


                                        {isEditMode && (

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

                                        )}

                                    </tr>


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

        </div>

    );
};

export default CategoryForm;