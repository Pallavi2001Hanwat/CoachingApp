import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  getAllTestPapers,
  deleteTestPaper,
  deleteAllTestPapers
} from "../../../Services/AdminServices/AllServices/TestPaperService";

import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import { toast } from "react-toastify";

const TestPaperList = () => {
  const [TestPaper, setTestPaper] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const navigate = useNavigate();
  const isFetchedRef = useRef(false);

  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  // ---------------- LOAD ----------------
  const loadAll = async () => {
    try {
      const res = await getAllTestPapers();
      console.log("Fetched Test Papers:", res.TestPapers);
      if (res.TestPapers) setTestPaper(res.TestPapers);
    } catch {
      toast.error("Failed to load Test Papers");
    }
  };

  useEffect(() => {
    if (!isFetchedRef.current) {
      loadAll();
      isFetchedRef.current = true;
    }
  }, []);

  // ---------------- CREATE ----------------
  const handleCreate = () => {
    navigate("/admin/TestPaper/create");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (id) => {
    navigate(`/admin/TestPaper/edit/${id}`);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (window.confirm("Delete this Test Paper?")) {
      try {
        const res = await deleteTestPaper(id);
        setTestPaper((prev) => prev.filter((t) => t._id !== id));
        toast.success(res.message || "Deleted");
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  // ---------------- DELETE ALL ----------------
  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Delete ALL Test Papers?"
    );

    if (!confirmDelete) return;

    const confirmText = prompt("Type DELETE to confirm");

    if (confirmText !== "DELETE") {
      toast.error("Cancelled");
      return;
    }

    try {
      const res = await deleteAllTestPapers();
      toast.success(res.message || "All deleted");
      setTestPaper([]);
    } catch {
      toast.error("Failed");
    }
  };

  // ---------------- COLUMNS ----------------
  const columns = useMemo(() => [
    { accessorKey: "PaperTitle", header: "Title" },

    {
      header: "Test Series",
      cell: ({ row }) => row.original.TestSeries?.Title || "-"
    },

    {
      header: "Duration",
      cell: ({ row }) => `${row.original.DurationInMinutes} min`
    },

    {
      header: "Marks",
      cell: ({ row }) =>
        `${row.original.TotalMarks} / Pass: ${row.original.PassingMarks}`
    },

    {
      header: "Questions",
      cell: ({ row }) => row.original.TotalQuestions
    },

    {
      header: "Attempt",
      cell: ({ row }) => row.original.AttemptLimit
    },

    {
      header: "Level",
      cell: ({ row }) => row.original.PaperLevel
    },

    {
      header: "Scheduled",
      cell: ({ row }) =>
        row.original.ScheduledDate
          ? new Date(row.original.ScheduledDate).toLocaleDateString()
          : "-"
    },

    {
      accessorKey: "Status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color:
              row.original.Status === "Active" ? "green" : "red",
            fontWeight: "bold"
          }}
        >
          {row.original.Status}
        </span>
      )
    },

    {
      id: "actions",
      header: "Actions",
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

  // ---------------- TABLE ----------------
  const table = useReactTable({
    data: TestPaper,
    columns,
    state: { globalFilter, sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } }
  });

  return (
    <div className="table-main-div">

      {/* HEADER */}
      <div className="white-bg-btn">
        <p>Test Papers</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="button" onClick={handleCreate}>
            + Create
          </button>

          <button
            className="button delete-button"
            onClick={handleDeleteAll}
          >
            Delete All
          </button>
        </div>
      </div>

      {/* TABLE */}
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
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  No Test Papers found
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
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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
  );
};

export default TestPaperList;