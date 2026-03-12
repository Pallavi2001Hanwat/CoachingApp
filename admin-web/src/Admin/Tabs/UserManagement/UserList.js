import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    getAllUsers,
    deleteUser,
} from '../../../Services/AdminServices/AllServices/UserService';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';


const UserList = () => {
    const [users, setUsers] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const isFetchedRef = useRef(false);
    const navigate = useNavigate();
    const [columnResizeMode] = useState('onChange');


    useEffect(() => {
        if (!isFetchedRef.current) {
            const fetchUsers = async () => {
                try {
                    const response = await getAllUsers();
                    console.log(response?.Users )
                    setUsers(response?.Users || []);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };

            fetchUsers();
            isFetchedRef.current = true;
        }
    }, []);

    const handleEdit = (id) => {
        navigate(`/admin/User/Edit/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/User/create');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                setUsers((prev) => prev.filter((user) => user._id !== id));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const columns = useMemo(
        () => [
            {
      accessorKey: 'Name',
      header: 'Name',
      enableSorting: true,
      cell: ({ row }) => {
        const { FirstName, LastName } = row.original;
        return `${FirstName} ${LastName}`;
      }
    },
            {
                accessorKey: 'Username',
                header: 'Username',
                enableSorting: true
                
            },
            {
                accessorKey: 'Email',
                header: 'Email',
                enableSorting: true
               
            },
            {
                accessorKey: 'Roles',
                header: 'Role',
                enableSorting: false, // sorting arrays is messy unless handled manually
                cell: ({ row }) => (
                  <div>
                    {row.original.Roles.length > 0
                      ? row.original.Roles.join(', ')
                      : 'No Role'}
                  </div>
                )
            },
           
              
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="customization-main-btns">
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
        ],
        []
    );

   
    const table = useReactTable({
        data: users,
        columns,
        state: { globalFilter, sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columnResizeMode,
        enableColumnResizing: true,
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });
    return (
        <div className="table-main-div">
            <div className="white-bg-btn">
                <p>Users</p>
                <button className="button" onClick={handleCreate}>
                    Create User
                </button>
            </div>

            <div className="white-bg">
                <div className="table-sub-head">
                    <p>All Users</p>
                </div>
                <hr />
                <div className="p-4">
                <div className="white-bg">
                    <div className="table-top-bar">
                        <div className="entries-dropdown flex items-center gap-3">
                            <span>Show</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => {
                                    const newSize = Number(e.target.value);
                                    table.setPageSize(newSize);
                                    setPageSize(newSize);
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
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanSort() && (
                                                    <span className="sort-icon">
                                                        {header.column.getIsSorted() === 'asc' && '▲'}
                                                        {header.column.getIsSorted() === 'desc' && '▼'}
                                                        {!header.column.getIsSorted() && '↕'}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length > 0 ? (
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
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                                            No users found
                                        </td>
                                    </tr>
                                )}
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
            </div>
        </div>
    );
};

export default UserList;
