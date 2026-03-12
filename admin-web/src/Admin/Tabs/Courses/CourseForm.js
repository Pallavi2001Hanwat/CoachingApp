import React, { useState, useEffect, useRef } from 'react';
import { addCourse, updateCourse, getCourseById } from '../../../Services/AdminServices/AllServices/CourseService';
import { getAllCategories } from '../../../Services/AdminServices/AllServices/CategoryService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const CourseForm = ({ isEditMode = false }) => {

    const [previewSource, setPreviewSource] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [level, setLevel] = useState('Beginner');
    const [price, setPrice] = useState('');
    const [isPaid, setIsPaid] = useState(true);
    const [discount, setDiscount] = useState('');
    const [language, setLanguage] = useState('');
    const [image, setImage] = useState('');
    const [startingDate, setStartingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [status, setStatus] = useState('Draft');

    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadData = async () => {

                try {

                    const categoryRes = await getAllCategories();
                    setCategories(categoryRes.categories || []);

                    if (isEditMode && id) {

                        const response = await getCourseById(id);

                        if (!response.course) return;

                        const course = response.course;
                        console.log('Fetched course:', response.course);

                        setTitle(course.Title || '');
                        setDescription(course.Description || '');
                        setCategory(course.Category || '');
                        setLevel(course.Level || 'Beginner');
                        setPrice(course.Price || '');
                        setIsPaid(course.IsPaid ?? true);
                        setDiscount(course.Discount || '');
                        setLanguage(course.Language || '');
                        setImage(course.Image || '');
                        setStartingDate(course.StartingDate || '');
                        setExpiryDate(course.ExpiryDate || '');
                        setStatus(course.Status || 'Draft');

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
        navigate('/admin/Course');
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

        const payload = {
            title,
            description,
            category,
            level,
            price,
            isPaid,
            discount,
            language,
            image,
            startingDate,
            expiryDate,
            status
        };

        try {

            let response;

            if (isEditMode) {
                response = await updateCourse(id, payload);
            } else {
                response = await addCourse(payload);
            }

            showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/Course');
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
                {isEditMode ? 'Edit Course' : 'Create Course'}
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
                                        <div className="formlabel">Category</div>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>

                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.CategoryName}
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
                                        <div className="formlabel">Level</div>

                                        <select
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>

                                    </td>

                                    <td>
                                        <div className="formlabel">Language</div>

                                        <input
                                            type="text"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        />

                                    </td>

                                </tr>


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

                                        <div>

                                            <input
                                                type="checkbox"
                                                checked={isPaid}
                                                onChange={(e) => setIsPaid(e.target.checked)}
                                            />

                                            <span className="formlabel pl-2">Paid Course</span>

                                        </div>

                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        <div className="formlabel">Discount (%)</div>

                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Status</div>

                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>

                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        <div className="formlabel">Starting Date</div>

                                        <input
                                            type="date"
                                            value={startingDate}
                                            onChange={(e) => setStartingDate(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Expiry Date</div>

                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="formlabel">Course Image</div>

                                        <input
                                            type="file"
                                            onChange={handleFileInputChange}
                                        />

                                        <div className='pt-2'>

                                            {(previewSource || image) && (

                                                <img
                                                    src={previewSource || image}
                                                    alt="course"
                                                    style={{ height: '180px' }}
                                                />

                                            )}

                                        </div>

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

export default CourseForm;