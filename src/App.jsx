import { useState, useEffect, useRef, useCallback } from "react";

// ── Load Fonts ──────────────────────────────────────────────────────────────
(() => {
  if (!document.getElementById("fm-fonts")) {
    const l = document.createElement("link");
    l.id = "fm-fonts";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }
})();

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ls = {
  g: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v != null ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  s: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const todayStr = () => new Date().toISOString().split("T")[0];

/* ══════════════════════════════════════════════════════════════
   COLOR TOKENS
══════════════════════════════════════════════════════════════ */
const C = {
  bg: "#05080f",
  surface: "#0a0f1e",
  surface2: "#0f1628",
  border: "#172035",
  borderHover: "#243860",
  text: "#e2eaf8",
  muted: "#4a607a",
  accent: "#00d4ff",
  accentDim: "#004f63",
  accentGlow: "rgba(0,212,255,0.15)",
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
  green: "#10b981",
  greenDim: "rgba(16,185,129,0.15)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.15)",
  yellow: "#f59e0b",
  yellowDim: "rgba(245,158,11,0.15)",
};

const glowBorder = `1px solid ${C.border}`;
const accentBorder = `1px solid ${C.accent}`;

/* ══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════ */
function Toast({ toast }) {
  if (!toast) return null;
  const bg =
    toast.type === "error"
      ? C.red
      : toast.type === "success"
      ? C.green
      : C.accent;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: C.surface2,
        border: `1px solid ${bg}`,
        borderLeft: `4px solid ${bg}`,
        color: C.text,
        padding: "12px 20px",
        borderRadius: 8,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        maxWidth: 360,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${bg}33`,
        animation: "slideUp 0.3s ease",
      }}
    >
      {toast.msg}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label
        style={{
          display: "block",
          color: C.muted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 6,
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style, onKeyDown }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: C.bg,
        border: glowBorder,
        borderRadius: 6,
        color: C.text,
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 500,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.accent)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled }) {
  const base = {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: "all 0.2s",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${C.accent}, #0097b2)`,
      color: "#000",
      boxShadow: `0 0 20px ${C.accentGlow}`,
    },
    ghost: {
      background: "transparent",
      color: C.accent,
      border: `1px solid ${C.accent}`,
    },
    danger: {
      background: C.redDim,
      color: C.red,
      border: `1px solid ${C.red}44`,
    },
    success: {
      background: C.greenDim,
      color: C.green,
      border: `1px solid ${C.green}44`,
    },
    muted: {
      background: C.surface2,
      color: C.muted,
      border: glowBorder,
    },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Badge({ children, color = C.accent }) {
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: C.surface,
          border: glowBorder,
          borderRadius: 12,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 60px ${C.accentGlow}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: glowBorder,
          }}
        >
          <h3
            style={{
              color: C.accent,
              fontFamily: "'Orbitron', monospace",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = C.accent, icon }) {
  return (
    <div
      style={{
        background: C.surface,
        border: glowBorder,
        borderRadius: 10,
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 32,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{ color: C.text, fontSize: 13, fontWeight: 600, marginTop: 4 }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CAMERA COMPONENT
══════════════════════════════════════════════════════════════ */
function CameraCapture({ onCapture, onVideoReady, onError, compact }) {
  const videoRef = useRef();
  const streamRef = useRef();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setReady(true);
            onVideoReady?.(videoRef.current);
          };
        }
      })
      .catch((e) => {
        setErr("Camera access denied or unavailable.");
        onError?.(e);
      });
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const c = document.createElement("canvas");
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    c.getContext("2d").drawImage(videoRef.current, 0, 0);
    onCapture?.(c.toDataURL("image/jpeg", 0.9), videoRef.current, c);
  };

  if (err)
    return (
      <div
        style={{
          background: C.redDim,
          border: `1px solid ${C.red}44`,
          borderRadius: 8,
          padding: 20,
          color: C.red,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        📷 {err}
      </div>
    );

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          border: `2px solid ${ready ? C.accent : C.border}`,
          boxShadow: ready ? `0 0 30px ${C.accentGlow}` : "none",
          transition: "all 0.3s",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", display: "block", transform: "scaleX(-1)" }}
        />
        {/* Scan overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(transparent 50%, rgba(0,212,255,0.015) 50%)",
            backgroundSize: "100% 4px",
            pointerEvents: "none",
          }}
        />
        {/* Corner marks */}
        {ready && (
          <>
            {[
              { top: 12, left: 12, borderTop: accentBorder, borderLeft: accentBorder },
              { top: 12, right: 12, borderTop: accentBorder, borderRight: accentBorder },
              { bottom: 12, left: 12, borderBottom: accentBorder, borderLeft: accentBorder },
              { bottom: 12, right: 12, borderBottom: accentBorder, borderRight: accentBorder },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 24,
                  height: 24,
                  ...s,
                  pointerEvents: "none",
                }}
              />
            ))}
          </>
        )}
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              color: C.muted,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            INITIALIZING CAMERA…
          </div>
        )}
      </div>
      {onCapture && ready && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Btn onClick={capture} style={{ width: "100%" }}>
            📸 Capture Face
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SETUP PAGE
══════════════════════════════════════════════════════════════ */
function SetupPage({ onSetup, showToast }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      showToast("All fields are required", "error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      showToast("Enter a valid email address", "error");
      return;
    }
    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (form.password !== form.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    onSetup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text", ph: "e.g., Prof. Arjun Sharma" },
    { key: "email", label: "Admin Email", type: "email", ph: "admin@school.edu" },
    { key: "password", label: "Password", type: "password", ph: "Minimum 6 characters" },
    { key: "confirm", label: "Confirm Password", type: "password", ph: "Repeat your password" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Rajdhani', sans-serif",
        backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(0,212,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(124,58,237,0.04) 0%, transparent 60%)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 28,
              fontWeight: 900,
              color: C.accent,
              letterSpacing: 4,
              textShadow: `0 0 30px ${C.accent}66`,
            }}
          >
            ◈ FACEMARK
          </div>
          <div
            style={{
              color: C.muted,
              fontSize: 12,
              letterSpacing: 3,
              marginTop: 6,
              textTransform: "uppercase",
            }}
          >
            AI Attendance System
          </div>
        </div>

        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 14,
            padding: 32,
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${C.accentGlow}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top glow line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
            }}
          />
          <div
            style={{
              color: C.accent,
              fontFamily: "'Orbitron', monospace",
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 24,
            }}
          >
            INITIAL SYSTEM SETUP
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
            Create your admin account to initialize the attendance system. This
            account will have full control over students, subjects, and reports.
          </p>

          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              <Input
                type={f.type}
                placeholder={f.ph}
                value={form[f.key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </Field>
          ))}

          <Btn
            onClick={handleSubmit}
            style={{ width: "100%", padding: "13px 20px", marginTop: 8, fontSize: 14 }}
          >
            Initialize System →
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */
function LoginPage({ adminCreds, students, onLogin, showToast }) {
  const [tab, setTab] = useState("admin");
  const [form, setForm] = useState({ email: "", password: "", rollNo: "", parentEmail: "" });

  const handle = () => {
    if (tab === "admin") {
      if (form.email === adminCreds.email && form.password === adminCreds.password) {
        onLogin({ role: "admin", name: adminCreds.name });
      } else {
        showToast("Invalid credentials", "error");
      }
    } else {
      const st = students.find(
        (s) =>
          s.rollNo.toLowerCase() === form.rollNo.trim().toLowerCase() &&
          s.parentEmail.toLowerCase() === form.parentEmail.trim().toLowerCase()
      );
      if (st) {
        onLogin({ role: "student", studentId: st.id, name: st.name });
      } else {
        showToast("Student not found. Check Roll No & Parent Email.", "error");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Rajdhani', sans-serif",
        backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(0,212,255,0.04) 0%, transparent 60%)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 28,
              fontWeight: 900,
              color: C.accent,
              letterSpacing: 4,
              textShadow: `0 0 30px ${C.accent}66`,
            }}
          >
            ◈ FACEMARK
          </div>
          <div
            style={{ color: C.muted, fontSize: 12, letterSpacing: 3, marginTop: 6, textTransform: "uppercase" }}
          >
            AI Attendance System
          </div>
        </div>

        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 14,
            padding: 32,
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${C.accentGlow}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
            }}
          />

          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              background: C.bg,
              borderRadius: 8,
              border: glowBorder,
              marginBottom: 28,
              overflow: "hidden",
            }}
          >
            {[
              { key: "admin", label: "⚙ Admin" },
              { key: "student", label: "👤 Student / Parent" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: tab === t.key ? C.accentDim : "transparent",
                  border: "none",
                  color: tab === t.key ? C.accent : C.muted,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "admin" ? (
            <>
              <Field label="Admin Email">
                <Input
                  type="email"
                  placeholder="admin@school.edu"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handle()}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Roll Number">
                <Input
                  placeholder="e.g., 2024CS001"
                  value={form.rollNo}
                  onChange={(e) => setForm((p) => ({ ...p, rollNo: e.target.value }))}
                />
              </Field>
              <Field label="Parent's Email">
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={form.parentEmail}
                  onChange={(e) => setForm((p) => ({ ...p, parentEmail: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handle()}
                />
              </Field>
            </>
          )}

          <Btn onClick={handle} style={{ width: "100%", marginTop: 8, padding: "13px 20px", fontSize: 14 }}>
            Sign In →
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADMIN PORTAL
══════════════════════════════════════════════════════════════ */
function AdminPortal({
  faceApi,
  modelsLoaded,
  modelsLoading,
  loadModels,
  students,
  subjects,
  attendance,
  notifs,
  addStudent,
  updateStudent,
  deleteStudent,
  addSubject,
  deleteSubject,
  markAttendance,
  sendMonthlyReport,
  showToast,
  onLogout,
  adminName,
}) {
  const [tab, setTab] = useState("dashboard");

  const tabs = [
    { key: "dashboard", icon: "▦", label: "Dashboard" },
    { key: "students", icon: "◈", label: "Students" },
    { key: "subjects", icon: "◻", label: "Subjects" },
    { key: "attendance", icon: "◉", label: "Take Attendance" },
    { key: "logs", icon: "≡", label: "Logs" },
    { key: "notifications", icon: "◬", label: "Notifications" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Rajdhani', sans-serif", display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          minHeight: "100vh",
          background: C.surface,
          borderRight: glowBorder,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "28px 20px 20px",
            borderBottom: glowBorder,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 16,
              fontWeight: 900,
              color: C.accent,
              letterSpacing: 2,
              textShadow: `0 0 20px ${C.accent}55`,
            }}
          >
            ◈ FACEMARK
          </div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
            ADMIN PORTAL
          </div>
          <div
            style={{
              marginTop: 12,
              color: C.text,
              fontSize: 12,
              fontWeight: 600,
              background: C.surface2,
              border: glowBorder,
              borderRadius: 6,
              padding: "6px 10px",
            }}
          >
            {adminName}
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: tab === t.key ? C.accentDim : "transparent",
                border: tab === t.key ? `1px solid ${C.accentDim}` : "1px solid transparent",
                borderRadius: 7,
                color: tab === t.key ? C.accent : C.muted,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.key ? 700 : 500,
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 0.5,
                textAlign: "left",
                marginBottom: 4,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: glowBorder }}>
          {!modelsLoaded && (
            <Btn
              onClick={loadModels}
              disabled={modelsLoading || !faceApi}
              variant="ghost"
              style={{ width: "100%", marginBottom: 8, fontSize: 11 }}
            >
              {modelsLoading ? "⟳ Loading AI…" : !faceApi ? "⟳ Script…" : "⚡ Load AI Models"}
            </Btn>
          )}
          {modelsLoaded && (
            <div
              style={{
                textAlign: "center",
                color: C.green,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              ◉ AI MODELS READY
            </div>
          )}
          <Btn variant="danger" onClick={onLogout} style={{ width: "100%", fontSize: 11 }}>
            ⏻ Logout
          </Btn>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard" && (
          <AdminDashboard
            students={students}
            subjects={subjects}
            attendance={attendance}
            notifs={notifs}
            sendMonthlyReport={sendMonthlyReport}
          />
        )}
        {tab === "students" && (
          <StudentsTab
            faceApi={faceApi}
            modelsLoaded={modelsLoaded}
            students={students}
            addStudent={addStudent}
            updateStudent={updateStudent}
            deleteStudent={deleteStudent}
            showToast={showToast}
          />
        )}
        {tab === "subjects" && (
          <SubjectsTab
            subjects={subjects}
            addSubject={addSubject}
            deleteSubject={deleteSubject}
            showToast={showToast}
          />
        )}
        {tab === "attendance" && (
          <AttendanceTab
            faceApi={faceApi}
            modelsLoaded={modelsLoaded}
            students={students}
            subjects={subjects}
            attendance={attendance}
            markAttendance={markAttendance}
            showToast={showToast}
            loadModels={loadModels}
          />
        )}
        {tab === "logs" && (
          <LogsTab students={students} subjects={subjects} attendance={attendance} />
        )}
        {tab === "notifications" && (
          <NotificationsTab notifs={notifs} students={students} />
        )}
      </div>
    </div>
  );
}

/* ── Admin Dashboard ────────────────────────────────────────── */
function AdminDashboard({ students, subjects, attendance, notifs, sendMonthlyReport }) {
  const todayAttendance = attendance.filter((a) => a.date === todayStr());
  const uniqueToday = new Set(todayAttendance.map((a) => a.studentId)).size;

  const recentLogs = [...attendance]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Dashboard" sub="System overview and quick actions" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard icon="◈" label="Registered Students" value={students.length} color={C.accent} />
        <StatCard icon="◻" label="Active Subjects" value={subjects.length} color={C.purpleLight} />
        <StatCard icon="◉" label="Today's Attendance" value={uniqueToday} sub="unique students" color={C.green} />
        <StatCard icon="◬" label="Total Records" value={attendance.length} color={C.yellow} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Activity */}
        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 10,
            padding: 24,
          }}
        >
          <SectionTitle>Recent Attendance</SectionTitle>
          {recentLogs.length === 0 ? (
            <Empty label="No attendance records yet" />
          ) : (
            recentLogs.map((rec) => {
              const st = students.find((s) => s.id === rec.studentId);
              const sub = subjects.find((s) => s.id === rec.subjectId);
              return (
                <div
                  key={rec.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: glowBorder,
                  }}
                >
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>
                      {st?.name || "Unknown"}
                    </div>
                    <div style={{ color: C.muted, fontSize: 11 }}>
                      {sub?.name || "Unknown Subject"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: C.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    >
                      {fmtTime(rec.timestamp)}
                    </div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{rec.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Monthly Report */}
        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 10,
            padding: 24,
          }}
        >
          <SectionTitle>Monthly Report</SectionTitle>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            Generate and send monthly attendance summary reports to all parents via
            notification. Reports include per-subject attendance percentage and
            overall summary.
          </p>
          <div
            style={{
              background: C.yellowDim,
              border: `1px solid ${C.yellow}44`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ color: C.yellow, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              ⚠ Production Note
            </div>
            <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
              In a live deployment, this triggers actual emails/SMS via a backend
              cron. Here it generates in-app notifications visible in the
              Notifications tab.
            </p>
          </div>
          <Btn
            variant="success"
            onClick={sendMonthlyReport}
            disabled={students.length === 0 || subjects.length === 0}
            style={{ width: "100%" }}
          >
            📊 Dispatch Monthly Reports
          </Btn>

          <div style={{ marginTop: 20 }}>
            <SectionTitle>Subject Performance</SectionTitle>
            {subjects.slice(0, 5).map((sub) => {
              const total = attendance.filter((a) => a.subjectId === sub.id).length;
              const days = sub.days?.length || 1;
              return (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: glowBorder,
                  }}
                >
                  <span style={{ color: C.text, fontSize: 13 }}>{sub.name}</span>
                  <Badge color={C.purpleLight}>{total} records</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Students Tab ────────────────────────────────────────────── */
function StudentsTab({ faceApi, modelsLoaded, students, addStudent, updateStudent, deleteStudent, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [capturedImg, setCapturedImg] = useState(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [form, setForm] = useState({ name: "", rollNo: "", parentPhone: "", parentEmail: "" });
  const videoRef = useRef();

  const handleCapture = async (imgData, video) => {
    if (!faceApi || !modelsLoaded) {
      showToast("Load AI models first (sidebar)", "error");
      return;
    }
    setCapturing(true);
    try {
      const detections = await faceApi
        .detectSingleFace(video, new faceApi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();
      if (!detections) {
        showToast("No face detected. Ensure good lighting and face the camera.", "error");
        setCapturing(false);
        return;
      }
      setCapturedImg(imgData);
      setCapturedDescriptor(Array.from(detections.descriptor));
      showToast("Face captured successfully ✓", "success");
    } catch (e) {
      showToast("Face detection failed: " + e.message, "error");
    }
    setCapturing(false);
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.rollNo.trim()) {
      showToast("Name and Roll Number are required", "error");
      return;
    }
    if (!form.parentEmail.trim()) {
      showToast("Parent email is required for notifications", "error");
      return;
    }
    if (students.some((s) => s.rollNo.toLowerCase() === form.rollNo.trim().toLowerCase())) {
      showToast("Roll number already exists", "error");
      return;
    }
    addStudent({
      name: form.name.trim(),
      rollNo: form.rollNo.trim(),
      parentPhone: form.parentPhone.trim(),
      parentEmail: form.parentEmail.trim(),
      faceDescriptor: capturedDescriptor,
      faceImage: capturedImg,
    });
    setForm({ name: "", rollNo: "", parentPhone: "", parentEmail: "" });
    setCapturedImg(null);
    setCapturedDescriptor(null);
    setShowAdd(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Student Management"
        sub={`${students.length} registered students`}
        action={
          <Btn onClick={() => setShowAdd(true)}>+ Register Student</Btn>
        }
      />

      {students.length === 0 ? (
        <Empty
          label="No students registered yet"
          sub="Click 'Register Student' to add your first student"
        />
      ) : (
        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: glowBorder }}>
                {["Face", "Name", "Roll No", "Parent Email", "Parent Phone", "AI Data", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        color: C.muted,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr
                  key={st.id}
                  style={{ borderBottom: glowBorder, transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px" }}>
                    {st.faceImage ? (
                      <img
                        src={st.faceImage}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: `2px solid ${C.accent}`,
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: C.accentDim,
                          border: `2px dashed ${C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: C.muted,
                          fontSize: 14,
                        }}
                      >
                        ?
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.text, fontWeight: 600, fontSize: 14 }}>
                    {st.name}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: C.accent,
                        fontSize: 12,
                      }}
                    >
                      {st.rollNo}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>
                    {st.parentEmail}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>
                    {st.parentPhone || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge color={st.faceDescriptor ? C.green : C.red}>
                      {st.faceDescriptor ? "Enrolled" : "Missing"}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Btn
                      variant="danger"
                      onClick={() => deleteStudent(st.id)}
                      style={{ padding: "5px 12px", fontSize: 11 }}
                    >
                      Remove
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          setCapturedImg(null);
          setCapturedDescriptor(null);
        }}
        title="Register New Student"
        width={640}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Form */}
          <div>
            <Field label="Full Name">
              <Input
                placeholder="Student's full name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Field>
            <Field label="Roll Number">
              <Input
                placeholder="e.g., 2024CS001"
                value={form.rollNo}
                onChange={(e) => setForm((p) => ({ ...p, rollNo: e.target.value }))}
              />
            </Field>
            <Field label="Parent's Email *">
              <Input
                type="email"
                placeholder="parent@email.com"
                value={form.parentEmail}
                onChange={(e) => setForm((p) => ({ ...p, parentEmail: e.target.value }))}
              />
            </Field>
            <Field label="Parent's Phone">
              <Input
                placeholder="+91 98765 43210"
                value={form.parentPhone}
                onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))}
              />
            </Field>

            {capturedDescriptor && (
              <div
                style={{
                  background: C.greenDim,
                  border: `1px solid ${C.green}44`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <img
                  src={capturedImg}
                  style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
                  alt=""
                />
                <div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 12 }}>
                    ✓ Face Data Captured
                  </div>
                  <div style={{ color: C.muted, fontSize: 11 }}>128-dim face descriptor saved</div>
                </div>
              </div>
            )}

            <Btn onClick={handleAdd} style={{ width: "100%" }} disabled={capturing}>
              {capturing ? "⟳ Processing..." : "Register Student"}
            </Btn>
          </div>

          {/* Camera */}
          <div>
            <div
              style={{
                color: C.muted,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              Face Capture
            </div>
            {!modelsLoaded && (
              <div
                style={{
                  background: C.yellowDim,
                  border: `1px solid ${C.yellow}44`,
                  borderRadius: 8,
                  padding: 12,
                  color: C.yellow,
                  fontSize: 12,
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                ⚠ Load AI Models first (sidebar button) to enable face capture
              </div>
            )}
            <CameraCapture
              onCapture={handleCapture}
              onVideoReady={(v) => (videoRef.current = v)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Subjects Tab ────────────────────────────────────────────── */
function SubjectsTab({ subjects, addSubject, deleteSubject, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    days: [],
    startTime: "",
    endTime: "",
    room: "",
  });

  const toggleDay = (d) =>
    setForm((p) => ({
      ...p,
      days: p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d],
    }));

  const handleAdd = () => {
    if (!form.name.trim()) { showToast("Subject name is required", "error"); return; }
    if (form.days.length === 0) { showToast("Select at least one day", "error"); return; }
    if (!form.startTime || !form.endTime) { showToast("Set start and end times", "error"); return; }
    addSubject({
      name: form.name.trim(),
      days: form.days,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room.trim(),
      createdAt: new Date().toISOString(),
    });
    setForm({ name: "", days: [], startTime: "", endTime: "", room: "" });
    setShowAdd(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Subject & Schedule"
        sub="Manage subjects and their class timings"
        action={<Btn onClick={() => setShowAdd(true)}>+ Create Subject</Btn>}
      />

      {subjects.length === 0 ? (
        <Empty
          label="No subjects created yet"
          sub="Click 'Create Subject' to add your first subject with custom schedule"
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {subjects.map((sub) => (
            <div
              key={sub.id}
              style={{
                background: C.surface,
                border: glowBorder,
                borderRadius: 10,
                padding: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${C.purpleLight}, transparent)`,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {sub.name}
                  </div>
                  {sub.room && (
                    <div style={{ color: C.muted, fontSize: 12 }}>Room: {sub.room}</div>
                  )}
                </div>
                <Btn
                  variant="danger"
                  onClick={() => deleteSubject(sub.id)}
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  ✕
                </Btn>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {DAYS.map((d) => (
                    <span
                      key={d}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: sub.days?.includes(d) ? C.accentDim : C.surface2,
                        color: sub.days?.includes(d) ? C.accent : C.muted,
                        border: `1px solid ${sub.days?.includes(d) ? C.accent + "55" : C.border}`,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    color: C.accent,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ⏱ {sub.startTime} – {sub.endTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create New Subject">
        <Field label="Subject Name">
          <Input
            placeholder="e.g., Physics, Mathematics, English"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>

        <Field label="Class Days">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 6,
                  border: `1px solid ${form.days.includes(d) ? C.accent : C.border}`,
                  background: form.days.includes(d) ? C.accentDim : C.bg,
                  color: form.days.includes(d) ? C.accent : C.muted,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.2s",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Start Time">
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
            />
          </Field>
          <Field label="End Time">
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Room / Location (optional)">
          <Input
            placeholder="e.g., Room 204, Lab B"
            value={form.room}
            onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
          />
        </Field>

        <Btn onClick={handleAdd} style={{ width: "100%", marginTop: 8 }}>
          Create Subject
        </Btn>
      </Modal>
    </div>
  );
}

/* ── Attendance Tab ──────────────────────────────────────────── */
function AttendanceTab({ faceApi, modelsLoaded, students, subjects, attendance, markAttendance, showToast, loadModels }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [markedToday, setMarkedToday] = useState([]);
  const videoRef = useRef();
  const scanIntervalRef = useRef();
  const canvasRef = useRef();

  const todayAttendance = attendance.filter((a) => a.date === todayStr());

  const startScan = () => {
    if (!modelsLoaded) { showToast("Load AI Models first (sidebar)", "error"); return; }
    if (!selectedSubject) { showToast("Select a subject first", "error"); return; }
    if (!videoRef.current) { showToast("Camera not ready", "error"); return; }
    const registeredStudents = students.filter((s) => s.faceDescriptor);
    if (registeredStudents.length === 0) {
      showToast("No students with face data. Register faces first.", "error");
      return;
    }
    setScanning(true);
    setScanStatus({ type: "scanning", msg: "Scanning for faces…" });

    const labeledDescriptors = registeredStudents.map(
      (s) =>
        new faceApi.LabeledFaceDescriptors(s.id, [new Float32Array(s.faceDescriptor)])
    );
    const faceMatcher = new faceApi.FaceMatcher(labeledDescriptors, 0.5);

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      try {
        const detections = await faceApi
          .detectAllFaces(videoRef.current, new faceApi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        if (detections.length === 0) {
          setScanStatus({ type: "scanning", msg: "No face detected. Point camera at student." });
          return;
        }

        for (const det of detections) {
          const bestMatch = faceMatcher.findBestMatch(det.descriptor);
          if (bestMatch.label !== "unknown") {
            const studentId = bestMatch.label;
            // Check if already marked today for this subject
            const alreadyMarked = todayAttendance.some(
              (a) => a.studentId === studentId && a.subjectId === selectedSubject
            );
            if (!alreadyMarked && !markedToday.includes(studentId + selectedSubject)) {
              const rec = markAttendance(studentId, selectedSubject);
              if (rec) {
                const st = students.find((s) => s.id === studentId);
                setMarkedToday((p) => [...p, studentId + selectedSubject]);
                setScanStatus({
                  type: "success",
                  msg: `✓ ${st?.name} — Attendance Marked!`,
                  studentImg: st?.faceImage,
                });
                setTimeout(() => setScanStatus({ type: "scanning", msg: "Scanning…" }), 3000);
              }
            } else {
              const st = students.find((s) => s.id === studentId);
              setScanStatus({ type: "info", msg: `${st?.name} — Already marked today` });
            }
          } else {
            setScanStatus({ type: "scanning", msg: "Face detected but not recognized…" });
          }
        }
      } catch (e) {}
    }, 1500);
  };

  const stopScan = () => {
    clearInterval(scanIntervalRef.current);
    setScanning(false);
    setScanStatus(null);
  };

  useEffect(() => () => clearInterval(scanIntervalRef.current), []);

  const sub = subjects.find((s) => s.id === selectedSubject);

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Take Attendance" sub="AI-powered real-time face recognition" />

      {!modelsLoaded && (
        <div
          style={{
            background: C.yellowDim,
            border: `1px solid ${C.yellow}55`,
            borderRadius: 10,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: C.yellow, fontWeight: 700, fontSize: 14 }}>
              ⚠ AI Models Not Loaded
            </div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
              Face recognition requires AI models. Click to load from CDN (~8MB).
            </div>
          </div>
          <Btn onClick={loadModels} variant="ghost" style={{ borderColor: C.yellow, color: C.yellow }}>
            ⚡ Load AI Models
          </Btn>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Camera Panel */}
        <div>
          <div
            style={{
              background: C.surface,
              border: glowBorder,
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={scanning}
                style={{
                  width: "100%",
                  background: C.bg,
                  border: glowBorder,
                  borderRadius: 6,
                  color: C.text,
                  padding: "10px 14px",
                  fontSize: 14,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  outline: "none",
                }}
              >
                <option value="">-- Choose a subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime}–{s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <CameraCapture onVideoReady={(v) => (videoRef.current = v)} />

            {scanStatus && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 8,
                  background:
                    scanStatus.type === "success"
                      ? C.greenDim
                      : scanStatus.type === "info"
                      ? C.accentGlow
                      : C.surface2,
                  border: `1px solid ${
                    scanStatus.type === "success"
                      ? C.green + "44"
                      : scanStatus.type === "info"
                      ? C.accent + "44"
                      : C.border
                  }`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {scanStatus.studentImg && (
                  <img
                    src={scanStatus.studentImg}
                    style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                    alt=""
                  />
                )}
                <span
                  style={{
                    color:
                      scanStatus.type === "success"
                        ? C.green
                        : scanStatus.type === "info"
                        ? C.accent
                        : C.muted,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {scanStatus.msg}
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {!scanning ? (
                <Btn
                  onClick={startScan}
                  disabled={!selectedSubject || !modelsLoaded}
                  style={{ flex: 1 }}
                >
                  ◉ Start Recognition
                </Btn>
              ) : (
                <Btn variant="danger" onClick={stopScan} style={{ flex: 1 }}>
                  ◻ Stop Scanning
                </Btn>
              )}
            </div>
          </div>
        </div>

        {/* Today's marked list */}
        <div
          style={{
            background: C.surface,
            border: glowBorder,
            borderRadius: 10,
            padding: 20,
          }}
        >
          <SectionTitle>
            Today's Attendance
            {sub && <Badge color={C.purpleLight} style={{ marginLeft: 8 }}>{sub.name}</Badge>}
          </SectionTitle>

          {(() => {
            const todayRecs = todayAttendance.filter(
              (a) => !selectedSubject || a.subjectId === selectedSubject
            );
            if (todayRecs.length === 0) {
              return <Empty label="No attendance marked yet today" />;
            }
            return todayRecs.map((rec) => {
              const st = students.find((s) => s.id === rec.studentId);
              const sb = subjects.find((s) => s.id === rec.subjectId);
              return (
                <div
                  key={rec.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: glowBorder,
                  }}
                >
                  {st?.faceImage ? (
                    <img
                      src={st.faceImage}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.green}` }}
                      alt=""
                    />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontSize: 16 }}>✓</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{st?.name}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{st?.rollNo} · {sb?.name}</div>
                  </div>
                  <div style={{ color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {fmtTime(rec.timestamp)}
                  </div>
                </div>
              );
            });
          })()}

          <div style={{ marginTop: 20 }}>
            <SectionTitle>Manual Override</SectionTitle>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>
              Mark attendance manually if camera recognition fails.
            </p>
            {selectedSubject ? (
              students.map((st) => {
                const alreadyMarked = todayAttendance.some(
                  (a) => a.studentId === st.id && a.subjectId === selectedSubject
                );
                return (
                  <div
                    key={st.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: glowBorder,
                    }}
                  >
                    <span style={{ color: C.text, fontSize: 13 }}>
                      {st.name} <span style={{ color: C.muted }}>({st.rollNo})</span>
                    </span>
                    {alreadyMarked ? (
                      <Badge color={C.green}>Present</Badge>
                    ) : (
                      <Btn
                        variant="ghost"
                        onClick={() => markAttendance(st.id, selectedSubject)}
                        style={{ padding: "4px 12px", fontSize: 11 }}
                      >
                        Mark ✓
                      </Btn>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: C.muted, fontSize: 12 }}>Select a subject above first</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Logs Tab ─────────────────────────────────────────────────── */
function LogsTab({ students, subjects, attendance }) {
  const [filter, setFilter] = useState({ studentId: "", subjectId: "", date: "" });

  const filtered = attendance.filter((a) => {
    if (filter.studentId && a.studentId !== filter.studentId) return false;
    if (filter.subjectId && a.subjectId !== filter.subjectId) return false;
    if (filter.date && a.date !== filter.date) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Attendance Logs" sub={`${filtered.length} records`} />

      {/* Filters */}
      <div
        style={{
          background: C.surface,
          border: glowBorder,
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <Field label="Filter by Student" style={{ marginBottom: 0 }}>
          <select
            value={filter.studentId}
            onChange={(e) => setFilter((p) => ({ ...p, studentId: e.target.value }))}
            style={{
              width: "100%", background: C.bg, border: glowBorder, borderRadius: 6,
              color: C.text, padding: "10px 14px", fontSize: 13,
              fontFamily: "'Rajdhani', sans-serif", outline: "none",
            }}
          >
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Filter by Subject" style={{ marginBottom: 0 }}>
          <select
            value={filter.subjectId}
            onChange={(e) => setFilter((p) => ({ ...p, subjectId: e.target.value }))}
            style={{
              width: "100%", background: C.bg, border: glowBorder, borderRadius: 6,
              color: C.text, padding: "10px 14px", fontSize: 13,
              fontFamily: "'Rajdhani', sans-serif", outline: "none",
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Filter by Date" style={{ marginBottom: 0 }}>
          <Input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter((p) => ({ ...p, date: e.target.value }))}
          />
        </Field>
        <Btn
          variant="muted"
          onClick={() => setFilter({ studentId: "", subjectId: "", date: "" })}
          style={{ height: 42 }}
        >
          Clear
        </Btn>
      </div>

      {sorted.length === 0 ? (
        <Empty label="No records match your filters" />
      ) : (
        <div style={{ background: C.surface, border: glowBorder, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: glowBorder }}>
                {["#", "Student", "Roll No", "Subject", "Date", "Time"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: C.muted,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((rec, i) => {
                const st = students.find((s) => s.id === rec.studentId);
                const sub = subjects.find((s) => s.id === rec.subjectId);
                return (
                  <tr
                    key={rec.id}
                    style={{ borderBottom: `1px solid ${C.border}55`, transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 16px", color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td style={{ padding: "10px 16px", color: C.text, fontWeight: 600, fontSize: 13 }}>
                      {st?.name || "—"}
                    </td>
                    <td style={{ padding: "10px 16px", color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {st?.rollNo || "—"}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <Badge color={C.purpleLight}>{sub?.name || "—"}</Badge>
                    </td>
                    <td style={{ padding: "10px 16px", color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {rec.date}
                    </td>
                    <td style={{ padding: "10px 16px", color: C.green, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {fmtTime(rec.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Notifications Tab ───────────────────────────────────────── */
function NotificationsTab({ notifs, students }) {
  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Notification Log" sub={`${notifs.length} notifications sent`} />

      <div
        style={{
          background: C.yellowDim,
          border: `1px solid ${C.yellow}44`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ color: C.yellow, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          ⚠ Notification Delivery Note
        </div>
        <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          In a production deployment, these notifications are sent as real SMS (Twilio) and
          emails (SendGrid/Nodemailer) to parent contacts. In this demo, all notifications are
          logged here. The messages shown are exactly what would be sent to parents.
        </p>
      </div>

      {notifs.length === 0 ? (
        <Empty label="No notifications sent yet" sub="Notifications appear here when attendance is marked" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map((n) => {
            const isLive = n.type === "live";
            const color = isLive ? C.accent : C.purpleLight;
            return (
              <div
                key={n.id}
                style={{
                  background: C.surface,
                  border: glowBorder,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <Badge color={color}>{isLive ? "Live Alert" : "Monthly Report"}</Badge>
                    <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                      {fmtDate(n.timestamp)} {fmtTime(n.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: C.text,
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {n.message}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {n.parentEmail && (
                      <div style={{ color: C.muted, fontSize: 11 }}>
                        📧 {n.parentEmail}
                      </div>
                    )}
                    {n.parentPhone && (
                      <div style={{ color: C.muted, fontSize: 11 }}>
                        📱 {n.parentPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STUDENT / PARENT PORTAL
══════════════════════════════════════════════════════════════ */
function StudentPortal({ user, students, subjects, attendance, notifs, showToast, onLogout }) {
  const [tab, setTab] = useState("overview");
  const student = students.find((s) => s.id === user.studentId);

  if (!student) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', sans-serif" }}>
        <div style={{ textAlign: "center", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
          <div>Student data not found. Contact your administrator.</div>
          <Btn onClick={onLogout} style={{ marginTop: 20 }}>Logout</Btn>
        </div>
      </div>
    );
  }

  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const myNotifs = notifs.filter((n) => n.studentId === student.id);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "calendar", label: "Calendar" },
    { key: "subjects", label: "By Subject" },
    { key: "notifications", label: `Notifications (${myNotifs.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: C.surface,
          borderBottom: glowBorder,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {student.faceImage ? (
            <img
              src={student.faceImage}
              style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${C.accent}`, objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontSize: 18 }}>
              ◈
            </div>
          )}
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, color: C.accent, letterSpacing: 1 }}>
              ◈ FACEMARK
            </div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
              {student.name}
              <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginLeft: 10 }}>
                {student.rollNo}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 16px",
                background: tab === t.key ? C.accentDim : "transparent",
                border: `1px solid ${tab === t.key ? C.accent : C.border}`,
                borderRadius: 6,
                color: tab === t.key ? C.accent : C.muted,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Rajdhani', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
          <Btn variant="danger" onClick={onLogout} style={{ padding: "8px 16px", fontSize: 12 }}>
            Logout
          </Btn>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 32 }}>
        {tab === "overview" && (
          <StudentOverview student={student} subjects={subjects} attendance={myAttendance} />
        )}
        {tab === "calendar" && (
          <AttendanceCalendar attendance={myAttendance} subjects={subjects} />
        )}
        {tab === "subjects" && (
          <SubjectBreakdown student={student} subjects={subjects} attendance={myAttendance} />
        )}
        {tab === "notifications" && (
          <StudentNotifications notifs={myNotifs} />
        )}
      </div>
    </div>
  );
}

function StudentOverview({ student, subjects, attendance }) {
  const totalPresent = attendance.length;
  const uniqueDays = new Set(attendance.map((a) => a.date)).size;

  const overallPct = subjects.length > 0
    ? Math.round((totalPresent / Math.max(subjects.length * uniqueDays, 1)) * 100)
    : 0;

  return (
    <div>
      <PageHeader title={`Welcome, ${student.name}`} sub="Your attendance overview" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="◉" label="Classes Attended" value={totalPresent} color={C.green} />
        <StatCard icon="◈" label="Active Days" value={uniqueDays} color={C.accent} />
        <StatCard icon="◻" label="Subjects Enrolled" value={subjects.length} color={C.purpleLight} />
        <StatCard
          icon="▦"
          label="Overall Attendance"
          value={`${overallPct}%`}
          color={overallPct >= 75 ? C.green : overallPct >= 50 ? C.yellow : C.red}
          sub={overallPct >= 75 ? "Good standing" : overallPct >= 50 ? "Needs improvement" : "Critical"}
        />
      </div>

      <div
        style={{
          background: C.surface,
          border: glowBorder,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Recent Attendance</SectionTitle>
        {[...attendance].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10).map((rec) => {
          const sub = subjects.find((s) => s.id === rec.subjectId);
          return (
            <div
              key={rec.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: glowBorder,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{sub?.name || "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 12 }}>{rec.date}</span>
                <span style={{ color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  {fmtTime(rec.timestamp)}
                </span>
                <Badge color={C.green}>Present</Badge>
              </div>
            </div>
          );
        })}
        {attendance.length === 0 && <Empty label="No attendance records yet" />}
      </div>
    </div>
  );
}

function AttendanceCalendar({ attendance, subjects }) {
  const [month, setMonth] = useState(new Date());

  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  const presentDates = new Set(attendance.map((a) => a.date));

  const prevMonth = () => setMonth(new Date(year, mon - 1, 1));
  const nextMonth = () => setMonth(new Date(year, mon + 1, 1));

  return (
    <div>
      <PageHeader title="Attendance Calendar" sub="Visual overview of your attendance" />
      <div style={{ maxWidth: 520, background: C.surface, border: glowBorder, borderRadius: 12, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>‹</button>
          <div style={{ fontFamily: "'Orbitron', monospace", color: C.accent, fontSize: 14, letterSpacing: 2 }}>
            {month.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()}
          </div>
          <button onClick={nextMonth} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 700, padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(mon + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPresent = presentDates.has(dateStr);
            const isToday = dateStr === todayStr();
            return (
              <div
                key={day}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isPresent || isToday ? 700 : 400,
                  background: isPresent ? C.greenDim : isToday ? C.accentGlow : "transparent",
                  border: `1px solid ${isPresent ? C.green + "44" : isToday ? C.accent + "44" : "transparent"}`,
                  color: isPresent ? C.green : isToday ? C.accent : C.muted,
                  cursor: "default",
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.greenDim, border: `1px solid ${C.green}44` }} />
            <span style={{ color: C.muted, fontSize: 11 }}>Present</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.accentGlow, border: `1px solid ${C.accent}44` }} />
            <span style={{ color: C.muted, fontSize: 11 }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectBreakdown({ student, subjects, attendance }) {
  return (
    <div>
      <PageHeader title="Subject-wise Attendance" sub="Detailed breakdown per subject" />
      {subjects.length === 0 ? (
        <Empty label="No subjects available" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {subjects.map((sub) => {
            const present = attendance.filter((a) => a.subjectId === sub.id).length;
            const schedule = `${sub.days?.join(", ")} · ${sub.startTime}–${sub.endTime}`;
            const pct = present > 0 ? Math.min(present * 10, 100) : 0;
            const color = pct >= 75 ? C.green : pct >= 50 ? C.yellow : C.red;

            return (
              <div
                key={sub.id}
                style={{
                  background: C.surface,
                  border: glowBorder,
                  borderRadius: 10,
                  padding: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{sub.name}</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color }}>
                    {present}
                  </div>
                </div>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 14 }}>{schedule}</div>
                <div style={{ background: C.bg, borderRadius: 4, overflow: "hidden", height: 6, marginBottom: 8 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((present / 20) * 100, 100)}%`,
                      background: color,
                      borderRadius: 4,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted, fontSize: 11 }}>{present} classes attended</span>
                  <Badge color={color}>{present >= 15 ? "Excellent" : present >= 8 ? "Good" : "Low"}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentNotifications({ notifs }) {
  return (
    <div>
      <PageHeader title="My Notifications" sub={`${notifs.length} notifications received`} />
      {notifs.length === 0 ? (
        <Empty label="No notifications yet" sub="Notifications will appear here when your attendance is marked" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              style={{
                background: C.surface,
                border: glowBorder,
                borderLeft: `3px solid ${n.type === "live" ? C.accent : C.purpleLight}`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Badge color={n.type === "live" ? C.accent : C.purpleLight}>
                  {n.type === "live" ? "Attendance Alert" : "Monthly Report"}
                </Badge>
                <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  {fmtDate(n.timestamp)} {fmtTime(n.timestamp)}
                </span>
              </div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
══════════════════════════════════════════════════════════════ */
function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
      <div>
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: 0,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>
        {sub && <p style={{ color: C.muted, fontSize: 13, marginTop: 4, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        color: C.muted,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 14,
        fontFamily: "'Rajdhani', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

function Empty({ label, sub }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        color: C.muted,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>◈</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.7 }}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [faceApi, setFaceApi] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);

  const [adminCreds, setAdminCreds] = useState(() => ls.g("ac", null));
  const [students, setStudents] = useState(() => ls.g("students", []));
  const [subjects, setSubjects] = useState(() => ls.g("subjects", []));
  const [attendance, setAttendance] = useState(() => ls.g("attendance", []));
  const [notifs, setNotifs] = useState(() => ls.g("notifs", []));

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${C.bg}; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${C.bg}; }
      ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: ${C.borderHover}; }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      option { background: ${C.surface}; color: ${C.text}; }
    `;
    document.head.appendChild(style);
  }, []);

  // Load face-api.js
  useEffect(() => {
    if (window.faceapi) { setFaceApi(window.faceapi); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    s.onload = () => setFaceApi(window.faceapi);
    document.head.appendChild(s);
  }, []);

  const loadModels = async () => {
    if (!faceApi || modelsLoaded) return;
    setModelsLoading(true);
    try {
      await faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceApi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      showToast("◉ AI Models Ready — Face recognition active", "success");
    } catch (e) {
      showToast("Failed to load AI models. Check network connection.", "error");
    }
    setModelsLoading(false);
  };

  // Persist
  useEffect(() => ls.s("students", students), [students]);
  useEffect(() => ls.s("subjects", subjects), [subjects]);
  useEffect(() => ls.s("attendance", attendance), [attendance]);
  useEffect(() => ls.s("notifs", notifs), [notifs]);
  useEffect(() => { if (adminCreds) ls.s("ac", adminCreds); }, [adminCreds]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type, id: uid() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data ops ──
  const addStudent = (data) => {
    const s = { ...data, id: uid(), createdAt: new Date().toISOString() };
    setStudents((p) => [...p, s]);
    showToast(`Student "${s.name}" registered`, "success");
    return s;
  };
  const updateStudent = (id, data) =>
    setStudents((p) => p.map((s) => (s.id === id ? { ...s, ...data } : s)));
  const deleteStudent = (id) => {
    setStudents((p) => p.filter((s) => s.id !== id));
    setAttendance((p) => p.filter((a) => a.studentId !== id));
    showToast("Student removed", "info");
  };

  const addSubject = (data) => {
    const s = { ...data, id: uid() };
    setSubjects((p) => [...p, s]);
    showToast(`Subject "${s.name}" created`, "success");
  };
  const deleteSubject = (id) => {
    setSubjects((p) => p.filter((s) => s.id !== id));
    showToast("Subject removed", "info");
  };

  const markAttendance = (studentId, subjectId) => {
    const student = students.find((s) => s.id === studentId);
    const subject = subjects.find((s) => s.id === subjectId);
    if (!student || !subject) return null;
    const rec = {
      id: uid(),
      studentId,
      subjectId,
      timestamp: new Date().toISOString(),
      date: todayStr(),
    };
    setAttendance((p) => [...p, rec]);
    const notif = {
      id: uid(),
      studentId,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      message: `${student.name}'s attendance marked for ${subject.name} at ${fmtTime(rec.timestamp)}`,
      timestamp: rec.timestamp,
      type: "live",
    };
    setNotifs((p) => [notif, ...p]);
    return rec;
  };

  const sendMonthlyReport = async () => {
    const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });
    let count = 0;
    students.forEach((student) => {
      const overallPresent = attendance.filter((a) => a.studentId === student.id).length;
      subjects.forEach((subject) => {
        const present = attendance.filter(
          (a) => a.studentId === student.id && a.subjectId === subject.id
        ).length;
        const n = {
          id: uid(),
          studentId: student.id,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
          message: `📊 Monthly Report (${month}) — ${student.name}: ${subject.name}: ${present} classes attended. Overall total: ${overallPresent} records.`,
          timestamp: new Date().toISOString(),
          type: "monthly",
        };
        setNotifs((p) => [n, ...p]);
        count++;
      });
    });
    showToast(`${count} monthly reports dispatched!`, "success");
  };

  // ── Routing ──
  const portal = (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Toast toast={toast} />
      {!adminCreds ? (
        <SetupPage onSetup={(c) => {
          setAdminCreds(c);
          ls.s("ac", c);
          showToast("Admin account created successfully!", "success");
        }} showToast={showToast} />
      ) : !user ? (
        <LoginPage adminCreds={adminCreds} students={students} onLogin={setUser} showToast={showToast} />
      ) : user.role === "admin" ? (
        <AdminPortal
          faceApi={faceApi}
          modelsLoaded={modelsLoaded}
          modelsLoading={modelsLoading}
          loadModels={loadModels}
          students={students}
          subjects={subjects}
          attendance={attendance}
          notifs={notifs}
          addStudent={addStudent}
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
          addSubject={addSubject}
          deleteSubject={deleteSubject}
          markAttendance={markAttendance}
          sendMonthlyReport={sendMonthlyReport}
          showToast={showToast}
          adminName={adminCreds.name}
          onLogout={() => setUser(null)}
        />
      ) : (
        <StudentPortal
          user={user}
          students={students}
          subjects={subjects}
          attendance={attendance}
          notifs={notifs}
          showToast={showToast}
          onLogout={() => setUser(null)}
        />
      )}
    </div>
  );

  return portal;
}
