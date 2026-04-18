// ... baki imports same
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  getAllSyllabusCategorys,
  deleteSyllabusCategory,
  deleteAllSyllabusCategory
} from "../../../../Services/AdminServices/AllServices/SyllabusCategoryService";
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

const SyllabusCategoryList = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const isFetchedRef = useRef(false);
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  // -------- LOAD DATA --------
  const loadData = async () => {
    try {
      const res = await getAllSyllabusCategorys();
      if (res.SyllabusCategories) setData(res.SyllabusCategories);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    if (!isFetchedRef.current) {
      loadData();
      isFetchedRef.current = true;
    }
  }, []);

  // -------- CREATE --------
  const handleCreate = () => {
    navigate("/admin/SyllabusCategory/create");
  };

  // -------- EDIT --------
  const handleEdit = (id) => {
    navigate(`/admin/SyllabusCategory/edit/${id}`);
  };

  // -------- DELETE SINGLE --------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await deleteSyllabusCategory(id);
      setData((prev) => prev.filter((item) => item._id !== id));
      toast.success(res.message || "Deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  // -------- DELETE ALL --------
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete ALL categories and related syllabus?")) return;

    try {
      const res = await deleteAllSyllabusCategory();
      setData([]); // Clear table
      toast.success(res.message || "All categories deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete all categories");
    }
  };

  // -------- TABLE COLUMNS --------
  const columns = useMemo(() => [
    { accessorKey: "CategoryName", header: "Category Name" },
    { accessorKey: "Description", header: "Description", cell: ({ row }) => row.original.Description || "-" },
    { accessorKey: "Status", header: "Status", cell: ({ row }) => (
      <span style={{ color: row.original.Status === "Active" ? "green" : "red", fontWeight: "bold" }}>
        {row.original.Status}
      </span>
    ) },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="action-buttons">
        <button className="gridbutton" onClick={() => handleEdit(row.original._id)}>Edit</button>
        <button className="gridbutton delete-button" onClick={() => handleDelete(row.original._id)}>Delete</button>
      </div>
    ) }
  ], []);

  // -------- TABLE --------
  const table = useReactTable({
    data,
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

      <div className="white-bg-btn">
        <p>Category List</p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="button" onClick={handleCreate}>Create Category</button>
          <button className="delete-All-button" onClick={handleDeleteAll}>Delete All</button>
        </div>
      </div>

      <div className="white-bg">

        {/* TOP BAR */}
        <div className="table-top-bar">
          <div className="entries-dropdown">
            <span>Show</span>
            <select value={table.getState().pagination.pageSize} onChange={(e) => { table.setPageSize(Number(e.target.value)); setPageSize(Number(e.target.value)); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <input type="text" placeholder="Search..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="search-input" />
        </div>

        {/* TABLE */}
        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center" }}>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="text-end">
          <button className="button Pagination-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>&lt;</button>
          <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <button className="button Pagination-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>&gt;</button>
        </div>

      </div>
    </div>
  );
};

export default SyllabusCategoryList;