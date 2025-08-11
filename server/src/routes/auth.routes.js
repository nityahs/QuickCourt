import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, auth } from '../lib/jwt.js';
import { required } from '../lib/validators.js';
const r = Router();

r.post('/signup', required(['name','email','password','role']), async (req,res,next)=>{
  try{
    const { name,email,password,role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000+Math.random()*900000).toString();
    const user = await User.create({ name,email,passwordHash,role, otp, otpVerified:false });
    // TODO: send OTP via email/SMS stub
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

export default r;