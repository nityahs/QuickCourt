import { Router } from 'express';
import { generateICS } from '../lib/ics.js';
const r = Router();

r.get('/maps/link', (req,res)=>{
  const { destLat, destLng } = req.query;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  res.json({ url });
});

r.get('/weather', (req,res)=>{
  // Mock weather. Plug a real API later.
  res.json({ tempC: 34, condition: 'Sunny', heatIndex: 39, windKph: 12, rainChance: 10 });
});

r.get('/ics/:title', (req,res)=>{
  const now = new Date();
  const end = new Date(now.getTime()+60*60*1000);
  const ics = generateICS({ title: req.params.title, startISO: now.toISOString(), endISO: end.toISOString(), location: 'QuickCourt Facility' });
  res.setHeader('Content-Type','text/calendar');
  res.send(ics);
});

export default r;