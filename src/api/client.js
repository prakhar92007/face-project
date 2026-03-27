// src/api/client.js - API utility functions

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const apiClient = {
  // Admin
  getAdmin: () => fetch(`${API_BASE}/api/admin`).then((r) => r.json()),
  setAdmin: (data) =>
    fetch(`${API_BASE}/api/admin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),

  // Students
  getStudents: () => fetch(`${API_BASE}/api/students`).then((r) => r.json()),
  addStudent: (data) =>
    fetch(`${API_BASE}/api/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  updateStudent: (id, data) =>
    fetch(`${API_BASE}/api/students?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  deleteStudent: (id) =>
    fetch(`${API_BASE}/api/students?id=${id}`, { method: "DELETE" }).then((r) => r.json()),

  // Subjects
  getSubjects: () => fetch(`${API_BASE}/api/subjects`).then((r) => r.json()),
  addSubject: (data) =>
    fetch(`${API_BASE}/api/subjects`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  deleteSubject: (id) =>
    fetch(`${API_BASE}/api/subjects?id=${id}`, { method: "DELETE" }).then((r) => r.json()),

  // Attendance
  getAttendance: () => fetch(`${API_BASE}/api/attendance`).then((r) => r.json()),
  markAttendance: (data) =>
    fetch(`${API_BASE}/api/attendance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
};
