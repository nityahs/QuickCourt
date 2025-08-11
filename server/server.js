import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import facilitiesRoutes from './src/routes/facilities.routes.js';
import courtsRoutes from './src/routes/courts.routes.js';
import slotsRoutes from './src/routes/slots.routes.js';
import bookingsRoutes from './src/routes/bookings.routes.js';
import offersRoutes from './src/routes/offers.routes.js';
import reviewsRoutes from './src/routes/reviews.routes.js';
import couponsRoutes from './src/routes/coupons.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import integrationsRoutes from './src/routes/integrations.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import { initSocket } from './src/ws/socket.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(helmet());
const origins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return cb(null, true);
    if (origins.filter(Boolean).includes(origin)) return cb(null, true);
    // allow LAN IPs during dev
    if (/^http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, service: 'quickcourt' }));

app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/courts', courtsRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
connectDB().then(() => {
  server.listen(PORT, HOST, () => console.log(`API running on ${HOST}:${PORT}`));
});