import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    getAllCourses,
    deleteCourse,
} from '../../../Services/AdminServices/AllServices/CourseService';

import { useNavigate } from 'react-router-dom';

import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';

import { toast } from 'react-toastify';

const CourseList = () => {

    const [courses, setCourses] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const fetchCourses = async () => {

                try {

                    const response = await getAllCourses();
                    console.log('Fetched courses:', response);

                    if (response.courses) {

                        setCourses(response.courses);
                        toast.success('Courses loaded successfully');

                    } else {

                        setCourses([]);
                        toast.error('Failed to load courses');

                    }

                } catch (err) {

                    console.error('Error fetching courses:', err);
                    toast.error('Error fetching courses');

                }

            };

            fetchCourses();
            isFetchedRef.current = true;

        }

    }, []);

    const handleEdit = (id) => {
        navigate(`/admin/Course/edit/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/Course/create');
    };

    const handleDelete = async (courseId) => {

        if (window.confirm('Are you sure you want to delete this course?')) {

            try {

                const response = await deleteCourse(courseId);

                setCourses((prev) => prev.filter((c) => c._id !== courseId));

                toast.success(response.message || 'Course deleted successfully');

            } catch (error) {

                toast.error(error.response?.data?.message || 'Failed to delete course');

            }

        }

    };

    const columns = useMemo(() => [

        {
            accessorKey: 'Image',
            header: 'Image',

            cell: ({ row }) => (

                row.original.Image ?

                    <img
                        src={row.original.Image}
                        alt="course"
                        style={{
                            height: '50px',
                            width: '50px',
                            objectFit: 'cover',
                            borderRadius: '6px'
                        }}
                    />

                    :

                    'No Image'

            ),
        },

        {
            accessorKey: 'Title',
            header: 'Title',
        },

        {
            id: 'Category',
            header: 'Category',

            cell: ({ row }) => (

                row.original.Category?.CategoryName || '-'

            )

        },

        {
            accessorKey: 'Level',
            header: 'Level',

            cell: ({ row }) => {

                const level = row.original.Level;

                return (
                    <span
                        style={{
                            color:
                                level === 'Beginner'
                                    ? 'green'
                                    : level === 'Intermediate'
                                        ? 'orange'
                                        : 'red',
                            fontWeight: 'bold'
                        }}
                    >
                        {level}
                    </span>
                );

            }

        },

        {
            header: 'Price',

            cell: ({ row }) => (

                row.original.IsPaid
                    ? `₹${row.original.Price}`
                    : 'Free'

            )

        },

        {
            accessorKey: 'DiscountPercentage',
            header: 'Discount',

            cell: ({ row }) => (

                row.original.DiscountPercentage
                    ? `${row.original.DiscountPercentage}%`
                    : '-'

            )

        },

        {
            accessorKey: 'Language',
            header: 'Language',
        },

        {
            accessorKey: 'StartingDate',
            header: 'Start Date',

            cell: ({ row }) => (

                row.original.StartingDate
                    ? new Date(row.original.StartingDate).toLocaleDateString()
                    : '-'

            )

        },

        {
            accessorKey: 'ExpiryDate',
            header: 'Expiry Date',

            cell: ({ row }) => (

                row.original.ExpiryDate
                    ? new Date(row.original.ExpiryDate).toLocaleDateString()
                    : '-'

            )

        },

        {
            accessorKey: 'Status',
            header: 'Status',

            cell: ({ row }) => (

                <span
                    style={{
                        color:
                            row.original.Status === 'Published'
                                ? 'green'
                                : row.original.Status === 'Draft'
                                    ? 'orange'
                                    : 'red',
                        fontWeight: 'bold'
                    }}
                >
                    {row.original.Status}
                </span>

            )

        },

        {
            id: 'actions',
            header: 'Actions',

            cell: ({ row }) => (

                <div className="action-buttons">

                    <button
                        className="gridbutton"
                        onClick={() => handleEdit(row.original._id)}
                    >
                        Edit
                    </button>

                    <button
                        className="gridbutton delete-button"
                        onClick={() => handleDelete(row.original._id)}
                    >
                        Delete
                    </button>

                </div>

            ),

        },

    ], []);

    const table = useReactTable({

        data: courses,
        columns,

        state: {
            globalFilter,
            sorting,
        },

        onSortingChange: setSorting,

        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },

    });

    return (

        <div className="table-main-div">

            <div className="white-bg-btn">

                <p>Courses</p>

                <button className="button" onClick={handleCreate}>
                    Create Course
                </button>

            </div>

            <div className="white-bg">

                <div className="table-top-bar">

                    <div className="entries-dropdown">

                        <span>Show</span>

                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {

                                table.setPageSize(Number(e.target.value));
                                setPageSize(Number(e.target.value));

                            }}
                        >

                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>

                        </select>

                        <span>entries</span>

                    </div>

                    <input
                        type="text"
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="search-input"
                    />

                </div>

                <div className="responsive-table-container">

                    <table className="responsive-table">

                        <thead>

                            {table.getHeaderGroups().map((headerGroup) => (

                                <tr key={headerGroup.id}>

                                    {headerGroup.headers.map((header) => (

                                        <th key={header.id}>

                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}

                                        </th>

                                    ))}

                                </tr>

                            ))}

                        </thead>

                        <tbody>

                            {table.getRowModel().rows.length > 0 ?

                                table.getRowModel().rows.map((row) => (

                                    <tr key={row.id}>

                                        {row.getVisibleCells().map((cell) => (

                                            <td key={cell.id}>

                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}

                                            </td>

                                        ))}

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                        No courses found
                                    </td>

                                </tr>

                            }

                        </tbody>

                    </table>

                </div>

                <div className="text-end">

                    <button
                        className="button Pagination-btn"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        &lt;
                    </button>

                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>

                    <button
                        className="button Pagination-btn"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        &gt;
                    </button>

                </div>

            </div>

        </div>

    );

};

export default CourseList;