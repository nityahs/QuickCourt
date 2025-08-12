import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthFix: React.FC = () => {
  const [isFixed, setIsFixed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Sample admin token - in a real app, this would be generated securely
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjRhZjQ1ZDRiODJhMDAxODg0YzJiZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxMDUyMzIwNSwiZXhwIjoxNzEzMTE1MjA1fQ.Ht_XTdJYOWBqVZVszvTSXIVVAZkrAkNQJQkl5FLF9Xo';

  // Sample admin user object
  const adminUser = {
    id: '65f4af45d4b82a001884c2bf',
    email: 'admin@gmail.com',
    fullName: 'Test Admin',
    role: 'admin',
    isVerified: true
  };

  const fixAdminAuth = () => {
    try {
      // Set the token in localStorage
      localStorage.setItem('quickcourt_token', adminToken);
      
      // Set the user object in localStorage
      localStorage.setItem('quickcourt_user', JSON.stringify(adminUser));
      
      setIsFixed(true);
      setTimeout(() => {
        navigate('/admin/facilities');
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error fixing admin auth:', err);
      setError('Failed to set authentication data. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Admin Authentication Fix</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h2 className="font-semibold text-yellow-800 mb-2">Issue Detected</h2>
        <p className="text-sm text-yellow-700">
          The admin facilities page is showing errors because the API requests to <code className="bg-yellow-100 px-1 rounded">/api/admin/facilities</code> are returning 401 Unauthorized errors.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}
      
      {isFixed ? (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">
          Authentication fixed successfully! Redirecting to admin facilities page...
        </div>
      ) : (
        <button
          onClick={fixAdminAuth}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-200"
        >
          Apply Authentication Fix
        </button>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Note: This is a temporary fix for development purposes only.</p>
      </div>
    </div>
  );
};

export default AdminAuthFix;