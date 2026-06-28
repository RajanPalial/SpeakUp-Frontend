import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ─── mock trend data ─── */
const stakeTrend = [
  { month: "Jan", value: 12000 }, { month: "Feb", value: 19500 },
  { month: "Mar", value: 15800 }, { month: "Apr", value: 23400 },
  { month: "May", value: 28900 }, { month: "Jun", value: 34200 },
  { month: "Jul", value: 31000 },
];



const userActivity = [
  { day: "Mon", active: 42, inactive: 18 }, { day: "Tue", active: 55, inactive: 12 },
  { day: "Wed", active: 38, inactive: 22 }, { day: "Thu", active: 67, inactive: 9 },
  { day: "Fri", active: 74, inactive: 15 }, { day: "Sat", active: 48, inactive: 31 },
  { day: "Sun", active: 29, inactive: 20 },
];

/* ─── design tokens ─── */
const C = {
  bg: "#0D0F1A", surface: "#141628", surfaceHover: "#1A1E35",
  border: "#252A45", accent: "#6C63FF", accentGlow: "rgba(108,99,255,0.18)",
  accentSoft: "rgba(108,99,255,0.12)", green: "#22D3A4",
  greenSoft: "rgba(34,211,164,0.12)", red: "#FF5E7D",
  redSoft: "rgba(255,94,125,0.12)", amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.12)", text: "#E8EAF6",
  muted: "#6B7280", label: "#A0A8C8",
};

const PIE_COLORS = [C.green, C.accent, C.red, C.amber];

const fmt = (n) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
      : String(n ?? 0);

