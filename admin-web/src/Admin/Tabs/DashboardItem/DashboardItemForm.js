import React, { useState, useEffect, useRef } from 'react';
import { addDashboardItem, updateDashboardItem, getDashboardItemById ,getNextOrderNo} from '../../../Services/AdminServices/AllServices/DashboardItemService';
import '../../AdminStyle/AdminGlobalStyle.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const DashboardItemForm = ({ isEditMode = false }) => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Paid Course');
    const [action, setAction] = useState('');
    const [visibility, setVisibility] = useState('Free');
    const [orderNumber, setOrderNumber] = useState(0);
    const [status, setStatus] = useState('Active');

    const [image, setImage] = useState('');
    const [previewSource, setPreviewSource] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);


    // AUTO SLUG GENERATOR (Same as Mobile)
    useEffect(() => {

        const makeSlug = (text) =>
            text
                .toLowerCase()
                .replace(/\s+/g, "-");

        setAction(`/${makeSlug(type)}`);

    }, [type]);


    // Load data for edit
    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadData = async () => {

                try {

                    if (isEditMode && id) {

                        const response = await getDashboardItemById(id);

                        if (!response.Dashboard_Item) return;

                        const item = response.Dashboard_Item;

                        setTitle(item.Title || '');
                        setDescription(item.Description || '');
                        setType(item.Type || 'Paid Course');
                        setVisibility(item.Visibility || 'Free');
                        setAction(item.Action || '');
                        setOrderNumber(item.OrderNumber || 0);
                        setStatus(item.Status || 'Active');
                        setImage(item.Image || '');

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


    // Load next order number for new items
    useEffect(() => {

    const fetchNextOrderNo = async () => {

        try {

            if (!isEditMode) {

                const response = await getNextOrderNo();

                if (response.success) {
                    setOrderNumber(response.nextOrderNo);
                }

            }

        } catch (err) {
            toast.error("Failed to fetch next order number");
        }

    };

    fetchNextOrderNo();

}, [isEditMode]);

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
            Title: title,
            Description: description,
            Image: image,
            Type: type,
            Action: action,
            Visibility: visibility,
            OrderNumber: Number(orderNumber),
            Status: status
        };

        try {

            let response;

            if (isEditMode) {
                response = await updateDashboardItem(id, payload);
            } else {
                response = await addDashboardItem(payload);
            }
            console.log('API Response:', response);

           // showResponseMessage(response);

            if (response.success) {

                setTimeout(() => {
                    navigate('/admin/DashboardItems');
                }, 2000);

            }

        } catch (err) {

            toast.error(err.message);

        }

    };


    const handleCancel = () => {
        navigate('/admin/DashboardItems');
    };


    if (isLoading) return <div>Loading...</div>;


    return (

        <div>

            <div className='pagetitle'>
                {isEditMode ? 'Edit Dashboard Item' : 'Create Dashboard Item'}
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <form onSubmit={handleSubmit}>

                        <table>

                            <tbody>

                                <tr>

                                    <td>

                                        <div className="formlabel">Title *</div>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Type *</div>

                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >

                                            <option value="Paid Course">Paid Course</option>
                                            <option value="Free Course">Free Course</option>
                                            <option value="Test Series">Test Series</option>
                                            <option value="Free Test">Free Test</option>
                                            <option value="Previous Papers">Previous Papers</option>
                                            <option value="Current Affairs">Current Affairs</option>
                                            <option value="Quiz">Quiz</option>
                                            <option value="Syllabus">Syllabus</option>
                                            <option value="Books">Books</option>
                                            <option value="Job Alerts">Job Alerts</option>
                                            <option value="E-Books">E-Books</option>

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

                                        <div className="formlabel">Action URL</div>

                                        <input
                                            type="text"
                                            value={action}
                                            readOnly
                                            style={{ background: "#eee" }}
                                        />

                                    </td>

                                    <td>

                                        <div className="formlabel">Order Number</div>

                                        <input
                                            type="number"
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                        />

                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="formlabel">Visibility</div>

                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                        >

                                            <option value="Free">Free</option>
                                            <option value="Paid">Paid</option>

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


                                <tr>

                                    <td>

                                        <div className="formlabel">Image</div>

                                        <input
                                            type="file"
                                            onChange={handleFileInputChange}
                                        />

                                        <div className='pt-2'>

                                            {(previewSource || image) && (

                                                <img
                                                    src={previewSource || image}
                                                    alt="Preview"
                                                    style={{ height: '120px' }}
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

export default DashboardItemForm;