import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "../../api/axios";
import { toast } from "react-toastify";

/* ─── design tokens ─── */
const C = {
  bg: "#0D0F1A", surface: "#141628", surfaceHover: "#1A1E35",
  border: "#252A45", accent: "#6C63FF", accentSoft: "rgba(108,99,255,0.12)",
  green: "#22D3A4", greenSoft: "rgba(34,211,164,0.10)",
  red: "#FF5E7D", redSoft: "rgba(255,94,125,0.10)",
  amber: "#F59E0B", amberSoft: "rgba(245,158,11,0.10)",
  blue: "#38BDF8", blueSoft: "rgba(56,189,248,0.10)",
  text: "#E8EAF6", muted: "#6B7280", label: "#A0A8C8",
};

const STEP = { IDLE: "idle", OTP_SENT: "otp_sent", SUCCESS: "success" };



const Pill = ({ children, color, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 20, fontSize: 11,
    fontWeight: 600, letterSpacing: ".04em",
    background: bg, color, border: `1px solid ${color}33`,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
    {children}
  </span>
);

/* ─── Content Moderation Modal ─── */
const ModerationModal = ({ result, onClose }) => {
  if (!result) return null;
  const { flagged, student, categories, category_scores } = result;

  const scoreColor = (score) => {
    if (score >= 0.7) return C.red;
    if (score >= 0.4) return C.amber;
    return C.green;
  };

  const scoreBg = (score) => {
    if (score >= 0.7) return C.redSoft;
    if (score >= 0.4) return C.amberSoft;
    return C.greenSoft;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        zIndex: 1100, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, width: 500, maxWidth: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: C.surface, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: flagged ? C.redSoft : C.greenSoft,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {flagged ? "🚨" : "✅"}
            </div>
            <div>
              <h5 style={{ margin: 0, color: C.text, fontSize: 16, fontWeight: 700 }}>
                Content Moderation Report
              </h5>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>AI-powered content analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: 0, color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Overall verdict */}
          <div style={{
            padding: "14px 18px", borderRadius: 10,
            background: flagged ? C.redSoft : C.greenSoft,
            border: `1px solid ${flagged ? C.red : C.green}44`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{flagged ? "⚠️" : "✅"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: flagged ? C.red : C.green }}>
                {flagged ? "Content Flagged" : "Content Clean"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>
                {flagged
                  ? "This ticket contains potentially harmful content."
                  : "No harmful content detected in this ticket."}
              </p>
            </div>
          </div>

          {/* Student info */}
          {student && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>
                Student Info
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {[
                  ["Name", `${student.first_name} ${student.last_name}`],
                  ["Email", student.email],
                  ["Phone", student.phone_no],
                  ["Semester", student.sem ?? "—"],
                  ["Department", student.department?.name ?? "—"],
                  ["Course", student.course?.name ?? "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: C.text }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category flags */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>
              Category Analysis
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(category_scores || {}).map(([cat, score]) => {
                const pct = Math.round(score * 100);
                const isFlagged = categories?.[cat];
                return (
                  <div key={cat} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: C.text, fontWeight: 600, textTransform: "capitalize" }}>
                          {cat}
                        </span>
                        {isFlagged && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px",
                            borderRadius: 20, background: C.redSoft, color: C.red,
                            border: `1px solid ${C.red}33`, letterSpacing: ".05em",
                          }}>FLAGGED</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: scoreColor(score),
                        background: scoreBg(score),
                        padding: "2px 10px", borderRadius: 20,
                        border: `1px solid ${scoreColor(score)}33`,
                      }}>
                        {pct}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: scoreColor(score),
                        borderRadius: 4,
                        transition: "width .4s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 22px", background: C.surfaceHover,
              color: C.text, border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >Close</button>
        </div>
      </div>
    </div>
  );
};

const TICKET_STATUS = {
  1: { label: "New", color: C.amber, bg: C.amberSoft },
  2: { label: "In Progress", color: C.blue, bg: C.blueSoft },
  3: { label: "Closed", color: C.muted, bg: C.surfaceHover },
};

/* ════════════════════════════════════════════════════════
   ADMIN VIEW — full ticket list
════════════════════════════════════════════════════════ */
const AdminTicketList = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null); // stores ticket id with open dropdown
  const [statusUpdating, setStatusUpdating] = useState(null); // stores ticket id being updated
  const [moderationResult, setModerationResult] = useState(null); // stores API result
  const [moderationLoading, setModerationLoading] = useState(null); // stores ticket id being checked

  const STATUS_OPTIONS = [
    { label: "New", value: 1, color: C.amber, bg: C.amberSoft },
    { label: "In Progress", value: 2, color: C.blue, bg: C.blueSoft },
    { label: "Resolved", value: 3, color: C.green, bg: C.greenSoft },
  ];

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setStatusUpdating(ticketId);
      const res = await axios.put(
        "/student/update-ticket-status",
        { id: ticketId, ticket_status: newStatus },
        { headers }
      );
      if (res.data.status === 1 || res.data.status === true) {
        // Optimistically update local state
        setTickets((prev) =>
          prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t)
        );
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
    } finally {
      setStatusUpdating(null);
      setActiveDropdown(null);
    }
  };

  const checkContent = async (ticket) => {
    try {
      setModerationLoading(ticket.id);
      setActiveDropdown(null);
      const res = await axios.post(
        "/student/check",
        { text: ticket.text || ticket.message || "", user_id: String(ticket.user_id || ticket.userId || "") },
        { headers }
      );
      if (res.data.success || res.data.data) {
        setModerationResult(res.data.data);
      } else {
        toast.success(res.data.message || "Moderation check failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to check content.");
    } finally {
      setModerationLoading(null);
    }
  };

  const getTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/student/get-tickets", {
        params: { searchParam: search || null, page: currentPage, limit: perPage },
        headers,
      });
      if (res.data.status === 1) {
        setTickets(res.data.data?.rows || res.data.data || []);
        setTotalRecords(res.data.data.count || 0);
      } else {
        setTickets([]);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(getTickets, 400);
    return () => clearTimeout(t);
  }, [search, currentPage]);

  useEffect(() => {
    const handler = () => setActiveDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const totalPages = Math.ceil(totalRecords / perPage);

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: C.bg, minHeight: "100vh",
      padding: "28px 24px", color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .tkt-row:hover td { background: ${C.surfaceHover} !important; }
        .tkt-search:focus { outline: none; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 18, display: "flex", flexDirection: "column",
        height: "calc(100vh - 100px)", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0, display: "flex",
          justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>🎫 All Tickets</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
              {loading ? "Loading…" : `${totalRecords} ticket${totalRecords !== 1 ? "s" : ""} total`}
            </p>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center",
            background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "0 12px", gap: 8, minWidth: 240,
            transition: "border-color .2s",
          }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = C.accent)}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.muted}>
              <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
            </svg>
            <input
              className="tkt-search"
              type="text"
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                background: "transparent", border: "none",
                color: C.text, fontSize: 13, padding: "9px 0", width: "100%",
              }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setCurrentPage(1); }}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0 }}>✕</button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["S.No", "Message", "Status", "Created On", "Action"].map((col) => (
                  <th key={col} style={{
                    position: "sticky", top: 0, zIndex: 2, background: C.bg,
                    padding: "12px 16px", fontSize: 11, fontWeight: 700,
                    letterSpacing: ".08em", textTransform: "uppercase",
                    color: C.muted, borderBottom: `1px solid ${C.border}`,
                    textAlign: "left", whiteSpace: "nowrap",
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: C.border, opacity: 0.5 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tickets.length > 0 ? (
                tickets.map((t, index) => {
                  const s = TICKET_STATUS[t.status] ?? TICKET_STATUS[0];
                  return (
                    <tr key={t.id} className="tkt-row">
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.label }}>{(currentPage - 1) * perPage + index + 1}</span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 300 }}>
                        <span style={{ color: C.label, fontSize: 13 }} title={t.text || t.message}>
                          {(t.text || t.message || "—").slice(0, 80)}{(t.text || t.message || "").length > 80 ? "…" : ""}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <Pill color={s.color} bg={s.bg}>{s.label}</Pill>
                      </td>
                      <td style={tdStyle}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>

                      {/* ── Action cell ── */}
                      <td style={{ ...tdStyle, overflow: "visible" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                            alignItems: "stretch",
                            width: "150px",
                          }}
                        >
                          {/* Action Button */}
                          <div
                            style={{ position: "relative", width: "100%" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setActiveDropdown(activeDropdown === t.id ? null : t.id)
                              }
                              disabled={statusUpdating === t.id}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                background: C.accentSoft,
                                color: C.accent,
                                border: `1px solid ${C.accent}55`,
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: statusUpdating === t.id ? "not-allowed" : "pointer",
                                opacity: statusUpdating === t.id ? 0.6 : 1,
                                transition: "all .15s",
                              }}
                            >
                              {statusUpdating === t.id ? "Updating..." : "Action"}

                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={C.accent}
                                strokeWidth="2.5"
                                style={{
                                  transform:
                                    activeDropdown === t.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  transition: "transform .2s",
                                }}
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>

                            {activeDropdown === t.id && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 6px)",
                                  left: 0,
                                  width: "100%",
                                  background: C.surface,
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 10,
                                  overflow: "hidden",
                                  zIndex: 100,
                                  boxShadow: "0 8px 24px rgba(0,0,0,.4)",
                                }}
                              >
                                {STATUS_OPTIONS.map((opt) => {
                                  const isCurrent = t.status === opt.value;

                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() =>
                                        !isCurrent && updateTicketStatus(t.id, opt.value)
                                      }
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 14px",
                                        background: isCurrent ? opt.bg : "transparent",
                                        border: "none",
                                        borderBottom: `1px solid ${C.border}`,
                                        color: isCurrent ? opt.color : C.text,
                                        fontSize: 13,
                                        fontWeight: isCurrent ? 600 : 400,
                                        cursor: isCurrent ? "default" : "pointer",
                                        textAlign: "left",
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          background: opt.color,
                                          flexShrink: 0,
                                        }}
                                      />
                                      {opt.label}

                                      {isCurrent && (
                                        <span
                                          style={{
                                            marginLeft: "auto",
                                            fontSize: 11,
                                            color: opt.color,
                                          }}
                                        >
                                          ✓ Current
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Check Abuse Button */}
                          <button
                            onClick={() => checkContent(t)}
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "8px 12px",
                              background: C.accentSoft,
                              color: C.accent,
                              border: `1px solid ${C.accent}55`,
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all .15s",
                            }}
                          >
                            Check Abuse
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.label }}>No tickets found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0, background: C.surface,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 10,
        }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Page {currentPage} of {totalPages || 1}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: C.surfaceHover, color: currentPage === 1 ? C.muted : C.text,
                border: `1px solid ${C.border}`, cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >← Prev</button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: C.surfaceHover, color: currentPage >= totalPages ? C.muted : C.text,
                border: `1px solid ${C.border}`, cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages ? 0.5 : 1,
              }}
            >Next →</button>
          </div>
        </div>
      </div>
      {/* ══ MODERATION RESULT MODAL ══ */}
      <ModerationModal
        result={moderationResult}
        onClose={() => setModerationResult(null)}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   USER VIEW — profile + ticket list + raise ticket modal
