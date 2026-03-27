# ✅ Local Server API Integration Test Checklist

## 📋 Step-by-Step Verification:

### **Step 1: Start Frontend Server** ✨
```bash
npm run dev
```
- ✅ Should show: `VITE v5.0.8  ready in XXX ms`
- ✅ Local URL: `http://localhost:5173`
- ✅ Page loads without errors in browser console

### **Step 2: Start Backend API Server** 🔧
```bash
vercel dev
```
- ✅ Should show: `Ready! Available at http://localhost:3000`
- ✅ API endpoints ready:
  - `http://localhost:3000/api/students`
  - `http://localhost:3000/api/subjects`
  - `http://localhost:3000/api/attendance`
  - `http://localhost:3000/api/admin`

### **Step 3: Test in Browser** 🌐
1. Open `http://localhost:5173` in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Test API calls:

```javascript
// Test 1: Get students (should return empty array)
apiClient.getStudents().then(r => console.log(r))

// Expected output:
// { data: [] }  ✅ SUCCESS

// Test 2: Add a student
apiClient.addStudent({
  name: "Test Student",
  email: "test@school.edu",
  rollNo: "TEST001",
  parentEmail: "parent@test.edu"
}).then(r => console.log(r))

// Expected output:
// { data: { id: "abc123...", name: "Test Student", ... } }  ✅ SUCCESS

// Test 3: Get students again (should show 1 student)
apiClient.getStudents().then(r => console.log(r.data))

// Expected output:
// [ { id: "abc123...", name: "Test Student", ... } ]  ✅ SUCCESS
```

### **Step 4: Check Network Tab** 📡
1. In DevTools, go to **Network** tab
2. Run any API call from console
3. Should see request like:
   - `GET /api/students` → Status **200**
   - Response type: **json**
   - Response preview shows data

### **Step 5: Verify File Structure** 📁
```
✅ api/
   ├── admin.js
   ├── students.js
   ├── subjects.js
   └── attendance.js

✅ src/api/
   └── client.js

✅ src/App.jsx (imports apiClient)
```

---

## 🚨 Troubleshooting:

### **Problem: "Cannot GET /api/students"**
```
❌ Solution: vercel dev is not running
✅ Fix: Start Terminal 2: vercel dev
```

### **Problem: "ERR_CONNECTION_REFUSED"**
```
❌ Solution: Backend port is wrong or not running
✅ Fix: Check .env.local has REACT_APP_API_URL=http://localhost:3000
✅ Fix: Restart: vercel dev
```

### **Problem: CORS Error**
```
❌ Old system would show: "Access to XMLHttpRequest has been blocked by CORS"
✅ Fixed: All api/*.js files have CORS headers
✅ If still error: Check Network tab, should see OPTIONS request with 200 status
```

### **Problem: "apiClient is not defined"**
```
❌ Solution: apiClient not imported in App.jsx
✅ Fix: Check line 2 of App.jsx:
   import { apiClient } from "./api/client";
```

### **Problem: ".env.local not working"**
```
❌ Solution: .env.local not being read
✅ Fix: Restart npm run dev
✅ Verify: In console: console.log(process.env.REACT_APP_API_URL)
```

---

## ✅ Integration Status Checklist:

- [ ] npm run dev running on :5173
- [ ] vercel dev running on :3000
- [ ] Browser console shows no errors
- [ ] apiClient.getStudents() returns { data: [...] }
- [ ] apiClient.addStudent() creates new record
- [ ] Network tab shows 200 responses
- [ ] Data persists across page refreshes
- [ ] Multiple tabs show same data (sync working)

---

## 🎉 All Tests Passing?

Your API integration is **WORKING** ✅

Next steps:
1. Deploy to Vercel: `vercel --prod`
2. Add real database: PostgreSQL/Firebase/MongoDB
3. Implement authentication tokens

---
