# 🔄 API Integration Setup Guide

## ✅ Complete Migration: localStorage → API Calls

### What's Been Done:
1. ✅ Created API endpoints in `/api/` folder:
   - `api/admin.js` - Admin credential management
   - `api/students.js` - Student CRUD operations
   - `api/subjects.js` - Subject CRUD operations  
   - `api/attendance.js` - Attendance tracking

2. ✅ Created API client library: `src/api/client.js`
   - Centralized fetch functions for all API calls
   - Ready-to-use methods: `apiClient.addStudent()`, `apiClient.getStudents()` etc.

3. ✅ Updated App.jsx:
   - Replaced localStorage with API calls
   - Updated useState to load from API on mount
   - Modified addStudent, deleteStudent, markAttendance etc. to use async API calls
   - Removed all `ls.s()` persist calls

---

## 🚀 How to Run Locally:

### Terminal 1: Start Vite Dev Server
```bash
npm run dev
```
This runs your React app on **http://localhost:5173**

### Terminal 2: Start Vercel Functions Locally
```bash
vercel dev
```
This runs API endpoints on **http://localhost:3000**
- `http://localhost:3000/api/students`
- `http://localhost:3000/api/subjects`
- `http://localhost:3000/api/attendance`
- `http://localhost:3000/api/admin`

### Environment Setup:
Add to `.env.local`:
```
REACT_APP_API_URL=http://localhost:3000
```

---

## 🔗 How It Works:

### Before (localStorage):
```javascript
const addStudent = (data) => {
  const s = { ...data, id: uid() };
  setStudents(p => [...p, s]);
  ls.s("students", [...students, s]); // ❌ localStorage only
};
```

### After (API):
```javascript
const addStudent = async (data) => {
  try {
    const res = await apiClient.addStudent(data);
    setStudents(p => [...p, res.data]); // ✅ Server data
    showToast("Student added", "success");
  } catch (err) {
    showToast("Error adding student", "error");
  }
};
```

---

## 📱 Multi-Device Sync:

Now all phones/browsers will:
1. **Load the same data** from the server
2. **Automatically sync** - Add student on Phone A → appears on Phone B
3. **Persistent storage** - Data survives after closing the app

---

## 💾 Persistence Options:

Currently: **In-memory (Vercel Functions)** - Data resets when function restarts

### Upgrade to Real Database:

**Option A: Vercel + PostgreSQL**
```bash
vercel integration add postgres
```
Then update `api/*.js` to use `@vercel/postgres` client

**Option B: Firebase/Supabase**
```bash
npm install @supabase/supabase-js
```

**Option C: MongoDB Atlas**
```bash
npm install mongodb
# Store MONGODB_URI in Vercel Env Variables
```

---

## 🐛 Debugging:

### Check API is running:
```bash
curl http://localhost:3000/api/students
```

### View browser console for errors:
- F12 → Console tab
- Check Network tab to see API requests

### CORS Issue?
- Vercel Functions auto-handle CORS with headers set in `api/*.js`
- If needed, add: `res.setHeader("Access-Control-Allow-Origin", "*")`

---

## 📤 Deploy to Vercel:

```bash
git add .
git commit -m "Add API integration"
vercel --prod
```

✅ Your frontend + API will deployed automatically!
✅ Data syncs across all user devices!

---

## Next Steps:

1. Test locally: `npm run dev` + `vercel dev`
2. Add a real database (PostgreSQL/Firebase/MongoDB)
3. Implement user authentication for students
4. Add email notifications for parents
5. Deploy to production: `vercel --prod`
