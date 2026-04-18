import React, { useState, useEffect, useRef } from 'react';
import { addCourse, updateCourse, getCourseById } from '../../../Services/AdminServices/AllServices/CourseService';
import { getAllCategories } from '../../../Services/AdminServices/AllServices/CategoryService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showResponseMessage } from '../../../Utils/showResponseMessage';

const CourseForm = ({ isEditMode = false }) => {

    const [previewSource, setPreviewSource] = useState('');

    const [Title, setTitle] = useState('');
    const [Description, setDescription] = useState('');
    const [Category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [Level, setLevel] = useState('Beginner');
    const [Price, setPrice] = useState('');
    const [IsPaid, setIsPaid] = useState(true);
    const [DiscountPercentage, setDiscountPercentage] = useState('');
    const [Language, setLanguage] = useState('');
    const [Image, setImage] = useState('');
    const [StartingDate, setStartingDate] = useState('');
    const [ExpiryDate, setExpiryDate] = useState('');
    const [Status, setStatus] = useState('Draft');

    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);


    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };


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
                        setDiscountPercentage(course.DiscountPercentage || '');
                        setLanguage(course.Language || '');
                        setImage(course.Image || '');
                        setStartingDate(formatDate(course.StartingDate));
                        setExpiryDate(formatDate(course.ExpiryDate));
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
        navigate('/admin/Courses');
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
            Title,
            Description,
            Category,
            Level,
            Price,
            IsPaid,
            DiscountPercentage,
            Language,
            Image,
            StartingDate,
            ExpiryDate,
            Status
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
                    navigate('/admin/Courses');
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
                                            value={Title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </td>

                                    <td>
                                        <div className="formlabel">Category</div>
                                        <select
                                            value={Category}
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

                                </tr>


                                <tr>

                                    <td colSpan="2">

                                        <div className="formlabel">Description</div>

                                        <textarea
                                            value={Description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        <div className="formlabel">Level</div>

                                        <select
                                            value={Level}
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
                                            value={Language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        <div className="formlabel">Price</div>

                                        <input
                                            type="number"
                                            value={Price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div>

                                            <input
                                                type="checkbox"
                                                checked={IsPaid}
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
                                            value={DiscountPercentage}
                                            onChange={(e) => setDiscountPercentage(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Status</div>

                                        <select
                                            value={Status}
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
                                            value={StartingDate}
                                            onChange={(e) => setStartingDate(e.target.value)}
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Expiry Date</div>

                                        <input
                                            type="date"
                                            value={ExpiryDate}
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

                                            {(previewSource || Image) && (

                                                <img
                                                    src={previewSource || Image}
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