export const roleGuard = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  // Handle role mapping: 'facility_owner' maps to 'owner' in the backend
  const userRole = req.user.role === 'facility_owner' ? 'owner' : req.user.role;
  
  if (!roles.includes(userRole)) return res.status(403).json({ error: 'Forbidden' });
  next();
};