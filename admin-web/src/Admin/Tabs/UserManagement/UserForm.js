import React, { useState, useEffect, useRef } from 'react';
import { addUser, getUserByid, updateUser }
from '../../../Services/AdminServices/AllServices/UserService';
import { useNavigate, useParams } from 'react-router-dom';
import '../../AdminStyle/AdminGlobalStyle.css';

const UserForm = ({ isEditMode = false }) => {

    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Username: '',
        Email: '',
        Phone: '',
        AlternatePhone: '',
        Gender: '',
        DateOfBirth: '',
        Password: '',
        ConfirmPassword: '',
        IsActive: true,
        IsAdmin: false,
        IsTeacher: false,
        Status: '',
    });

    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const isFetchedRef = useRef(false);

    var userId = id;

    useEffect(() => {

        if (!isFetchedRef.current) {

            const loadUser = async () => {

                try {

                    const response = await getUserByid(id);

                    if (response.User) {

                        const user = response.User;

                        setFormData({
                            FirstName: user.FirstName || '',
                            LastName: user.LastName || '',
                            Username: user.Username || '',
                            Email: user.Email || '',
                            Phone: user.Phone || '',
                            AlternatePhone: user.AlternatePhone || '',
                            Gender: user.Gender || '',
                            DateOfBirth: user.DateOfBirth
                                ? user.DateOfBirth.split("T")[0]
                                : '',
                            Password: '',
                            ConfirmPassword: '',
                            IsActive: user.IsActive ?? true,
                            IsAdmin: user.IsAdmin ?? false,
                            IsTeacher: user.IsTeacher ?? false,
                            Status: user.audit?.status || '',
                        });

                    } else {
                        setFormData(null);
                    }

                } catch (error) {
                    console.error('Error loading user:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            if (isEditMode && id) {
                loadUser();
            } else {
                setIsLoading(false);
            }

            isFetchedRef.current = true;
        }

    }, [isEditMode, id]);



    const handleInputChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (formData.Password !== formData.ConfirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        try {

            if (isEditMode) {
                await updateUser(id, formData);
            } else {
                await addUser(formData);
            }

            navigate('/admin/Users');

        } catch (error) {

            console.error('Error submitting form:', error);
            alert('Failed to submit. Please try again.');

        }
    };


    const handleCancel = () => {
        navigate('/admin/Users');
    };


    const handlepasswordChange = () => {
        navigate('/admin/changePassword', { state: { userId } });
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }


    return (

        <div>

            <div className='pagetitle'>
                User Form
            </div>

            <div className="form-800">

                <div className="white-bg">

                    <form onSubmit={handleSubmit}>

                        <table>
                            <tbody>

                                <tr>
                                    <td>
                                        <div className="formlabel">First Name</div>
                                        <input
                                            type="text"
                                            name="FirstName"
                                            value={formData.FirstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </td>

                                    <td>
                                        <div className="formlabel">Last Name</div>
                                        <input
                                            type="text"
                                            name="LastName"
                                            value={formData.LastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </td>
                                </tr>


                                <tr>
                                    <td>
                                        <div className="formlabel">Email</div>
                                        <input
                                            type="email"
                                            name="Email"
                                            value={formData.Email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </td>

                                    <td>
                                        <div className="formlabel">Phone</div>
                                        <input
                                            type="tel"
                                            name="Phone"
                                            value={formData.Phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </td>
                                </tr>


                                <tr>
                                    <td>
                                        <div className="formlabel">Alternate Phone</div>
                                        <input
                                            type="tel"
                                            name="AlternatePhone"
                                            value={formData.AlternatePhone}
                                            onChange={handleInputChange}
                                        />
                                    </td>

                                    <td>
                                        <div className="formlabel">Gender</div>
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </td>
                                </tr>


                                <tr>
                                    <td>
                                        <div className="formlabel">Date Of Birth</div>
                                        <input
                                            type="date"
                                            name="DateOfBirth"
                                            value={formData.DateOfBirth}
                                            onChange={handleInputChange}
                                        />
                                    </td>

                                    <td>
                                        <div className="formlabel">Username</div>
                                        <input
                                            type="text"
                                            name="Username"
                                            value={formData.Username}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isEditMode}
                                        />
                                    </td>
                                </tr>


                                {!isEditMode && (
                                    <tr>

                                        <td>
                                            <div className="formlabel">Password</div>
                                            <input
                                                type="password"
                                                name="Password"
                                                value={formData.Password}
                                                onChange={handleInputChange}
                                            />
                                        </td>

                                        <td>
                                            <div className="formlabel">Confirm Password</div>
                                            <input
                                                type="password"
                                                name="ConfirmPassword"
                                                value={formData.ConfirmPassword}
                                                onChange={handleInputChange}
                                            />
                                        </td>

                                    </tr>
                                )}


                                {passwordError && (
                                    <tr>
                                        <td colSpan="2" style={{ color: 'red', textAlign: 'center' }}>
                                            {passwordError}
                                        </td>
                                    </tr>
                                )}


                                {isEditMode && (
                                    <tr>
                                        <td colSpan="2">

                                            <label>Status:</label>

                                            <select
                                                name="Status"
                                                value={formData.Status}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>

                                        </td>
                                    </tr>
                                )}


                                <tr>

                                    <td>
                                        <input
                                            type="checkbox"
                                            name="IsActive"
                                            checked={formData.IsActive}
                                            onChange={handleInputChange}
                                        />
                                        <span className="formlabel pl-2">Is Active</span>
                                    </td>

                                    <td>
                                        <input
                                            type="checkbox"
                                            name="IsAdmin"
                                            checked={formData.IsAdmin}
                                            onChange={handleInputChange}
                                        />
                                        <span className="formlabel pl-2">Is Admin</span>
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        <input
                                            type="checkbox"
                                            name="IsTeacher"
                                            checked={formData.IsTeacher}
                                            onChange={handleInputChange}
                                        />
                                        <span className="formlabel pl-2">Is Teacher</span>
                                    </td>

                                    

                                </tr>

                            </tbody>
                        </table>


                        <div>

                            <button type="submit" className="button" disabled={isLoading}>
                                {isEditMode ? 'Update User' : 'Add User'}
                            </button>

                            <button
                                type="button"
                                className="button cancel-button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                            {isEditMode && (
                                <button
                                    type="button"
                                    className="button cancel-button"
                                    onClick={handlepasswordChange}
                                >
                                    Change Password
                                </button>
                            )}

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );
};

export default UserForm;