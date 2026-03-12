import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    getAllSubjects,
    deleteSubject,
} from '../../../Services/AdminServices/AllServices/SubjectService';
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

const SubjectList = () => {

    const [subjects, setSubjects] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const fetchSubjects = async () => {

                try {

                    const response = await getAllSubjects();

                    if (response.Subjects) {

                        setSubjects(response.Subjects);
                        toast.success('Subjects loaded successfully');

                    } else {

                        setSubjects([]);
                        toast.error('Failed to load Subjects');

                    }

                } catch (err) {

                    console.error('Error fetching Subjects:', err);
                    toast.error('Error fetching Subjects');

                }

            };

            fetchSubjects();
            isFetchedRef.current = true;

        }

    }, []);


    const handleEdit = (id) => {

        navigate(`/admin/Subject/edit/${id}`);

    };


    const handleCreate = () => {

        navigate('/admin/Subject/create');

    };


    const handleDelete = async (SubjectId) => {

        if (window.confirm('Are you sure you want to delete this Subject?')) {

            try {

                const response = await deleteSubject(SubjectId);

                setSubjects((prev) => prev.filter((s) => s._id !== SubjectId));

                toast.success(response.message || 'Subject deleted successfully');

            } catch (error) {

                toast.error(error.response?.data?.message || 'Failed to delete Subject');

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
                        alt="Subject"
                        style={{ height: '50px', width: '50px', objectFit: 'cover' }}
                    />

                    :

                    'No Image'

            ),
        },

        {
            accessorKey: 'Title',
            header: 'Subject Name',
            enableSorting: true,
        },

        {
            accessorKey: 'SubjectCode',
            header: 'Subject Code',
            enableSorting: true,
        },

        {
            accessorKey: 'Description',
            header: 'Description',
        },

        {
            accessorKey: 'CreatedBy',
            header: 'Created By',
        },

        {
            accessorKey: 'Status',
            header: 'Status',
            cell: ({ row }) => (

                <span
                    style={{
                        color: row.original.Status === 'Active' ? 'green' : 'red',
                        fontWeight: 'bold'
                    }}
                >
                    {row.original.Status}
                </span>

            ),
        },

        {
            accessorKey: 'createdDate',
            header: 'Created Date',
            cell: ({ row }) => (

                row.original.createdDate ?

                    new Date(row.original.createdDate).toLocaleDateString()

                    :

                    '-'

            ),
        },

        {
            accessorKey: 'updatedDate',
            header: 'Updated Date',
            cell: ({ row }) => (

                row.original.updatedDate ?

                    new Date(row.original.updatedDate).toLocaleDateString()

                    :

                    '-'

            ),
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

        data: subjects,
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

                <p>Subjects</p>

                <button className="button" onClick={handleCreate}>
                    Create Subject
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
                                        No Subjects found
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

export default SubjectList;