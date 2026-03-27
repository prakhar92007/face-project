// api/attendance.js - Attendance API endpoint

let attendanceBackend = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;

  if (method === "GET") {
    res.status(200).json({ data: attendanceBackend });
  } else if (method === "POST") {
    const record = { ...req.body, id: Date.now().toString() + Math.random().toString(36).slice(2) };
    attendanceBackend.push(record);
    res.status(201).json({ data: record });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
