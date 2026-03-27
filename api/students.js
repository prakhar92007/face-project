// api/students.js - Students API endpoint
// Stores in environment for demo; upgrade to Vercel KV or Postgres

let studentsBackend = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;

  if (method === "GET") {
    // Get all students
    res.status(200).json({ data: studentsBackend });
  } else if (method === "POST") {
    // Add new student
    const student = { ...req.body, id: Date.now().toString() + Math.random().toString(36).slice(2) };
    studentsBackend.push(student);
    res.status(201).json({ data: student });
  } else if (method === "PUT") {
    // Update student
    const { id } = req.query;
    const idx = studentsBackend.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ error: "Student not found" });
    studentsBackend[idx] = { ...studentsBackend[idx], ...req.body };
    res.status(200).json({ data: studentsBackend[idx] });
  } else if (method === "DELETE") {
    // Delete student
    const { id } = req.query;
    studentsBackend = studentsBackend.filter((s) => s.id !== id);
    res.status(200).json({ message: "Student deleted" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
