import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import showtimeRoutes from './routes/showtime.routes';
import bookingRoutes from './routes/booking.routes';
import chatRoutes from './routes/chat.routes';
import genreRoutes from './routes/genre.routes';
import actorRoutes from './routes/actor.routes';
import userRoutes from './routes/user.routes';
import cinemaRoutes from './routes/cinema.routes';
import foodRoutes from './routes/food.routes';
import voucherRoutes from './routes/voucher.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';
import seatholdRoutes from './routes/seathold.routes';
import ticketRoutes from './routes/ticket.routes';
import blogRoutes from './routes/blog.routes';
import promotionRoutes from './routes/promotion.routes';
import priceRoutes from './routes/price.routes';

// Tối ưu hóa: Bật nén HTTP Gzip/Brotli cho toàn bộ API responses
app.use(compression());
app.use(cors());

// Giữ lại rawBody cho Stripe Webhook signature verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/seathold', seatholdRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/prices', priceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
