// This script will help debug and fix admin login issues

// 1. Check if the admin user exists in the database
// Run this command in your terminal:
// node server/src/seed/create-custom-admin.js

// 2. Verify the admin user was created successfully
// You should see a success message with login credentials

// 3. Check browser console for any errors during login
// Open browser developer tools (F12) before logging in

// 4. Verify localStorage after login
// After login, run this in browser console:
// console.log(JSON.parse(localStorage.getItem('quickcourt_user')))
// Make sure the role is 'admin'

// 5. Try accessing admin panel directly after login
// Navigate to: http://localhost:5173/admin

// 6. If still having issues, check network requests
// Look for failed API calls in the Network tab

// 7. Verify server is running
// Make sure your server is running on port 5001
// Check that API calls to http://localhost:5001/api are working

// 8. Clear browser cache and localStorage
// Run in browser console:
// localStorage.clear()
// Then refresh and try logging in again