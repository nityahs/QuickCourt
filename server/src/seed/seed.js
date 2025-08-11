import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Facility from '../models/Facility.js';
import Court from '../models/Court.js';
import TimeSlot from '../models/TimeSlot.js';
import PriceEvent from '../models/PriceEvent.js';

const days = (n)=>{ const a=[]; const d=new Date(); for(let i=0;i<n;i++){const x=new Date(d); x.setDate(d.getDate()+i); a.push(x.toISOString().slice(0,10));} return a; };

await connectDB();
await Promise.all([
  User.deleteMany({}), Facility.deleteMany({}), Court.deleteMany({}), TimeSlot.deleteMany({}), PriceEvent.deleteMany({})
]);

const admin = await User.create({ name:'Admin', email:'admin@qc.com', passwordHash:'', role:'admin', otpVerified:true });
const owner = await User.create({ name:'Owner', email:'owner@qc.com', passwordHash:'', role:'owner', otpVerified:true });
const user = await User.create({ name:'User', email:'user@qc.com', passwordHash:'', role:'user', otpVerified:true });

const fac = await Facility.create({ ownerId: owner._id, name:'Galaxy Sports Arena', description:'Indoor courts', address:'MG Road', geolocation:{lat:22.72,lng:75.86}, sports:['badminton','table-tennis'], amenities:['Parking','Water'], photos:[], status:'approved', startingPricePerHour:500, ratingAvg:4.5, ratingCount:12 });

const courts = await Court.insertMany([
  { facilityId: fac._id, name:'Court 1', sport:'badminton', pricePerHour:500, operatingHours:{open:'06:00', close:'22:00'} },
  { facilityId: fac._id, name:'Court 2', sport:'badminton', pricePerHour:600, operatingHours:{open:'06:00', close:'22:00'} }
]);

const dates = days(3);
for (const c of courts) {
  for (const dateISO of dates) {
    for (let h=6; h<=21; h++) {
      const start = `${String(h).padStart(2,'0')}:00`;
      const end = `${String(h+1).padStart(2,'0')}:00`;
      await TimeSlot.create({ courtId: c._id, dateISO, start, end, isBlocked:false, isBooked:false, priceSnapshot: c.pricePerHour });
    }
  }
  for (let i=0;i<40;i++) {
    const price = c.pricePerHour + Math.floor(Math.random()*150-75);
    await PriceEvent.create({ courtId: c._id, price });
  }
}

console.log('Seeded!');
process.exit(0);