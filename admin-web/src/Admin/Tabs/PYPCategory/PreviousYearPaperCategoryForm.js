import React, { useState, useEffect, useRef } from 'react';
import {
    addPreviousYearPaperCategory,
    updatePreviousYearPaperCategory,
    getPreviousYearPaperCategoryById
} from '../../../Services/AdminServices/AllServices/PreviousYearPaperCategoryService';

import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const PreviousYearPaperCategoryForm = ({ isEditMode = false }) => {

    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [previewSource, setPreviewSource] = useState('');
    const [status, setStatus] = useState('Active');

    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadData = async () => {

                try {

                    if (isEditMode && id) {

                        const response = await getPreviousYearPaperCategoryById(id);

                        if (!response.Category) return;

                        const cat = response.Category;

                        setTitle(cat.Title || '');
                        setImage(cat.Image || '');
                        setPreviewSource(cat.Image || '');
                        setStatus(cat.Status || 'Active');

                    }

                } catch (err) {

                    toast.error(`Error loading data: ${err.message}`);

                } finally {

                    setIsLoading(false);

                }

            };

            loadData();
            isFetchedRef.current = true;

        }

    }, [isEditMode, id]);

    const handleCancel = () => {
        navigate('/admin/PreviousYearPaperCategorys');
    };

    // ✅ Image Upload
    const handleFileInputChange = (e) => {

        const file = e.target.files[0];

        if (file && file.type.startsWith('image/')) {

            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onloadend = () => {

                setPreviewSource(reader.result);
                setImage(reader.result);

            };

        } else {

            toast.error('Please upload a valid image');

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title || !image) {

            toast.error("Title and Image are required");
            return;

        }

        const payload = {

            Title: title,
            Image: image,
            Status: status

        };

        try {

            let response;

            if (isEditMode) {
                response = await updatePreviousYearPaperCategory(id, payload);
            } else {
                response = await addPreviousYearPaperCategory(payload);
            }

            showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/PreviousYearPaperCategorys');
                }, 2000);

            }

        } catch (err) {

            toast.error(err.message);

        }

    };

    if (isLoading) return <div>Loading...</div>;

    return (

        <div>

            <div className='pagetitle'>
                {isEditMode ? 'Edit PYP Category' : 'Create PYP Category'}
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <form onSubmit={handleSubmit}>

                        <table>

                            <tbody>

                                <tr>

                                    <td>

                                        <div className="formlabel">Category Title *</div>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        <div className="formlabel">Category Image *</div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInputChange}
                                        />

                                        <div className='pt-2'>

                                            {(previewSource || image) && (

                                                <img
                                                    src={previewSource || image}
                                                    alt="Category"
                                                    style={{
                                                        height: '180px',
                                                        borderRadius: '8px',
                                                        objectFit: 'cover'
                                                    }}
                                                />

                                            )}

                                        </div>

                                    </td>

                                </tr>

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

                                <tr>

                                    <td>

                                        <button type="submit" className="button">
                                            {isEditMode ? 'Update Category' : 'Add Category'}
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

export default PreviousYearPaperCategoryForm;