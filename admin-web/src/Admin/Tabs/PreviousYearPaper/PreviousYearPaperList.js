import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  getAllPreviousYearPapers,
  deletePreviousYearPaper,
} from '../../../Services/AdminServices/AllServices/PreviousYearPaperService';

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

const PreviousYearPaperList = () => {

  const [papers, setPapers] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const navigate = useNavigate();
  const isFetchedRef = useRef(false);
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {

    if (!isFetchedRef.current) {

      const fetchPapers = async () => {

        try {

          const response = await getAllPreviousYearPapers();

          if (response.Papers) {

            setPapers(response.Papers);
            toast.success('Papers loaded successfully');

          } else {

            setPapers([]);
            toast.error('Failed to load papers');

          }

        } catch (err) {

          console.error(err);
          toast.error('Error fetching papers');

        }

      };

      fetchPapers();
      isFetchedRef.current = true;

    }

  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/PreviousYearPaper/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/PreviousYearPaper/create');
  };

  const handleDelete = async (id) => {

    if (window.confirm('Are you sure you want to delete this paper?')) {

      try {

        const response = await deletePreviousYearPaper(id);

        setPapers((prev) => prev.filter((p) => p._id !== id));

        toast.success(response.message || 'Paper deleted successfully');

      } catch (error) {

        toast.error(error.response?.data?.message || 'Failed to delete paper');

      }

    }

  };

  const columns = useMemo(() => [

    {
      id: 'Category',
      header: 'Category',

      cell: ({ row }) => (
        row.original.PYPCategoryId?.Title || '-'
      )
    },

    {
      accessorKey: 'PaperTitle',
      header: 'Paper Title',
    },

    {
      accessorKey: 'PaperCode',
      header: 'Paper Code',
    },

    {
      accessorKey: 'Year',
      header: 'Year',
    },

    {
      accessorKey: 'Stage',
      header: 'Stage',
    },

    {
      accessorKey: 'Shift',
      header: 'Shift',
    },

    {
      accessorKey: 'Language',
      header: 'Language',
    },

    {
      accessorKey: 'TotalQuestions',
      header: 'Questions',
    },

    {
      accessorKey: 'TotalMarks',
      header: 'Marks',
    },

    {
      accessorKey: 'TimeDuration',
      header: 'Duration (min)',
    },

    {
      id: 'PDF',
      header: 'PDF',

      cell: ({ row }) => (

        row.original.PaperFileUrl ?

          <a
            href={row.original.PaperFileUrl}
            target="_blank"
            rel="noreferrer"
            className="gridbutton"
          >
            View PDF
          </a>

          :

          '-'

      )

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

      )

    },

  ], []);

  const table = useReactTable({

    data: papers,
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

        <p>Previous Year Papers</p>

        <button className="button" onClick={handleCreate}>
          Create Paper
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
                    No papers found
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

export default PreviousYearPaperList;