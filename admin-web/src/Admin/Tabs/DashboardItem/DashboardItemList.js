import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    getAllDashboardItems,
    deleteDashboardItem,
} from '../../../Services/AdminServices/AllServices/DashboardItemService';

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

const DashboardItemList = () => {

    const [DashboardItems, setDashboardItems] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const isFetchedRef = useRef(false);
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {

        if (!isFetchedRef.current) {

            const fetchDashboardItems = async () => {

                try {

                    const response = await getAllDashboardItems();
                    console.log('Fetched DashboardItems:', response);

                    if (response.Dashboard_Items) {

                        setDashboardItems(response.Dashboard_Items);
                        toast.success('DashboardItems loaded successfully');

                    } else {

                        setDashboardItems([]);
                        toast.error('Failed to load DashboardItems');

                    }

                } catch (err) {

                    console.error('Error fetching DashboardItems:', err);
                    toast.error('Error fetching DashboardItems');

                }

            };

            fetchDashboardItems();
            isFetchedRef.current = true;

        }

    }, []);

    const handleEdit = (id) => {
        navigate(`/admin/DashboardItem/edit/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/DashboardItem/create');
    };

    const handleDelete = async (DashboardItemId) => {

        if (window.confirm('Are you sure you want to delete this DashboardItem?')) {

            try {

                const response = await deleteDashboardItem(DashboardItemId);

                setDashboardItems((prev) => prev.filter((c) => c._id !== DashboardItemId));

                toast.success(response.message || 'DashboardItem deleted successfully');

            } catch (error) {

                toast.error(error.response?.data?.message || 'Failed to delete DashboardItem');

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
                    alt="DashboardItem"
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
        accessorKey: 'Type',
        header: 'Type',
    },

    {
        accessorKey: 'Action',
        header: 'Action',

        cell: ({ row }) => (

            row.original.Action ?

                <a
                    href={row.original.Action}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff' }}
                >
                    Open
                </a>

                :

                '-'

        )

    },

    {
        accessorKey: 'Visibility',
        header: 'Visibility',

        cell: ({ row }) => (

            <span
                style={{
                    color:
                        row.original.Visibility === 'Free'
                            ? 'green'
                            : 'orange',
                    fontWeight: 'bold'
                }}
            >
                {row.original.Visibility}
            </span>

        )

    },

    {
        accessorKey: 'OrderNumber',
        header: 'Order',

        cell: ({ row }) => (

            <span style={{ fontWeight: 'bold' }}>
                {row.original.OrderNumber}
            </span>

        )

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

        data: DashboardItems,
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

                <p>DashboardItems</p>

                <button className="button" onClick={handleCreate}>
                    Create DashboardItem
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
                                        No DashboardItems found
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

export default DashboardItemList;