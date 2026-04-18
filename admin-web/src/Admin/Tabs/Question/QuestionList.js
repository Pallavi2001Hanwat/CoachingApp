import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  getAllQuestionOptions,
  deleteQuestionOption,
  deleteAllQuestionOptions
} from '../../../Services/AdminServices/AllServices/QuestionWithOptionService';

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

const QuestionList = () => {

  const [Questions, setQuestions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const navigate = useNavigate();
  const isFetchedRef = useRef(false);
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  /** LOAD DATA */
  useEffect(() => {
    if (!isFetchedRef.current) {

      const fetchQuestions = async () => {
        try {
          const res = await getAllQuestionOptions();

          if (res?.success) {
            setQuestions(res.questionswithoption);
            toast.success("Questions loaded");
          } else {
            setQuestions([]);
          }

        } catch (err) {
          toast.error("Error loading questions");
        }
      };

      fetchQuestions();
      isFetchedRef.current = true;
    }
  }, []);

  /** ACTIONS */
  const handleEdit = (id) => {
    navigate(`/admin/QuestionWithOption/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/QuestionWithOption/create');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this question?")) {
      try {
        const res = await deleteQuestionOption(id);
        if (res?.success) {
          setQuestions(prev => prev.filter(q => q._id !== id));
          toast.success("Deleted successfully");
        }
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const handleDeleteAll = async () => {

  if (window.confirm("Are you sure you want to delete ALL questions? This action cannot be undone!")) {

    try {
      const res = await deleteAllQuestionOptions();

      if (res?.success) {
        setQuestions([]); // ✅ UI clear
        toast.success(res.message || "All questions deleted successfully");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete all questions");
    }

  }

};

  /** TABLE COLUMNS */
  const columns = useMemo(() => [

    {
      accessorKey: 'QuestionImage',
      header: 'Image',
      cell: ({ row }) =>
        row.original.QuestionImage ? (
          <img
            src={row.original.QuestionImage}
            style={{ height: 50, width: 50, objectFit: 'cover' }}
          />
        ) : 'No Image'
    },

    {
      accessorKey: 'QuestionText',
      header: 'Question',
      cell: ({ row }) => (
        <div style={{ maxWidth: 250 }}>
          {row.original.QuestionText}
        </div>
      )
    },

    {
      accessorKey: 'QuestionType',
      header: 'Type'
    },

    {
      accessorKey: 'DifficultyLevel',
      header: 'Difficulty'
    },

    {
      accessorKey: 'Marks',
      header: 'Marks',
      cell: ({ row }) => (
        <>
          {row.original.Marks}
          {row.original.NegativeMarks
            ? ` (-${row.original.NegativeMarks})`
            : ''}
        </>
      )
    },

    {
      accessorKey: 'TimeAllowedInSeconds',
      header: 'Time (sec)'
    },

    {
      accessorKey: 'Options',
      header: 'Options',
      cell: ({ row }) => row.original.Options?.length || 0
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
    }

  ], []);

  /** TABLE */
  const table = useReactTable({
    data: Questions,
    columns,
    state: { globalFilter, sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize }
    }
  });

  return (
    <div className="table-main-div">

      {/* HEADER */}
     <div className="white-bg-btn">
  <p>Questions</p>

  <div style={{ display: 'flex', gap: '10px' }}>
    <button className="button" onClick={handleCreate}>
      + Add Question
    </button>

    <button
      className="button delete-button"
      style={{ backgroundColor: 'red', color: 'white' }}
      onClick={handleDeleteAll}
      disabled={Questions.length === 0} // ✅ safety: disable if no questions
    >
      Delete All
    </button>
  </div>

</div>

      <div className="white-bg">

        {/* TOP BAR */}
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

        {/* TABLE */}
        <div className="responsive-table-container">
          <table className="responsive-table">

            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
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
                  <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                    No Questions found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
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

export default QuestionList;