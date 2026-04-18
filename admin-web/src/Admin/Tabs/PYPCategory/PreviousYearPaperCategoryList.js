import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    getAllPreviousYearPaperCategorys,
    deletePreviousYearPaperCategory,
    deleteAllPreviousYearPaperCategorys
} from '../../../Services/AdminServices/AllServices/PreviousYearPaperCategoryService';

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

const PreviousYearPaperCategoryList = () => {

    const [categories, setCategories] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const fetchCategories = async () => {

                try {

                    const response = await getAllPreviousYearPaperCategorys();

                    if (response.Categories) {

                        setCategories(response.Categories);
                        toast.success('Categories loaded successfully');

                    } else {

                        setCategories([]);
                        toast.error('Failed to load categories');

                    }

                } catch (err) {

                    console.error(err);
                    toast.error('Error fetching categories');

                }

            };

            fetchCategories();
            isFetchedRef.current = true;

        }

    }, []);

    const handleEdit = (id) => {
        navigate(`/admin/PreviousYearPaperCategory/edit/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/PreviousYearPaperCategory/create');
    };

    const handleDelete = async (id) => {

        if (window.confirm('Are you sure you want to delete this category?')) {

            try {

                const response = await deletePreviousYearPaperCategory(id);

                setCategories((prev) => prev.filter((c) => c._id !== id));

                toast.success(response.message || 'Category deleted successfully');

            } catch (error) {

                toast.error(error.response?.data?.message || 'Failed to delete category');

            }

        }

    };

    // DELETE ALL FUNCTION
    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL categories? This will also delete all associated papers.')) {
            try {
                const response = await deleteAllPreviousYearPaperCategorys();
                setCategories([]); // Clear table
                toast.success(response.message || 'All categories deleted successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete all categories');
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
                        alt="Category"
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
            accessorKey: 'Status',
            header: 'Status',

            cell: ({ row }) => (

                <span
                    style={{
                        color:
                            row.original.Status === 'Active'
                                ? 'green'
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

        data: categories,
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
                <p>PYP Categories</p>

                <button className="button" onClick={handleCreate}>
                    Create Category
                </button>

                <button
                    className="button delete-all-button"
                    style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                    onClick={handleDeleteAll}
                >
                    Delete All
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
                                        No categories found
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

export default PreviousYearPaperCategoryList;