import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, auth } from '../lib/jwt.js';
import { required } from '../lib/validators.js';
import { sendOtpEmail } from '../lib/mailer.js';
const r = Router();

r.post('/signup', required(['email','password']), async (req,res,next)=>{
  try{
  let { name, fullName, email, password, role } = req.body;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[signup] incoming body', { name, fullName, email, role, hasPassword: !!password });
    }
  // Allow either name or fullName
  name = name || fullName;
  if (!name) return res.status(400).json({ error: 'Missing name', code:'MISSING_NAME' });
  // Map potential client provided role variants; default to user
  if (!role) role = 'user';
  if (role === 'facility_owner') role = 'owner';
  if (!['user','owner','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role', code:'INVALID_ROLE' });
    const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email in use', code:'EMAIL_IN_USE' });
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000+Math.random()*900000).toString();
    const user = await User.create({ name,email,passwordHash,role, otp, otpVerified:false });
    // Send OTP email (best-effort)
    sendOtpEmail({ to: email, name, otp }).catch(()=>{});
    res.json({ message:'OTP sent', userId:user._id });
  }catch(e){ next(e); }
});

r.post('/verify-otp', required(['userId','otp']), async (req,res,next)=>{
  try{
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error:'User not found' });
    if(user.otp !== otp) return res.status(400).json({ error:'Invalid OTP' });
    user.otpVerified = true; user.otp = undefined; await user.save();
    const token = signToken({ _id:user._id, role:user.role });
    res.json({ token });
  }catch(e){ next(e); }
});

r.post('/login', required(['email','password']), async (req,res,next)=>{
  try{
    const { email,password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ error:'Invalid credentials' });
    const token = signToken({ _id:user._id, role:user.role });
    res.json({ token });
  }catch(e){ next(e); }
});

r.get('/me', auth, async (req,res)=>{
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json(user);
});

r.post('/change-password', auth, required(['currentPassword', 'newPassword']), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) return res.status(400).json({ error: 'Current password is incorrect' });
    
    // Hash and save new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (e) { 
    next(e); 
  }
});

export default r;