════════════════════════════════════════════════════════ */
const UserTicketView = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Ticket list ──
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ── Modal + raise-ticket flow ──
  const [showModal, setShowModal] = useState(false);
  const [ticketText, setTicketText] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(STEP.IDLE);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await axios.get("/student/my", { headers });
      if (res.data.status === 1) setProfile(res.data.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Get the logged-in user's tickets ── */
  const getMyTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await axios.get("/student/get-tickets", {
        params: { searchParam: search || null, page: currentPage, limit: perPage },
        headers,
      });
      if (res.data.status === 1) {
        setTickets(res.data.data?.rows || res.data.data || []);
        setTotalRecords(res.data.data.count || 0);
      } else {
        setTickets([]);
        setTotalRecords(0);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      setTickets([]);
      setTotalRecords(0);
    } finally {
      setTicketsLoading(false);
    }
  };

  const generateOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await axios.post("/student/generate-otp", {}, { headers });
      if (res.data.status === 1) {
        setStep(STEP.OTP_SENT);
        showToast(res.data.message || "OTP sent to your registered contact.");
      } else {
        showToast(res.data.message || "Failed to send OTP.", "error");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      showToast(error.response?.data?.message || "Unable to generate OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const createTicket = async () => {
    if (!ticketText.trim()) { showToast("Please describe your issue.", "error"); return; }
    if (!otp.trim()) { showToast("Please enter the OTP.", "error"); return; }
    try {
      setTicketLoading(true);
      const res = await axios.post(
        "/student/create-ticket",
        { text: ticketText.trim(), otp: Number(otp) },
        { headers }
      );
      if (res.data.status === 1) {
        setStep(STEP.SUCCESS);
        showToast(res.data.message || "Ticket created successfully!");
        setTicketText("");
        setOtp("");
        getMyTickets(); // refresh list
      } else {
        showToast(res.data.message || "Failed to create ticket.", "error");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
      showToast(error.response?.data?.message || "Unable to create ticket.", "error");
    } finally {
      setTicketLoading(false);
    }
  };

  /* ── Modal open / close helpers ── */
  const openModal = () => {
    setStep(STEP.IDLE);
    setTicketText("");
    setOtp("");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setStep(STEP.IDLE);
    setTicketText("");
    setOtp("");
  };

  useEffect(() => { getProfile(); }, []);

  useEffect(() => {
    const t = setTimeout(getMyTickets, 400);
    return () => clearTimeout(t);
  }, [search, currentPage]);

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: C.bg, minHeight: "100vh",
      padding: "28px 24px", color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .tkt-row:hover td { background: ${C.surfaceHover} !important; }
        .tkt-search:focus { outline: none; }
        @keyframes tktModalIn { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 24, zIndex: 9999,
          background: toast.type === "error" ? C.redSoft : C.greenSoft,
          color: toast.type === "error" ? C.red : C.green,
          border: `1px solid ${toast.type === "error" ? C.red : C.green}44`,
          borderRadius: 10, padding: "12px 20px", fontSize: 13,
          fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,.4)", maxWidth: 340,
        }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      <div>

        {/* ── RIGHT: My Tickets list ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 18, display: "flex", flexDirection: "column",
          height: "calc(100vh - 100px)", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`,
            flexShrink: 0, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>🎫 My Tickets</h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                {ticketsLoading ? "Loading…" : `${totalRecords} ticket${totalRecords !== 1 ? "s" : ""} total`}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 10, padding: "0 12px",
                gap: 8, minWidth: 200, transition: "border-color .2s",
              }}
                onFocusCapture={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onBlurCapture={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={C.muted}>
                  <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                </svg>
                <input
                  className="tkt-search"
                  type="text"
                  placeholder="Search tickets…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ background: "transparent", border: "none", color: C.text, fontSize: 13, padding: "9px 0", width: "100%" }}
                />
                {search && (
                  <button onClick={() => { setSearch(""); setCurrentPage(1); }}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 0 }}>✕</button>
                )}
              </div>

              {/* + Add Ticket */}
              <button
                onClick={openModal}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", background: C.accent, color: "#fff",
                  border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                + Add Ticket
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["ID", "Message", "Status", "Created On"].map((col) => (
                    <th key={col} style={{
                      position: "sticky", top: 0, zIndex: 2, background: C.bg,
                      padding: "12px 16px", fontSize: 11, fontWeight: 700,
                      letterSpacing: ".08em", textTransform: "uppercase",
                      color: C.muted, borderBottom: `1px solid ${C.border}`,
                      textAlign: "left", whiteSpace: "nowrap",
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ticketsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((__, j) => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: 14, borderRadius: 6, background: C.border, opacity: 0.5 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tickets.length > 0 ? (
                  tickets.map((t) => {
                    const s = TICKET_STATUS[t.status] ?? TICKET_STATUS[0];
                    return (
                      <tr key={t.id} className="tkt-row">
                        <td style={tdStyle}>
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: C.label }}>#{t.id}</span>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 320 }}>
                          <span style={{ color: C.label, fontSize: 13 }} title={t.text || t.message}>
                            {(t.text || t.message || "—").slice(0, 90)}{(t.text || t.message || "").length > 90 ? "…" : ""}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <Pill color={s.color} bg={s.bg}>{s.label}</Pill>
                        </td>
                        <td style={tdStyle}>
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.label }}>No tickets yet</p>
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>Click “+ Add Ticket” to raise your first one</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div style={{
            padding: "12px 20px", borderTop: `1px solid ${C.border}`,
            flexShrink: 0, background: C.surface, display: "flex",
            justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
          }}>
            <span style={{ fontSize: 12, color: C.muted }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: C.surfaceHover, color: currentPage === 1 ? C.muted : C.text,
                  border: `1px solid ${C.border}`, cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >← Prev</button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: C.surfaceHover, color: currentPage >= totalPages ? C.muted : C.text,
                  border: `1px solid ${C.border}`, cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                }}
              >Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ADD TICKET MODAL ══ */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 1050, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, width: 520, maxWidth: "100%",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: "tktModalIn .25s ease",
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, background: C.surface, zIndex: 1,
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>🎫 Raise a Ticket</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Describe your issue, verify with OTP, and submit.</p>
              </div>
              <button onClick={closeModal}
                style={{ background: "transparent", border: 0, color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "22px" }}>
              {/* Success */}
              {step === STEP.SUCCESS ? (
                <div style={{ background: C.greenSoft, border: `1px solid ${C.green}44`, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                  <h3 style={{ margin: "0 0 6px", color: C.green, fontSize: 16, fontWeight: 700 }}>Ticket Submitted!</h3>
                  <p style={{ margin: "0 0 16px", color: C.muted, fontSize: 13 }}>Your ticket has been created successfully.</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => { setStep(STEP.IDLE); }} style={{ padding: "9px 22px", background: "transparent", color: C.accent, border: `1px solid ${C.accent}55`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Raise Another
                    </button>
                    <button onClick={closeModal} style={{ padding: "9px 22px", background: C.accent, color: "#fff", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Step indicator */}
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ n: 1, label: "Describe Issue" }, { n: 2, label: "Verify OTP" }].map(({ n, label }) => {
                      const active = (n === 1 && step === STEP.IDLE) || (n === 2 && step === STEP.OTP_SENT);
                      const done = n === 1 && step === STEP.OTP_SENT;
                      return (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? C.green : active ? C.accent : C.border, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .3s" }}>
                            {done ? "✓" : n}
                          </div>
                          <span style={{ fontSize: 12, color: active || done ? C.text : C.muted, fontWeight: active ? 600 : 400 }}>{label}</span>
                          {n < 2 && <div style={{ width: 32, height: 1, background: C.border, margin: "0 4px" }} />}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: C.label }}>Describe your issue *</label>
                    <textarea
                      rows={5}
                      value={ticketText}
                      onChange={(e) => setTicketText(e.target.value)}
                      placeholder="Explain what's happening in detail…"
                      style={{ width: "100%", padding: 12, background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>

                  {step === STEP.OTP_SENT && (
                    <div style={{ background: C.amberSoft, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <p style={{ margin: 0, fontSize: 12, color: C.amber, fontWeight: 600 }}>🔐 OTP sent! Enter it below to verify and submit your ticket.</p>
                      <input
                        type="number"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        style={{ width: "100%", padding: "11px 14px", background: C.bg, color: C.text, border: `1px solid ${C.amber}55`, borderRadius: 8, fontSize: 18, fontWeight: 700, letterSpacing: 6, textAlign: "center", outline: "none", fontFamily: "monospace" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    {step === STEP.IDLE ? (
                      <>
                        <button onClick={closeModal} style={{ padding: "10px 18px", background: C.surfaceHover, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                        <button onClick={generateOtp} disabled={otpLoading || !ticketText.trim()} style={{ padding: "10px 22px", background: otpLoading || !ticketText.trim() ? C.border : C.accent, color: "#fff", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: otpLoading || !ticketText.trim() ? "not-allowed" : "pointer", opacity: otpLoading || !ticketText.trim() ? 0.6 : 1 }}>
                          {otpLoading ? "Sending OTP…" : "Send OTP →"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setStep(STEP.IDLE); setOtp(""); }} style={{ padding: "10px 18px", background: C.surfaceHover, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer" }}>← Back</button>
                        <button onClick={generateOtp} disabled={otpLoading} style={{ padding: "10px 18px", background: "transparent", color: C.accent, border: `1px solid ${C.accent}55`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: otpLoading ? "not-allowed" : "pointer" }}>
                          {otpLoading ? "Resending…" : "Resend OTP"}
                        </button>
                        <button onClick={createTicket} disabled={ticketLoading || !otp.trim()} style={{ padding: "10px 22px", background: ticketLoading || !otp.trim() ? C.border : C.accent, color: "#fff", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: ticketLoading || !otp.trim() ? "not-allowed" : "pointer", opacity: ticketLoading || !otp.trim() ? 0.6 : 1 }}>
                          {ticketLoading ? "Submitting…" : "Submit Ticket ✓"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   ROOT — reads is_admin and routes accordingly
════════════════════════════════════════════════════════ */
const TicketModule = () => {
  const isAdmin = localStorage.getItem('admin');

  return (
    <DashboardLayout>
      {isAdmin == 'true' ? <AdminTicketList /> : <UserTicketView />}
    </DashboardLayout>
  );
};

/* shared td style */
const tdStyle = {
  padding: "14px 16px", fontSize: 13, color: "#E8EAF6",
  borderBottom: "1px solid #252A45", verticalAlign: "middle",
  whiteSpace: "nowrap", overflow: "hidden",
  textOverflow: "ellipsis", maxWidth: 200,
};

export default TicketModule;