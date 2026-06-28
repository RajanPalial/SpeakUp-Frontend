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

/* ─── Block badge ─── */
const BlockBadge = ({ isBlock }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: ".05em",
    background: isBlock ? C.redSoft : C.greenSoft,
    color: isBlock ? C.red : C.green,
    border: `1px solid ${isBlock ? C.red : C.green}22`,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: isBlock ? C.red : C.green,
      flexShrink: 0,
    }} />
    {isBlock ? "Blocked" : "Active"}
  </span>
);

/* ─── skeleton row ─── */
const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <Skeleton height={16} borderRadius={6} />
      </td>
    ))}
  </tr>
);

const COLS = ["S.No", "Name", "Email", "Phone", "Department", "Course", "Sem", "Status", "Action"];

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: "block", marginBottom: 8, color: "#ddd", fontSize: 14 }}>
      {label}
    </label>
    {children}
  </div>
);

/* ─── Reusable custom scrollable dropdown ─── */
const CustomDropdown = ({ label, options, value, onChange, loading, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.id) === String(value));

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <label style={{ display: "block", marginBottom: 8, color: "#ddd", fontSize: 14 }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => !loading && setOpen((o) => !o)}
        style={{
          width: "100%", padding: "11px 12px",
          background: "#0D0F1A",
          color: selected ? "#fff" : C.muted,
          border: `1px solid ${open ? C.accent : C.border}`,
          borderRadius: 8, fontSize: 13,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          userSelect: "none", transition: "border-color .2s", boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {loading ? "Loading..." : (selected ? selected.name : placeholder)}
        </span>
        <span style={{
          marginLeft: 8, fontSize: 10, color: C.muted, flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
        }}>▼</span>
      </div>

      {/* Dropdown list */}
      {open && !loading && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)",
            left: 0, right: 0,
            background: "#0D0F1A",
            border: `1px solid ${C.accent}`,
            borderRadius: 8, zIndex: 2,
            maxHeight: 220, overflowY: "auto",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}>
            {/* None option */}
            <div
              onClick={() => { onChange(""); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 13,
                color: value === "" ? C.accent : C.muted,
                background: value === "" ? C.accentSoft : "transparent",
                cursor: "pointer", borderBottom: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = value === "" ? C.accentSoft : "transparent"}
            >
              — None —
            </div>

            {options.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: C.muted }}>No options found</div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <div
                    key={opt.id}
                    onClick={() => { onChange(opt.id); setOpen(false); }}
                    style={{
                      padding: "10px 14px", fontSize: 13,
                      color: isSelected ? C.accent : C.text,
                      background: isSelected ? C.accentSoft : "transparent",
                      cursor: "pointer", borderBottom: `1px solid ${C.border}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = C.surfaceHover; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opt.name}
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
const Users = () => {
  const [state, setState] = useState({
    search: "",
    perPage: 10,
    currentPage: 1,
  });
  const [userData, setUserData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(null); // stores id being toggled

  const [user, setUser] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_no: "",
    department_id: "",
    course_id: "",
    sem: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  let token = localStorage.getItem("token");

  /* ── Dropdowns ── */
  const getDropdowns = async () => {
    try {
      setDropdownLoading(true);
      const [deptRes, courseRes] = await Promise.all([
        axios.get("/department/get-department-dropdown", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/course/get-course-dropdown", {
          params: { searchParam: "" },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDepartments(deptRes.data.status === 1 ? deptRes.data.data : []);
      setCourses(courseRes.data.status === 1 ? courseRes.data.data : []);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      setDepartments([]);
      setCourses([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  /* ── Get All Users ── */
  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/user/get-user", {
        params: {
          searchParam: state.search || "",
          page: state.currentPage,
          limit: state.perPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setUserData(res.data.data || []);
        setTotalRecords(res.data.data.count || 0);
      } else {
        setUserData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      setUserData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  /* ── Add User ── */
  const addUser = async () => {
    const { first_name, last_name, email, phone_no, department_id, course_id, sem } = user;
    if (!first_name.trim() || !email.trim() || !phone_no.trim()) {
      toast.warning("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "/user/add-user",
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          phone_no: phone_no.trim(),
          department_id: department_id ? Number(department_id) : null,
          course_id: course_id ? Number(course_id) : null,
          sem: sem ? Number(sem) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 1) {
        toast.success(res.data.message || "User added successfully.");
        setShowDrawer(false);
        resetForm();
        getUsers();
      } else {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to create user.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Update User ── */
  const updateUser = async () => {
    if (!user.first_name.trim() || !user.email.trim()) {
      toast.warning("First name and email are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        "/user/update-user",
        {
          id: String(user.id),
          first_name: user.first_name.trim(),
          last_name: user.last_name.trim(),
          email: user.email.trim(),
          phone_no: user.phone_no.trim(),
          department_id: user.department_id ? Number(user.department_id) : null,
          course_id: user.course_id ? Number(user.course_id) : null,
          sem: user.sem ? Number(user.sem) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 1) {
        toast.success(res.data.message);
        setShowDrawer(false);
        setIsEdit(false);
        resetForm();
        getUsers();
      } else {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to update user.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Block / Unblock ── */
  const toggleBlock = async (id) => {
    try {
      setBlockLoading(id);
      const res = await axios.put(
        `/user/block-unblock-user?id=${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 1) {
        getUsers();
      } else {
        toast.success(res.data.message);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      toast.error(error.response?.data?.message || "Unable to update user status.");
    } finally {
      setBlockLoading(null);
    }
  };

  /* ── Helpers ── */
  const resetForm = () => {
    setUser({
      id: "", first_name: "", last_name: "",
      email: "", phone_no: "",
      department_id: "", course_id: "", sem: "",
    });
  };

  const handleEdit = (u) => {
    setIsEdit(true);
    setUser({
      id: u.id,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      email: u.email || "",
      phone_no: u.phone_no || "",
      department_id: u.department_id || "",
      course_id: u.course_id || "",
      sem: u.sem || "",
    });
    getDropdowns();
    setShowDrawer(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => getUsers(), 500);
    return () => clearTimeout(timer);
  }, [state.search, state.currentPage, state.perPage]);

  const rows = userData?.rows ?? [];
  const hasRows = rows.length > 0;
  const totalPages = Math.ceil(totalRecords / state.perPage) || 1;

  const inputStyle = {
    width: "100%",
    padding: 12,
    background: "#0D0F1A",
    color: "#fff",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
  };

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
        input::placeholder { color: #4B5268; }
        select option { background: #0D0F1A; color: #E8EAF6; }
      `}</style>

      <DashboardLayout>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          background: C.bg,
          minHeight: "100vh",
          padding: "28px 24px",
          color: C.text,
        }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 100px)",
            overflow: "hidden",
          }}>

            {/* ══ HEADER ══ */}
            <div style={{
              padding: "20px 22px 16px",
              borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Users</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                  {hasRows && !loading ? `${totalRecords} users found` : "Manage all users"}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{
                  display: "flex", alignItems: "center",
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "0 12px", gap: 8,
                  transition: "border-color .2s", minWidth: 220,
                }}
                  onFocusCapture={(e) => e.currentTarget.style.borderColor = C.accent}
                  onBlurCapture={(e) => e.currentTarget.style.borderColor = C.border}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={C.muted}>
                    <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                  </svg>
                  <input
                    className="txn-search-input"
                    type="text"
                    placeholder="Search users…"
                    value={state.search}
                    onChange={(e) => setState({ ...state, search: e.target.value, currentPage: 1 })}
                    style={{
                      background: "transparent", border: "none",
                      color: C.text, fontSize: 13, padding: "9px 0", width: "100%",
                    }}
                  />
                  {state.search && (
                    <button
                      onClick={() => setState({ ...state, search: "", currentPage: 1 })}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0 }}
                    >✕</button>
                  )}
                </div>

                {/* Add Button */}
                <button
                  style={{
                    color: "#acafbfdc", backgroundColor: "#0d0f1a",
                    border: `1px solid ${C.border}`, fontSize: 13,
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                  }}
                  onClick={() => {
                    setIsEdit(false);
                    resetForm();
                    getDropdowns();
                    setShowDrawer(true);
                  }}
                >
                  + Add User
                </button>

                {state.search && (
                  <button
                    onClick={() => setState({ ...state, search: "", currentPage: 1 })}
                    style={{
                      background: C.accentSoft, border: `1px solid ${C.accent}33`,
                      color: C.accent, borderRadius: 8, padding: "8px 12px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* ══ TABLE ══ */}
            <div className="txn-table-wrap" style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {COLS.map((col) => (
                        <th key={col} style={{
                          position: "sticky", top: 0, zIndex: 2,
                          background: C.bg, padding: "12px 16px",
                          fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                          textTransform: "uppercase", color: C.muted,
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: "nowrap", textAlign: "left",
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                    ) : hasRows ? (
                      rows.map((u, index) => (
                        <tr key={u.id} className="txn-row">
                          <td style={tdStyle}>{(state.currentPage - 1) * state.perPage + index + 1}</td>
                          <td style={tdStyle}>{`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "—"}</td>
                          <td style={{ ...tdStyle, color: C.label }}>{u.email || "—"}</td>
                          <td style={tdStyle}>{u.phone_no || "—"}</td>
                          <td style={tdStyle}>{u.department?.name || "—"}</td>
                          <td style={tdStyle}>{u.course?.name || "—"}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{u.sem ?? "—"}</td>
                          <td style={tdStyle}><BlockBadge isBlock={u.is_block} /></td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              {/* Edit */}
                              <button
                                onClick={() => handleEdit(u)}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  padding: "6px 12px", background: C.accentSoft,
                                  color: C.accent, border: `1px solid ${C.accent}55`,
                                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                }}
                              >
                                ✏️ Edit
                              </button>

                              {/* Block / Unblock */}
                              <button
                                onClick={() => toggleBlock(u.id)}
                                disabled={blockLoading === u.id}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  padding: "6px 12px",
                                  background: u.is_block ? C.greenSoft : C.redSoft,
                                  color: u.is_block ? C.green : C.red,
                                  border: `1px solid ${u.is_block ? C.green : C.red}55`,
                                  borderRadius: 8, fontSize: 12, fontWeight: 600,
                                  cursor: blockLoading === u.id ? "not-allowed" : "pointer",
                                  opacity: blockLoading === u.id ? 0.6 : 1,
                                }}
                              >
                                {blockLoading === u.id
                                  ? "..."
                                  : u.is_block
                                    ? "✅ Unblock"
                                    : "🚫 Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={COLS.length} style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                          <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.label }}>No users found</p>
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>
                            Add a user or try a different search
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </SkeletonTheme>
            </div>

            {/* ══ FOOTER / PAGINATION ══ */}
            <div style={{
              padding: "12px 20px",
              borderTop: `1px solid ${C.border}`,
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: C.surface,
            }}>
              {/* Left: rows per page + page count */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Rows per page</span>
                  <select
                    className="txn-filter-select"
                    value={state.perPage}
                    onChange={(e) => setState({ ...state, perPage: Number(e.target.value), currentPage: 1 })}
                    style={{
                      background: C.bg, border: `1px solid ${C.border}`,
                      color: C.text, borderRadius: 8, padding: "5px 10px",
                      fontSize: 12, cursor: "pointer",
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
        <div
          onClick={() => setShowDrawer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 999 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", right: 0, top: 0,
              width: 460, height: "100%",
              background: "#141628", borderLeft: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: 20, borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "sticky", top: 0, background: "#141628", zIndex: 1,
            }}>
              <h4 style={{ margin: 0, color: "#fff" }}>
                {isEdit ? "Edit User" : "Add User"}
              </h4>
              <button
                onClick={() => { setShowDrawer(false); setIsEdit(false); }}
                style={{ background: "transparent", border: 0, color: "#999", fontSize: 24, cursor: "pointer" }}
              >×</button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Row: First + Last name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="First Name *">
                  <input
                    value={user.first_name}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    placeholder="First name"
                    style={inputStyle}
                  />


                </Field>
                <Field label="Last Name">
                  <input
                    value={user.last_name}
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Email *">
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="email@example.com"
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone Number *">
  <input
    type="tel"
    value={user.phone_no}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // remove non-numeric
      setUser({ ...user, phone_no: value });
    }}
    placeholder="10-digit phone number"
    style={inputStyle}
    maxLength={10}
  />
</Field>

              <CustomDropdown
                label="Department"
                options={departments}
                value={user.department_id}
                onChange={(val) => setUser({ ...user, department_id: val })}
                loading={dropdownLoading}
                placeholder="Select Department"
              />

              <CustomDropdown
                label="Course"
                options={courses}
                value={user.course_id}
                onChange={(val) => setUser({ ...user, course_id: val })}
                loading={dropdownLoading}
                placeholder="Select Course"
              />

              <Field label="Semester">
  <input
    type="number"
    min={1}
    max={6}
    value={user.sem}
    onChange={(e) => {
      let value = Number(e.target.value);

      // enforce range 1–6
      if (value > 6) value = 6;
      if (value < 1) value = "";

      setUser({ ...user, sem: value });
    }}
    placeholder="e.g. 3"
    style={inputStyle}
  />
</Field>
            </div>

            {/* Drawer Footer */}
            <div style={{
              marginTop: "auto", padding: 20,
              borderTop: `1px solid ${C.border}`,
              display: "flex", justifyContent: "flex-end", gap: 12,
              position: "sticky", bottom: 0, background: "#141628",
            }}>
              <button
                onClick={() => { setShowDrawer(false); setIsEdit(false); }}
                style={{
                  padding: "10px 18px", background: "#1d2138",
                  color: "#fff", border: `1px solid ${C.border}`,
                  borderRadius: 8, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => isEdit ? updateUser() : addUser()}
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  background: loading ? "#555" : "#6C63FF",
                  color: "#fff", border: 0, borderRadius: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : isEdit ? "Update User" : "Save User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* shared td style */
const tdStyle = {
  padding: "14px 16px",
  fontSize: 13,
  color: "#E8EAF6",
  borderBottom: "1px solid #252A45",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 180,
};

export default Users;