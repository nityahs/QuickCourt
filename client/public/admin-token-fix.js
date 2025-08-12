/**
 * Admin Token Fix Script
 * 
 * This script sets a valid admin JWT token in localStorage to help debug admin API access issues.
 */

// This is a sample JWT token for an admin user
// In a real application, you would generate this token properly through authentication
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjRhZjQ1ZDRiODJhMDAxODg0YzJiZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxMDUyMzIwNSwiZXhwIjoxNzEzMTE1MjA1fQ.Ht_XTdJYOWBqVZVszvTSXIVVAZkrAkNQJQkl5FLF9Xo';

// Set the token in localStorage
localStorage.setItem('quickcourt_token', adminToken);

// Create a user object for the admin
const adminUser = {
  id: '65f4af45d4b82a001884c2bf',
  email: 'admin@gmail.com',
  fullName: 'Test Admin',
  role: 'admin',
  isVerified: true
};

// Set the user object in localStorage
localStorage.setItem('quickcourt_user', JSON.stringify(adminUser));

console.log('Admin token and user data set in localStorage');
console.log('You can now access admin API endpoints');
console.log('Try refreshing the admin facilities page');

// Add a button to reload the page
const button = document.createElement('button');
button.textContent = 'Reload Page';
button.style.padding = '10px 20px';
button.style.margin = '20px';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '4px';
button.style.cursor = 'pointer';
button.onclick = () => window.location.reload();

// Add the button to the page
document.body.appendChild(button);