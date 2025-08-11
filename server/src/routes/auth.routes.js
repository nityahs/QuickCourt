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
  if (exists) {
    if (!exists.otpVerified) {
      // Resend OTP for unverified existing account and allow client to proceed to verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      exists.otp = otp;
      exists.otpExpiresAt = otpExpiresAt;
      await exists.save();
      console.log(`[signup] Resending OTP ${otp} to ${email} for existing user ${exists._id}`);
      // Send the SAME OTP that was stored in the database
      await sendOtpEmail({ to: email, name: name || exists.name || exists.fullName, otp });
      return res.json({ message: 'OTP resent', userId: exists._id });
    }
    return res.status(400).json({ error: 'Email in use', code:'EMAIL_IN_USE' });
  }
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000+Math.random()*900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const user = await User.create({ name,email,passwordHash,role, otp, otpExpiresAt, otpVerified:false });
    console.log(`[signup] Generated OTP ${otp} for new user ${user._id} (${email})`);
    // Send the SAME OTP that was stored in the database
    await sendOtpEmail({ to: email, name, otp });
    res.json({ message:'OTP sent', userId:user._id });
  }catch(e){ next(e); }
});

r.post('/verify-otp', required(['userId','otp']), async (req,res,next)=>{
  try{
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error:'User not found' });
    if (user.banned) return res.status(403).json({ error: 'You have been banned', code: 'BANNED' });
    if(user.otpVerified) return res.status(400).json({ error:'Email already verified' });
    if(!user.otp || user.otp !== otp) {
      console.log(`[verify-otp] OTP mismatch for user ${userId}: expected ${user.otp}, got ${otp}`);
      return res.status(400).json({ error:'Invalid OTP' });
    }
    if(user.otpExpiresAt && new Date() > user.otpExpiresAt) return res.status(400).json({ error:'OTP has expired' });
    console.log(`[verify-otp] OTP verified successfully for user ${userId}`);
    user.otpVerified = true; user.otp = undefined; user.otpExpiresAt = undefined; await user.save();
    const token = signToken({ _id:user._id, role:user.role });
    res.json({ token });
  }catch(e){ next(e); }
});

r.post('/resend-otp', required(['email']), async (req,res,next)=>{
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error:'User not found' });
    if (user.banned) return res.status(403).json({ error: 'You have been banned', code: 'BANNED' });
    if(user.otpVerified) return res.status(400).json({ error:'Email already verified' });
    
    // Generate new OTP
    const otp = Math.floor(100000+Math.random()*900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
    console.log(`[resend-otp] Generated new OTP ${otp} for user ${user._id} (${email})`);
    
    // Send the SAME OTP that was stored in the database
    await sendOtpEmail({ to: email, name: user.name || user.fullName, otp });
    res.json({ message:'New OTP sent', userId:user._id });
  }catch(e){ next(e); }
});

r.post('/login', required(['email','password']), async (req,res,next)=>{
  try{
    const { email,password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error:'Invalid credentials' });
    if (user.banned) return res.status(403).json({ error: 'You have been banned', code: 'BANNED' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ error:'Invalid credentials' });
    if (!user.otpVerified) {
      // Block login until email verification; surface a clear code and userId so client can continue OTP flow
      return res.status(403).json({ error: 'Email not verified. Please enter the verification code.', code: 'OTP_REQUIRED', userId: user._id });
    }
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

r.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, fullName, avatar } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Update name (accept either name or fullName)
    if (name || fullName) {
      user.name = name || fullName;
    }
    
    // Update avatar if provided
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    
    await user.save();
    
    // Return updated user without password hash
    const updatedUser = await User.findById(user._id).select('-passwordHash');
    res.json(updatedUser);
  } catch (e) { 
    next(e); 
  }
});

export default r;