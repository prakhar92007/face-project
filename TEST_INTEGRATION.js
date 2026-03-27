// Quick Integration Test - Run this in browser console
// 
// Steps:
// 1. Start: npm run dev (Terminal 1)
// 2. Start: vercel dev (Terminal 2)
// 3. Open: http://localhost:5173
// 4. Press F12 → Console
// 5. Copy-paste code below:

console.log("🔍 Testing API Integration...\n");

// Test 1: Check if apiClient is imported
console.log("✓ Testing apiClient import...");
import { apiClient } from "./api/client";
console.log("✓ apiClient loaded:", typeof apiClient === "object" ? "✅ SUCCESS" : "❌ FAILED");

// Test 2: Check API_BASE URL
console.log("\n✓ Testing API Base URL...");
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
console.log("API_BASE:", API_BASE, API_BASE === "http://localhost:3000" ? "✅ OK" : "⚠️ Check .env.local");

// Test 3: Try to fetch students (should return empty array initially)
console.log("\n✓ Testing GET /api/students...");
apiClient.getStudents()
  .then(res => {
    console.log("Response:", res);
    if (res.data) {
      console.log("✅ SUCCESS - API is responding!");
      console.log("Students count:", res.data.length);
    } else {
      console.log("❌ FAILED - No data in response");
    }
  })
  .catch(err => {
    console.log("❌ ERROR - Cannot connect to API:", err.message);
    console.log("Make sure: vercel dev is running on http://localhost:3000");
  });

// Test 4: Try to add a student
console.log("\n✓ Testing POST /api/students...");
setTimeout(() => {
  apiClient.addStudent({
    name: "Test Student",
    email: "test@school.edu",
    rollNo: "TEST001",
    parentEmail: "parent@test.edu"
  })
    .then(res => {
      console.log("Added student response:", res);
      if (res.data?.id) {
        console.log("✅ SUCCESS - Student added with ID:", res.data.id);
      } else {
        console.log("⚠️ Check response format");
      }
    })
    .catch(err => console.log("❌ Error adding student:", err.message));
}, 500);

// Test 5: Check all API methods exist
console.log("\n✓ Checking all API methods...");
const methods = [
  "getAdmin", "setAdmin",
  "getStudents", "addStudent", "updateStudent", "deleteStudent",
  "getSubjects", "addSubject", "deleteSubject",
  "getAttendance", "markAttendance"
];
methods.forEach(m => {
  const exists = typeof apiClient[m] === "function";
  console.log(`  ${exists ? "✅" : "❌"} ${m}`);
});

console.log("\n✅ Integration Check Complete!");
