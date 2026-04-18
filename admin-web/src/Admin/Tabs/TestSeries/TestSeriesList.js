import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  getAllTestSeriess,
  deleteTestSeries,
  getTestSeriesByCategory,
  deleteAllTestSeries
} from "../../../Services/AdminServices/AllServices/TestSeriesService";

import { getAllCategories } from "../../../Services/AdminServices/AllServices/CategoryService";

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

const TestSeriesList = () => {

  const [testSeries, setTestSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  const navigate = useNavigate();
  const isFetchedRef = useRef(false);

  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  // ---------------- LOAD CATEGORIES ----------------
  const loadCategories = async () => {

    try {
      const res = await getAllCategories();

      if (res.success) {
        setCategories(res.categories);
      }

    } catch {
      toast.error("Failed to load categories");
    }

  };

  // ---------------- LOAD ALL SERIES ----------------
  const loadAllSeries = async () => {

    try {
      const res = await getAllTestSeriess();

      if (res.TestSeries) {
        setTestSeries(res.TestSeries);
      }

    } catch {
      toast.error("Failed to load TestSeries");
    }

  };

  // ---------------- LOAD CATEGORY SERIES ----------------
  const loadSeriesByCategory = async (categoryId) => {

    try {
      const res = await getTestSeriesByCategory(categoryId);
console.log(res.TestSeries)
      if (res.TestSeries) {
        setTestSeries(res.TestSeries);
      }

    } catch {
      toast.error("Failed to load category TestSeries");
    }

  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {

    if (!isFetchedRef.current) {
      loadCategories();
      loadAllSeries();
      isFetchedRef.current = true;
    }

  }, []);

  // ---------------- CATEGORY CHANGE ----------------
  const handleCategoryChange = (categoryId) => {

    setSelectedCategory(categoryId);

    if (!categoryId) {
      loadAllSeries();
    } else {
      loadSeriesByCategory(categoryId);
    }

  };

  // ---------------- CREATE ----------------
  const handleCreate = () => {
    navigate("/admin/TestSeries/create");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (id) => {
    navigate(`/admin/TestSeries/edit/${id}`);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {

    if (window.confirm("Are you sure you want to delete this TestSeries?")) {

      try {

        const res = await deleteTestSeries(id);

        setTestSeries((prev) => prev.filter((t) => t._id !== id));

        toast.success(res.message || "TestSeries deleted successfully");

      } catch (error) {

        toast.error(
          error.response?.data?.message || "Failed to delete TestSeries"
        );

      }

    }

  };

  // ---------------- DELETE ALL ----------------
  const handleDeleteAll = async () => {

    const confirmDelete = window.confirm(
      "⚠️ Are you sure?\nThis will delete ALL TestSeries permanently!"
    );

    if (!confirmDelete) return;

    try {

      const res = await deleteAllTestSeries();

      toast.success(res.message || "All TestSeries deleted");

      setTestSeries([]);

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Failed to delete all TestSeries"
      );

    }

  };

  // ---------------- TABLE COLUMNS ----------------
  const columns = useMemo(() => [

    {
      accessorKey: "Image",
      header: "Image",

      cell: ({ row }) =>
        row.original.Image ? (
          <img
            src={row.original.Image}
            alt="TestSeries"
            style={{ height: "50px", width: "50px", objectFit: "cover" }}
          />
        ) : (
          "No Image"
        )
    },

    {
      accessorKey: "Title",
      header: "Title"
    },

    {
  accessorKey: "CategoryId",
  header: "Category",

  cell: ({ row }) => {
    const categoryData = row.original.CategoryId;

    // Agar populated object hai
    if (categoryData && typeof categoryData === "object" && categoryData.CategoryName) {
      return categoryData.CategoryName;
    }

    // Agar sirf id string hai
    if (categoryData && typeof categoryData === "string") {
      const category = categories.find(cat => cat._id === categoryData);
      return category ? category.CategoryName : "-";
    }

    return "-";
  }
},

    {
      header: "Price",

      cell: ({ row }) =>
        row.original.IsPaid ? `₹${row.original.Price}` : "Free"
    },

    {
      accessorKey: "Status",
      header: "Status",

      cell: ({ row }) => (
        <span
          style={{
            color: row.original.Status === "Active" ? "green" : "red",
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

  ], [categories]); // ✅ IMPORTANT FIX

  // ---------------- TABLE ----------------
  const table = useReactTable({

    data: testSeries,
    columns,

    state: {
      globalFilter,
      sorting
    },

    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      pagination: {
        pageSize: pageSize
      }
    }

  });

  return (

    <div className="table-main-div">

      <div className="white-bg-btn">

        <p>Test Series</p>

        <div style={{ display: "flex", gap: "10px" }}>

          <button className="button" onClick={handleCreate}>
            Create TestSeries
          </button>

          <button
            className="button delete-button"
            onClick={handleDeleteAll}
          >
            Delete All
          </button>

        </div>

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

        {/* CATEGORY FILTER */}
        <div style={{ marginBottom: "10px" }}>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.CategoryName}
              </option>
            ))}

          </select>

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
                    No TestSeries found
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

    </div>

  );

};

export default TestSeriesList;