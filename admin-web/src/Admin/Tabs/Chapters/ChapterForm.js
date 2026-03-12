import React, { useState, useEffect, useRef } from 'react';
import { addChapter, updateChapter, getChapterById } from '../../../Services/AdminServices/AllServices/ChapterService';
import { getAllSubjects } from '../../../Services/AdminServices/AllServices/SubjectService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const ChapterForm = ({ isEditMode = false }) => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState([]);

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

                    // load subjects
                    const subjectRes = await getAllSubjects();
                    setSubjects(subjectRes.Subjects || []);

                    // load chapter if edit
                    if (isEditMode && id) {

                        const response = await getChapterById(id);
                        console.log('getChapterById response:', response);

                        if (!response.Chapter) return;

                        const chapter = response.Chapter;

                        setTitle(chapter.Title || '');
                        setDescription(chapter.Description || '');

                        // ✅ FIX HERE
                        setSubjectId(chapter.SubjectId?._id || '');

                        setImage(chapter.Image || '');
                        setPreviewSource(chapter.Image || '');
                        setStatus(chapter.Status || 'Active');

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
        navigate('/admin/Chapters');
    };


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

        if (!title || !subjectId) {
            toast.error("Please fill required fields");
            return;
        }

        const payload = {
            Title: title,
            Description: description,
            SubjectId: subjectId,
            Image: image,
            Status: status
        };

        try {

            let response;

            if (isEditMode) {
                response = await updateChapter(id, payload);
            } else {
                response = await addChapter(payload);
            }

            console.log('API Response:', response);

            showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/Chapters');
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
                {isEditMode ? 'Edit Chapter' : 'Create Chapter'}
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <form onSubmit={handleSubmit}>

                        <table>

                            <tbody>

                                <tr>

                                    <td>
                                        <div className="formlabel">Chapter Title *</div>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Subject *</div>

                                        <select
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                            required
                                        >

                                            <option value="">Select Subject</option>

                                            {subjects.map((s) => (

                                                <option key={s._id} value={s._id}>
                                                    {s.Title}
                                                </option>

                                            ))}

                                        </select>

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

                                        <div className="formlabel">Chapter Image</div>

                                        <input
                                            type="file"
                                            onChange={handleFileInputChange}
                                        />

                                        <div className='pt-2'>

                                            {(previewSource || image) && (

                                                <img
                                                    src={previewSource || image}
                                                    alt="Chapter"
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

                                        <button type="submit" className="button">
                                            {isEditMode ? 'Update Chapter' : 'Add Chapter'}
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

export default ChapterForm;