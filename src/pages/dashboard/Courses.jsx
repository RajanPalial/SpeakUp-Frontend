import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../../api/axios";
import { toast } from "react-toastify";

/* ─── design tokens ─── */
const C = {
  bg: "#0D0F1A",
  surface: "#141628",
  surfaceHover: "#1A1E35",
  border: "#252A45",
  accent: "#6C63FF",
  accentSoft: "rgba(108,99,255,0.12)",
  green: "#22D3A4",
  greenSoft: "rgba(34,211,164,0.10)",
  red: "#FF5E7D",
  redSoft: "rgba(255,94,125,0.10)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.10)",
  blue: "#38BDF8",
  blueSoft: "rgba(56,189,248,0.10)",
  text: "#E8EAF6",
  muted: "#6B7280",
  label: "#A0A8C8",
};

/* ─── skeleton row ─── */
const SkeletonRow = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <Skeleton height={16} borderRadius={6} />
      </td>
    ))}
  </tr>
);

const COLS = ["S.No", "Course Name", "Department", "Members", "Created On", "Action"];

/* ─── Custom scrollable department dropdown ─── */
const DepartmentDropdown = ({ departments, dropdownLoading, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = departments.find((d) => String(d.id) === String(value));

  return (
    <div style={{ position: "relative" }}>
      <label style={{ display: "block", marginBottom: 8, color: "#ddd", fontSize: 14 }}>
        Department
      </label>

      {/* Trigger */}
      <div
        onClick={() => !dropdownLoading && setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "11px 12px",
          background: "#0D0F1A",
          color: selected ? "#fff" : C.muted,
          border: `1px solid ${open ? C.accent : C.border}`,
          borderRadius: 8,
          fontSize: 14,
          cursor: dropdownLoading ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: "none",
          transition: "border-color .2s",
          boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {dropdownLoading ? "Loading departments..." : (selected ? selected.name : "Select Department")}
        </span>
        <span style={{
          marginLeft: 8, fontSize: 10, color: C.muted, flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
        }}>▼</span>
      </div>

      {/* Dropdown list */}
      {open && !dropdownLoading && (
        <>
          {/* Click-away backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0, right: 0,
            background: "#0D0F1A",
            border: `1px solid ${C.accent}`,
            borderRadius: 8,
            zIndex: 2,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            {/* None option */}
            <div
              onClick={() => { onChange(""); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 13,
                color: value === "" ? C.accent : C.muted,
                background: value === "" ? C.accentSoft : "transparent",
                cursor: "pointer",
                borderBottom: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = value === "" ? C.accentSoft : "transparent"}
            >
              — None —
            </div>

            {departments.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: C.muted }}>No departments found</div>
            ) : (
              departments.map((dept) => {
                const isSelected = String(dept.id) === String(value);
                return (
                  <div
                    key={dept.id}
                    onClick={() => { onChange(dept.id); setOpen(false); }}
                    style={{
                      padding: "10px 14px", fontSize: 13,
                      color: isSelected ? C.accent : C.text,
                      background: isSelected ? C.accentSoft : "transparent",
                      cursor: "pointer",
                      borderBottom: `1px solid ${C.border}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = C.surfaceHover; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {dept.name}
                    </span>
                    {isSelected && <span style={{ fontSize: 10, flexShrink: 0 }}>✓</span>}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════ */
const Courses = () => {
  const [state, setState] = useState({ search: "", perPage: 10, currentPage: 1 });
  const [courseData, setCourseData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({ id: "", name: "", department_id: "", is_active: 1 });
  const [isEdit, setIsEdit] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // ── Delete modal state ──
  const [openModal, setOpenModal] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState(null);

  let token = localStorage.getItem("token");

  /* ── Add Course ── */
  const addCourse = async () => {
    if (!course.name.trim()) { toast.warning("Please enter course name."); return; }
    if (!course.department_id) { toast.warning("Please select a department."); return; }
    try {
      setLoading(true);
      const res = await axios.post("/course/add-course",
        { name: course.name.trim(), department_id: Number(course.department_id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 1) {
        toast.success(res.data.message || "Course added successfully.");
        setShowDrawer(false);
        setCourse({ id: "", name: "", department_id: "", is_active: 1 });
        getCourses();
      } else { toast.warning(res.data.message); }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to create course.");
    } finally { setLoading(false); }
  };

  /* ── Department Dropdown ── */
  const getDepartmentDropdown = async () => {
    try {
      setDropdownLoading(true);
      const res = await axios.get("/department/get-department-dropdown", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) { setDepartments(res.data.data || []); }
      else { setDepartments([]); }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      } setDepartments([]);
    }
    finally { setDropdownLoading(false); }
  };

  /* ── Get All Courses ── */
  const getCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/course/get-course", {
        params: { searchParam: state.search || null, page: state.currentPage, limit: state.perPage },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) {
        setCourseData(res.data.data || []);
        setTotalRecords(res.data.data.count || 0);
      } else { setCourseData([]); setTotalRecords(0); }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      } setCourseData([]); setTotalRecords(0);
    }
    finally { setLoading(false); }
  };

  /* ── Handle Edit ── */
  const handleEdit = (crs) => {
    setIsEdit(true);
    setCourse({ id: crs.id, name: crs.name, department_id: crs.department_id || "", is_active: crs.is_active ?? 1 });
    getDepartmentDropdown();
    setShowDrawer(true);
  };

  /* ── Update Course ── */
  const updateCourse = async () => {
    if (!course.name.trim()) { toast.warning("Course name is required."); return; }
    try {
      setLoading(true);
      const res = await axios.put("/course/update-course",
        { id: course.id, name: course.name, department_id: course.department_id ? String(course.department_id) : null, is_active: course.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 1) {
        toast.success(res.data.message);
        setShowDrawer(false); setIsEdit(false);
        setCourse({ id: "", name: "", department_id: "", is_active: 1 });
        getCourses();
      } else { toast.success(res.data.message); }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to update course.");
    } finally { setLoading(false); }
  };

  /* ── Delete Course ── */
  const deleteCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`/course/delete-course?id=${courseIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) {
        toast.success(res.data.message);
        getCourses();
      } else { toast.warning(res.data.message); }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to delete course.");
    } finally {
      setLoading(false);
      setOpenModal(false);
      setCourseIdToDelete(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { getCourses(); }, 500);
    return () => clearTimeout(timer);
  }, [state.search, state.currentPage, state.perPage]);

  const rows = courseData;
  const hasRows = rows?.rows?.length > 0;

  const totalPages = Math.ceil(totalRecords / state.perPage) || 1;

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .txn-table-wrap::-webkit-scrollbar { width: 5px; height: 5px; }
        .txn-table-wrap::-webkit-scrollbar-track { background: ${C.surface}; }
        .txn-table-wrap::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        .txn-row:hover td { background: ${C.surfaceHover} !important; }
        .txn-filter-select:focus { outline: none; border-color: ${C.accent} !important; }
        .txn-search-input:focus { outline: none; }
        .txn-filter-select option { background: ${C.surface}; color: ${C.text}; }
      `}</style>

      <DashboardLayout>
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", padding: "28px 24px", color: C.text }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", overflow: "hidden" }}>

            {/* ══ STICKY HEADER ══ */}
            <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Courses</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>List of all Courses</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0 12px", gap: 8, transition: "border-color .2s", minWidth: 200 }}
                  onFocusCapture={(e) => e.currentTarget.style.borderColor = C.accent}
                  onBlurCapture={(e) => e.currentTarget.style.borderColor = C.border}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={C.muted}>
                    <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                  </svg>
                  <input
                    className="txn-search-input"
                    type="text"
                    placeholder="Search courses…"
                    value={state.search}
                    onChange={(e) => setState({ ...state, search: e.target.value, currentPage: 1 })}
                    style={{ background: "transparent", border: "none", color: C.text, fontSize: 13, padding: "9px 0", width: "100%" }}
                  />
                  {state.search && (
                    <button onClick={() => setState({ ...state, search: "", currentPage: 1 })}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
                  )}
                </div>
                <button
                  className="px-3 py-2 rounded-3"
                  style={{ color: "#acafbfdc", backgroundColor: "#0d0f1a", border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer" }}
                  onClick={() => { setIsEdit(false); setCourse({ id: "", name: "", department_id: "", is_active: 1 }); getDepartmentDropdown(); setShowDrawer(true); }}
                >
                  + Add Course
                </button>
                {state.search && (
                  <button
                    onClick={() => setState({ ...state, search: "", currentPage: 1 })}
                    style={{ background: C.accentSoft, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >Clear filters</button>
                )}
              </div>
            </div>

            {/* ══ SCROLLABLE TABLE ══ */}
            <div className="txn-table-wrap" style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 800 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {COLS.map((col) => (
                        <th key={col} style={{ position: "sticky", top: 0, zIndex: 2, background: C.bg, padding: "12px 16px", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "left" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                    ) : hasRows ? (
                      rows.rows.map((crs, index) => (
                        <tr key={crs.id} className="txn-row">
                          <td style={tdStyle}>{(state.currentPage - 1) * state.perPage + index + 1}</td>
                          <td style={tdStyle}>{crs.name}</td>
                          <td style={tdStyle}>{crs.department?.name || "-"}</td>
                          <td style={tdStyle}>{crs.member ?? "0"}</td>
                          <td style={tdStyle}>{new Date(crs.createdAt).toLocaleDateString()}</td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <button
                                onClick={() => handleEdit(crs)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: C.accentSoft, color: C.accent, border: `1px solid ${C.accent}55`, borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                              >✏️ Edit</button>
                              {/* ── opens modal instead of window.confirm ── */}
                              <button
                                onClick={() => { setCourseIdToDelete(crs.id); setOpenModal(true); }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: C.redSoft, color: C.red, border: `1px solid ${C.red}55`, borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                              >🗑 Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>No Courses Found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </SkeletonTheme>
            </div>

            {/* ══ STICKY FOOTER / PAGINATION ══ */}
            <div style={{
              padding: "12px 20px",
              borderTop: `1px solid ${C.border}`,
              flexShrink: 0, background: C.surface,
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 10,
            }}>
              {/* Left: rows per page + count */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Rows per page</span>
                  <select
                    className="txn-filter-select"
                    value={state.perPage}
                    onChange={(e) => setState({ ...state, perPage: Number(e.target.value), currentPage: 1 })}
                    style={{
                      background: C.bg, border: `1px solid ${C.border}`, color: C.text,
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                    }}
                  >
                    {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <span style={{ fontSize: 12, color: C.muted }}>
                  Page {state.currentPage} of {totalPages || 1}
                </span>
              </div>

              {/* Right: Prev / Next */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setState((s) => ({ ...s, currentPage: Math.max(1, s.currentPage - 1) }))}
                  disabled={state.currentPage === 1}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: C.surfaceHover,
                    color: state.currentPage === 1 ? C.muted : C.text,
                    border: `1px solid ${C.border}`,
                    cursor: state.currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: state.currentPage === 1 ? 0.5 : 1,
                  }}
                >← Prev</button>
                <button
                  onClick={() => setState((s) => ({ ...s, currentPage: Math.min(totalPages, s.currentPage + 1) }))}
                  disabled={state.currentPage >= totalPages}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: C.surfaceHover,
                    color: state.currentPage >= totalPages ? C.muted : C.text,
                    border: `1px solid ${C.border}`,
                    cursor: state.currentPage >= totalPages ? "not-allowed" : "pointer",
                    opacity: state.currentPage >= totalPages ? 0.5 : 1,
                  }}
                >Next →</button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* ══ DRAWER ══ */}
      {showDrawer && (
        <div onClick={() => setShowDrawer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 0, width: 420, height: "100%", background: "#141628", borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, color: "#fff" }}>{isEdit ? "Edit Course" : "Add Course"}</h4>
              <button onClick={() => setShowDrawer(false)} style={{ background: "transparent", border: 0, color: "#999", fontSize: 24, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#ddd", fontSize: 14 }}>Course Name</label>
                <input value={course.name} onChange={(e) => setCourse({ ...course, name: e.target.value })} placeholder="e.g. BSC.IT"
                  style={{ width: "100%", padding: 12, background: "#0D0F1A", color: "#fff", border: `1px solid ${C.border}`, borderRadius: 8 }} />
              </div>
              <DepartmentDropdown
                departments={departments}
                dropdownLoading={dropdownLoading}
                value={course.department_id}
                onChange={(val) => setCourse({ ...course, department_id: val })}
              />
              {/* {isEdit && (
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#ddd", fontSize: 14 }}>Status</label>
                  <select value={course.is_active} onChange={(e) => setCourse({ ...course, is_active: Number(e.target.value) })}
                    style={{ width: "100%", padding: "12px", background: "#0D0F1A", color: "#fff", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              )} */}
            </div>
            <div style={{ marginTop: "auto", padding: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => { setShowDrawer(false); setIsEdit(false); }}
                style={{ padding: "10px 18px", background: "#1d2138", color: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => isEdit ? updateCourse() : addCourse()} disabled={loading}
                style={{ padding: "10px 18px", background: loading ? "#555" : "#6C63FF", color: "#fff", border: 0, borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving..." : isEdit ? "Update Course" : "Save Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {openModal && (
        <div
          onClick={() => { setOpenModal(false); setCourseIdToDelete(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#141628", border: `1px solid ${C.border}`, borderRadius: 14, width: 420, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🗑</div>
                <h5 style={{ margin: 0, color: C.text, fontSize: 16, fontWeight: 700 }}>Delete Course</h5>
              </div>
              <button
                onClick={() => { setOpenModal(false); setCourseIdToDelete(null); }}
                style={{ background: "transparent", border: 0, color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}
              >×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 22px" }}>
              <p style={{ margin: 0, color: C.label, fontSize: 14, lineHeight: 1.6 }}>
                Are you sure you want to delete this course? <br />
                <span style={{ color: C.muted, fontSize: 12 }}>This action cannot be undone.</span>
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => { setOpenModal(false); setCourseIdToDelete(null); }}
                style={{ padding: "9px 20px", background: "#1d2138", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={deleteCourse}
                disabled={loading}
                style={{ padding: "9px 20px", background: loading ? "#555" : C.red, color: "#fff", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >{loading ? "Deleting..." : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: 13,
  color: "#E8EAF6",
  borderBottom: "1px solid #252A45",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 200,
};

export default Courses;