/* ─── Shared sub-components ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.text }}>
      <p style={{ color: C.muted, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, icon, color, colorSoft, loading, sub }) => (
  <div
    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, transition: "border-color .2s", flex: "1 1 200px", minWidth: 0 }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = color || C.accent)}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.label }}>{label}</p>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: colorSoft || C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</span>
    </div>
    {loading ? (
      <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}><Skeleton height={32} borderRadius={8} /></SkeletonTheme>
    ) : (
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-.02em", lineHeight: 1 }}>{fmt(value ?? 0)}</h2>
    )}
    {sub && <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{sub}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ margin: "0 0 20px", fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.label }}>{children}</h3>
);

const Panel = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 20px", ...style }}>{children}</div>
);

/* ══════════════════════════════════════════════
   USER DASHBOARD (non-admin)
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   USER DASHBOARD (non-admin)
══════════════════════════════════════════════ */
const UserDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* ── Fetch profile from /student/my ── */
  const getProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await axios.get("/student/my", { headers });
      if (res.data.status === 1) {
        setProfile(res.data.data);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }

    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Fetch recent tickets ── */
  const getTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/student/get-tickets", {
        params: { page: 1, limit: 5 },
        headers,
      });
      if (res.data.status === 1) {
        setTickets(res.data.data?.rows || res.data.data || []);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    getTickets();
  }, []);

  const TICKET_STATUS = {
    1: { label: "New", color: C.amber, bg: C.amberSoft },
    2: { label: "In Progress", color: C.accent, bg: C.accentSoft },
    3: { label: "Closed", color: C.muted, bg: C.surfaceHover },
  };

  const avatarLetter = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() ||
    (profile.email?.[0] || "U").toUpperCase()
    : "U";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", padding: "28px 24px", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""} 👋
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Here's what's happening with your account</p>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── LEFT: Profile Card ── */}
        <div style={{ flex: "0 0 300px", minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingBottom: 20, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.accent}, #9C8FFF)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 700, color: "#fff",
                boxShadow: `0 0 0 4px ${C.accentSoft}`,
              }}>
                {profileLoading ? "…" : avatarLetter}
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>
                  {profileLoading
                    ? "Loading…"
                    : profile
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
                      : "User"}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>{profile?.email || "—"}</p>
              </div>
              {/* Status badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: profile?.is_block ? C.redSoft : C.greenSoft,
                color: profile?.is_block ? C.red : C.green,
                border: `1px solid ${profile?.is_block ? C.red : C.green}22`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: profile?.is_block ? C.red : C.green }} />
                {profile?.is_block ? "Blocked Account" : "Active Account"}
              </span>
            </div>

            {/* Profile details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "📱", label: "Phone", value: profile?.phone_no || "—" },
                { icon: "🏢", label: "Department", value: profile?.department?.name || "—" },
                { icon: "📚", label: "Course", value: profile?.course?.name || "—" },
                { icon: "🎓", label: "Semester", value: profile?.sem ? `Semester ${profile.sem}` : "—" },
                {
                  icon: "📅", label: "Joined", value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                    : "—"
                },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: C.text, fontWeight: 500 }}>
                      {profileLoading ? "…" : value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* ── RIGHT: Latest Tickets ── */}
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <Panel>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.label }}>
                  Recent Tickets
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Your last 5 support tickets</p>
              </div>
              <button
                onClick={() => navigate("/ticket")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", background: C.accentSoft,
                  color: C.accent, border: `1px solid ${C.accent}55`,
                  borderRadius: 10, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "background .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `rgba(108,99,255,0.22)`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.accentSoft)}
              >
                View All →
              </button>
            </div>

            {/* Ticket list */}
            {loading ? (
              <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ marginBottom: 12 }}><Skeleton height={64} borderRadius={10} /></div>
                ))}
              </SkeletonTheme>
            ) : tickets.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tickets.map((ticket) => {
                  const s = TICKET_STATUS[ticket.status] ?? TICKET_STATUS[0];
                  return (
                    <div
                      key={ticket.id}
                      style={{
                        padding: "14px 16px", borderRadius: 12,
                        background: C.bg, border: `1px solid ${C.border}`,
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", gap: 12, transition: "border-color .2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                      onClick={() => navigate("/ticket")}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ticket.text || ticket.subject || ticket.title || `Ticket #${ticket.id}`}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>
                          #{ticket.id} · {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.color}22`, flexShrink: 0 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎫</div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.label }}>No tickets yet</p>
                <p style={{ margin: "6px 0 0", fontSize: 12 }}>Your support tickets will appear here</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getDashBoardData = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const { data } = await axios.get("/student/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.status === 1) {
        setDashData(data?.data);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate('/')
      }

      console.log(error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => { getDashBoardData(); }, []);

  /* Pie data comes directly from API */
  const PIE_STATUS_COLORS = {
    "New": C.amber,
    "In Progress": C.accent,
    "Resolved": C.green,
  };

  const pieData = dashData?.pieChart?.map((d) => ({
    name: d.name,
    value: d.count,
    percentage: d.percentage,
  })) ?? [];

  /* Ticket status map for recent tickets table */
  const TICKET_STATUS = {
    1: { label: "New", color: C.amber, bg: C.amberSoft },
    2: { label: "In Progress", color: C.accent, bg: C.accentSoft },
    3: { label: "Resolved", color: C.green, bg: C.greenSoft },
  };

  return (
    <section style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: C.bg, minHeight: "100vh",
      padding: "28px 24px", color: C.text, boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        .tkt-row:hover td { background: ${C.surfaceHover} !important; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Admin Overview</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Platform analytics &amp; activity</p>
        </div>
        <div style={{ background: C.accentSoft, border: `1px solid ${C.accentGlow}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: ".05em" }}>
          ● LIVE
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Key Metrics</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <StatCard label="Total Students" value={dashData?.totalStudents} icon="👥" color={C.green} colorSoft={C.greenSoft} loading={loading} sub="Registered students" />
          <StatCard label="Departments" value={dashData?.totalDepartments} icon="🏢" color={C.accent} colorSoft={C.accentSoft} loading={loading} sub="Active departments" />
          <StatCard label="Courses" value={dashData?.totalCourses} icon="📚" color={C.accent} colorSoft={C.accentSoft} loading={loading} sub="Available courses" />
          <StatCard label="Total Tickets" value={dashData?.totalTickets} icon="🎫" color={C.amber} colorSoft={C.amberSoft} loading={loading} sub="All time tickets" />
          <StatCard label="Open Tickets" value={dashData?.openTickets} icon="🔓" color={C.amber} colorSoft={C.amberSoft} loading={loading} sub="Awaiting action" />
          <StatCard label="In Progress" value={dashData?.inProgressTickets} icon="⏳" color={C.blue} colorSoft={C.blueSoft} loading={loading} sub="Being handled" />
          <StatCard label="Closed Tickets" value={dashData?.closedTickets} icon="✅" color={C.green} colorSoft={C.greenSoft} loading={loading} sub="Resolved tickets" />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Analytics</SectionTitle>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

          {/* Ticket status pie */}
          <Panel style={{ flex: "1 1 260px", minWidth: 0 }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: C.label, letterSpacing: ".05em" }}>
              TICKET STATUS SPLIT
            </p>
            {loading ? (
              <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
                <Skeleton height={200} borderRadius={10} />
              </SkeletonTheme>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData.length ? pieData : [{ name: "No data", value: 1 }]}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={3} dataKey="value"
                    >
                      {(pieData.length ? pieData : [{ name: "No data" }]).map((entry, i) => (
                        <Cell
                          key={i}
                          fill={PIE_STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend with percentages */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.muted }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_STATUS_COLORS[d.name] ?? C.accent, display: "inline-block" }} />
                        {d.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.label }}>
                        {d.value} <span style={{ color: C.muted, fontWeight: 400 }}>({d.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          {/* Summary bar chart */}
          <Panel style={{ flex: "2 1 380px", minWidth: 0 }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: C.label, letterSpacing: ".05em" }}>
              TICKET OVERVIEW
            </p>
            {loading ? (
              <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
                <Skeleton height={220} borderRadius={10} />
              </SkeletonTheme>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { name: "New", value: dashData?.openTickets ?? 0, fill: C.amber },
                    { name: "In Progress", value: dashData?.inProgressTickets ?? 0, fill: C.accent },
                    { name: "Resolved", value: dashData?.closedTickets ?? 0, fill: C.green },
                  ]}
                  barCategoryGap="40%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: C.accentSoft }} />
                  <Bar dataKey="value" name="Tickets" radius={[6, 6, 0, 0]}>
                    {[C.amber, C.accent, C.green].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
      </div>

      {/* ── Recent Tickets table ── */}
      <div style={{ marginBottom: 28 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.label, letterSpacing: ".05em", textTransform: "uppercase" }}>
              Recent Tickets
            </p>
            <button
              onClick={() => navigate("/ticket")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", background: C.accentSoft,
                color: C.accent, border: `1px solid ${C.accent}55`,
                borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(108,99,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.accentSoft)}
            >
              View All →
            </button>
          </div>

          {loading ? (
            <SkeletonTheme baseColor={C.border} highlightColor={C.surfaceHover}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ marginBottom: 10 }}><Skeleton height={52} borderRadius={8} /></div>
              ))}
            </SkeletonTheme>
          ) : dashData?.recentTickets?.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["S.No", "Title", "Status", "Created On"].map((col) => (
                    <th key={col} style={{
                      padding: "10px 14px", fontSize: 11, fontWeight: 700,
                      letterSpacing: ".08em", textTransform: "uppercase",
                      color: C.muted, borderBottom: `1px solid ${C.border}`,
                      textAlign: "left", whiteSpace: "nowrap",
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashData.recentTickets.map((t, index) => {
                  const s = TICKET_STATUS[t.status] ?? TICKET_STATUS[0];
                  return (
                    <tr key={t.id} className="tkt-row">
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.label }}>{index + 1}</span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 320, color: C.text, fontWeight: 500 }}>
                        {t.title || `Ticket #${t.id}`}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                          background: s.bg, color: s.color,
                          border: `1px solid ${s.color}22`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
              <p style={{ margin: 0, fontSize: 14, color: C.label, fontWeight: 500 }}>No recent tickets</p>
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
};

/* shared td style */
const tdStyle = {
  padding: "13px 14px", fontSize: 13, color: "#E8EAF6",
  borderBottom: "1px solid #252A45", verticalAlign: "middle",
  whiteSpace: "nowrap", overflow: "hidden",
  textOverflow: "ellipsis", maxWidth: 200,
};

/* ══════════════════════════════════════════════
   ROOT — reads is_admin and routes accordingly
══════════════════════════════════════════════ */
const Dashboard = () => {
  const isAdmin = localStorage.getItem('admin')
  console.log({ isAdmin });


  return (
    <div>
      <DashboardLayout>
        {isAdmin == 'true' ? <AdminDashboard /> : <UserDashboard />}
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;