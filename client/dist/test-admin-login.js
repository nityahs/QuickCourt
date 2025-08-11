/**
 * Admin Login Test Script
 * 
 * This script helps verify that the admin login and redirection is working properly.
 * It logs the current state of the localStorage and checks if the admin user is properly stored.
 */

console.log('=== ADMIN LOGIN TEST SCRIPT ===');

// Check if localStorage is available
if (typeof localStorage === 'undefined') {
  console.error('localStorage is not available in this environment');
} else {
  // Check for user data in localStorage
  const userJson = localStorage.getItem('quickcourt_user');
  console.log('User data in localStorage:', userJson ? 'Found' : 'Not found');
  
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      console.log('User data:', userData);
      console.log('User role:', userData.role);
      console.log('Is admin:', userData.role === 'admin');
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Check for token in localStorage
  const token = localStorage.getItem('quickcourt_token');
  console.log('Auth token in localStorage:', token ? 'Found' : 'Not found');
}

// Provide instructions for testing
console.log('\nTo test admin login:');
console.log('1. Clear localStorage (Application > Storage > Local Storage > Clear)');
console.log('2. Go to the login page');
console.log('3. Login with admin credentials (admin@gmail.com / Pass@123)');
console.log('4. Check if you are redirected to /admin');
console.log('5. If not redirected, check the console for error messages');

// Add a button to manually redirect to admin dashboard
if (typeof document !== 'undefined') {
  const button = document.createElement('button');
  button.textContent = 'Go to Admin Dashboard';
  button.style.padding = '10px 20px';
  button.style.margin = '20px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.onclick = function() {
    window.location.href = '/admin';
  };
  
  document.body.appendChild(button);
}

console.log('=== END OF TEST SCRIPT ===');