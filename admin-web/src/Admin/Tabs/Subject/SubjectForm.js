import React, { useState, useEffect, useRef } from 'react';
import { addSubject, updateSubject, getSubjectById } from '../../../Services/AdminServices/AllServices/SubjectService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const SubjectForm = ({ isEditMode = false }) => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [image, setImage] = useState('');
    const [status, setStatus] = useState('Active');

    const [previewSource, setPreviewSource] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);


    // Load Subject Data
    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadSubject = async () => {

                try {

                    const response = await getSubjectById(id);

                    if (!response.Subject) return;

                    const Subject = response.Subject;

                    setTitle(Subject.Title || '');
                    setDescription(Subject.Description || '');
                    setSubjectCode(Subject.SubjectCode || '');
                    setImage(Subject.Image || '');
                    setStatus(Subject.Status || 'Active');

                } catch (err) {

                    toast.error(`Error fetching Subject: ${err.message}`);

                } finally {

                    setIsLoading(false);

                }

            };

            if (isEditMode && id) {
                loadSubject();
            } else {
                setIsLoading(false);
            }

            isFetchedRef.current = true;

        }

    }, [isEditMode, id]);


    const handleCancel = () => {
        navigate('/admin/Subjects');
    };


    // Image Upload
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

            toast.error('Please upload a valid image file.');

        }

    };


    // Submit Form
    const handleSubmit = async (e) => {

        e.preventDefault();

        const payload = {
            Title: title,
            Description: description,
            SubjectCode: subjectCode,
            Image: image,
            Status: status
        };

        try {

            let response;

            if (isEditMode) {
                response = await updateSubject(id, payload);
            } else {
                response = await addSubject(payload);
            }

            showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/Subjects');
                }, 2000);

            }

        } catch (err) {

            toast.error(`Error submitting form: ${err.message}`);

        }

    };


    if (isLoading) return <div>Loading...</div>;


    return (

        <div>

            <div className='pagetitle'>
                {isEditMode ? 'Edit Subject' : 'Create Subject'}
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <form onSubmit={handleSubmit}>

                        <table>

                            <tbody>

                                <tr>

                                    <td>

                                        <div className="formlabel">Title</div>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Subject Code</div>

                                        <input
                                            type="text"
                                            value={subjectCode}
                                            onChange={(e) => setSubjectCode(e.target.value)}
                                            required
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td colSpan="2">

                                        <div className="formlabel">Description</div>

                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="formlabel">Image</div>

                                        <input
                                            type="file"
                                            onChange={handleFileInputChange}
                                        />

                                        <div className="pt-2">

                                            {(previewSource || image) && (

                                                <img
                                                    src={previewSource || image}
                                                    alt="Subject"
                                                    style={{ height: '150px' }}
                                                />

                                            )}

                                        </div>

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

export default SubjectForm;