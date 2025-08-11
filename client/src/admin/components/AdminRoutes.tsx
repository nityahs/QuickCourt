import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';
import FacilityApproval from '../pages/FacilityApproval';
import UserManagement from '../pages/UserManagement';
import Profile from '../pages/Profile';
import { User } from '../../types';

const AdminRoutes: React.FC = () => {
  const { user: contextUser } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use either context user or localStorage user
  const user = contextUser || localUser;

  // Add debugging information and load user from localStorage if needed
  useEffect(() => {
    console.log('AdminRoutes component mounted');
    console.log('Current user from context:', contextUser);
    
    // Check localStorage directly as a fallback
    const storedUserJson = localStorage.getItem('quickcourt_user');
    if (storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson);
        console.log('User from localStorage:', storedUser);
        
        // If we don't have a user from context, use the localStorage one
        if (!contextUser && storedUser && storedUser.role === 'admin') {
          console.log('Using admin user from localStorage');
          setLocalUser(storedUser);
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    } else {
      console.log('No user found in localStorage');
    }
    
    setIsLoading(false);
  }, [contextUser]);

  // Show loading state
  if (isLoading) {
    return <div>Loading admin dashboard...</div>;
  }

  // Redirect if not admin
  if (!user) {
    console.log('No user found, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'admin') {
    console.log(`User role is ${user.role}, not admin. Redirecting to home`);
    return <Navigate to="/" replace />;
  }
  
  console.log('Admin user confirmed, rendering admin routes');

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/facilities" element={<FacilityApproval />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;