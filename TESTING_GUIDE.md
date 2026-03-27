// Testing Guide: Verify API Integration Works

// 1. Start both servers:
// Terminal 1: npm run dev              (Frontend on :5173)
// Terminal 2: vercel dev              (Backend on :3000)

// 2. Test API endpoints manually:

// GET all students
curl -X GET http://localhost:3000/api/students

// ADD a student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@school.edu","rollNo":"2024CS001","parentEmail":"parent@email.com"}'

// GET all subjects
curl -X GET http://localhost:3000/api/subjects

// ADD a subject
curl -X POST http://localhost:3000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name":"Mathematics","code":"MATH101"}'

// MARK attendance
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"studentId":"123","subjectId":"456","date":"2024-03-27"}'

// GET all attendance
curl -X GET http://localhost:3000/api/attendance

// 3. Test in Browser Console:

// Open browser at http://localhost:5173
// Press F12 → Console tab
// Run these commands:

// Check if API client is loaded
import { apiClient } from './api/client';

// Get students from server
apiClient.getStudents().then(res => console.log(res));

// Add a student
apiClient.addStudent({
  name: "Alice Smith",
  email: "alice@school.edu",
  rollNo: "2024CS002",
  parentEmail: "alice.parent@email.com"
}).then(res => console.log(res));

// Get updated list
apiClient.getStudents().then(res => console.log(res));

// 4. Check Browser Network Tab:

// All API calls should show up in Network tab
// Look for requests to http://localhost:3000/api/*
// Response should be JSON with { data: [...] }

// 5. Check for errors:

// If you see CORS errors - they're already fixed in api/*.js files
// If you see "Cannot find module" - make sure all files are created
// If you see network errors - verify both servers are running

// Expected errors to watch for:
// ❌ ERR_CONNECTION_REFUSED - Backend not running (vercel dev)
// ❌ Module not found - Missing src/api/client.js
// ✅ All working! - See data in console logs
