// api/admin.js - Admin credentials API

let adminBackend = null;

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;

  if (method === "GET") {
    res.status(200).json({ data: adminBackend });
  } else if (method === "POST") {
    // Simple setup - in production, add password hashing
    adminBackend = req.body;
    res.status(201).json({ data: adminBackend, message: "Admin account created" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
