import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    getAllTopics,
    deleteTopic,
} from '../../../Services/AdminServices/AllServices/TopicService';

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

const TopicList = () => {

    const [Topics, setTopics] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const fetchTopics = async () => {

                try {

                    const response = await getAllTopics();

                    if (response.TopicOrClasss) {

                        setTopics(response.TopicOrClasss);
                        toast.success('Topics loaded successfully');

                    } else {

                        setTopics([]);
                        toast.error('Failed to load Topics');

                    }

                } catch (err) {

                    console.error('Error fetching Topics:', err);
                    toast.error('Error fetching Topics');

                }

            };

            fetchTopics();
            isFetchedRef.current = true;

        }

    }, []);

    const handleEdit = (id) => {
        navigate(`/admin/Topic/edit/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/Topic/create');
    };

    const handleDelete = async (TopicId) => {

        if (window.confirm('Are you sure you want to delete this Topic?')) {

            try {

                const response = await deleteTopic(TopicId);

                setTopics((prev) => prev.filter((c) => c._id !== TopicId));

                toast.success(response.message || 'Topic deleted successfully');

            } catch (error) {

                toast.error(error.response?.data?.message || 'Failed to delete Topic');

            }

        }

    };

    const columns = useMemo(() => [

        {
            accessorKey: 'Title',
            header: 'Title',
        },

        {
            accessorKey: 'Description',
            header: 'Description',
            cell: ({ row }) =>
                row.original.Description
                    ? row.original.Description.substring(0, 50) + '...'
                    : '-',
        },

        {
            accessorKey: 'classType',
            header: 'Class Type',
        },

        {
            accessorKey: 'classOrder',
            header: 'Order',
        },

        {
            accessorKey: 'duration',
            header: 'Duration',
        },

        {
            id: 'isFree',
            header: 'Free',
            cell: ({ row }) =>
                row.original.isFree ? 'Yes' : 'No',
        },

        {
            id: 'isLocked',
            header: 'Locked',
            cell: ({ row }) =>
                row.original.isLocked ? 'Yes' : 'No',
        },

        {
            id: 'Video',
            header: 'Video',
            cell: ({ row }) =>
                row.original.VideoURL
                    ? <a href={row.original.VideoURL} target="_blank">View</a>
                    : '-'
        },

        {
            id: 'PDF',
            header: 'PDF',
            cell: ({ row }) =>
                row.original.pdfUrl
                    ? <a href={row.original.pdfUrl} target="_blank">View</a>
                    : '-'
        },

        {
            id: 'ExtraFiles',
            header: 'Extra Files',
            cell: ({ row }) =>
                row.original.extraFiles?.length
                    ? `${row.original.extraFiles.length} files`
                    : '-'
        },

        {
            id: 'Subject',
            header: 'Subject',
            cell: ({ row }) =>
                row.original.SubjectId?.Title || '-'
        },

        {
            id: 'Chapter',
            header: 'Chapter',
            cell: ({ row }) =>
                row.original.ChapterId?.Title || '-'
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

        data: Topics,
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

                <p>Topics</p>

                <button className="button" onClick={handleCreate}>
                    Create Topic
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
                                        No Topics found
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

export default TopicList;