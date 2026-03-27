// api/subjects.js - Subjects API endpoint

let subjectsBackend = [];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;

  if (method === "GET") {
    res.status(200).json({ data: subjectsBackend });
  } else if (method === "POST") {
    const subject = { ...req.body, id: Date.now().toString() + Math.random().toString(36).slice(2) };
    subjectsBackend.push(subject);
    res.status(201).json({ data: subject });
  } else if (method === "DELETE") {
    const { id } = req.query;
    subjectsBackend = subjectsBackend.filter((s) => s.id !== id);
    res.status(200).json({ message: "Subject deleted" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
