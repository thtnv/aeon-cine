import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Mail, Home, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !bookingId) {
      setError('Thiếu thông tin phiên thanh toán Stripe.');
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/confirm-stripe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, bookingId })
        });

        const data = await res.json();
        if (res.ok && data.booking) {
          setBooking(data.booking);
        } else {
          setError(data.message || 'Không thể xác nhận giao dịch thanh toán.');
        }
      } catch (err: any) {
        console.error('Error confirming Stripe payment:', err);
        setError('Có lỗi xảy ra khi kết nối máy chủ xác nhận.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId, bookingId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="cinema-glass p-8 rounded-3xl text-center max-w-md w-full border border-white/10 shadow-2xl">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-2">
            Đang Xác Nhận Thanh Toán...
          </h2>
          <p className="text-xs text-white/50 leading-relaxed">
            Hệ thống đang đồng bộ với cổng thanh toán quốc tế Stripe và khởi tạo vé điện tử kèm email xác nhận.
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="cinema-glass p-8 rounded-3xl text-center max-w-md w-full border border-red-500/20 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-2">
            Xác Nhận Chưa Thành Công
          </h2>
          <p className="text-xs text-red-300/80 mb-6">{error || 'Không tìm thấy thông tin vé.'}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/profile" className="cinema-btn-primary text-xs px-5 py-2.5 font-bold">
              Kiểm tra trang cá nhân
            </Link>
            <Link to="/" className="cinema-btn-glass text-xs px-5 py-2.5 font-semibold">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstTicket = booking.tickets && booking.tickets.length > 0 ? booking.tickets[0] : null;
  const movie = firstTicket?.showtime?.movie;
  const room = firstTicket?.showtime?.room;
  const cinema = room?.cinema;
  const startTime = firstTicket?.showtime?.startTime 
    ? new Date(firstTicket.showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
    : 'Chưa xác định';
  const showDate = firstTicket?.showtime?.startTime 
    ? new Date(firstTicket.showtime.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : '';
  const seatNames = booking.tickets ? booking.tickets.map((t: any) => t.seat?.name).join(', ') : 'Ghế đã chọn';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-[fadeIn_0.5s_ease-out]">
      {/* Success Badge Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={36} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
            Thanh Toán Quốc Tế Stripe Thành Công
          </span>
          <Sparkles size={16} className="text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase">
          Vé Điện Tử Đã Được Khởi Tạo!
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Cảm ơn bạn đã đặt vé tại Aeon Cine. Mã vé và QR Code của bạn đã sẵn sàng.
        </p>
      </div>

      {/* SMTP Email Alert Notification */}
      <div className="cinema-glass border border-amber-500/30 bg-amber-500/[0.05] p-4 rounded-2xl mb-8 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Mail size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-0.5">
            Biên lai & Vé điện tử đã gửi qua Email
          </h4>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Hệ thống đã tự động gửi email xác nhận kèm mã QR vé xem phim chi tiết tới hòm thư:{' '}
            <strong className="text-white font-mono">{booking.user?.email || 'email tài khoản của bạn'}</strong>.
          </p>
        </div>
      </div>

      {/* LUXURY CINEMA BOARDING PASS E-TICKET */}
      <div className="cinema-glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-6 text-black flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded text-white">
              Aeon Cine Prestige Pass
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-black uppercase mt-1">
              {movie?.title || 'Phim Điện Ảnh'}
            </h2>
            <p className="text-xs font-semibold text-black/80 mt-0.5">
              {cinema?.name || 'Aeon Cine'} • {room?.name || 'Phòng chiếu VIP'}
            </p>
          </div>
          <div className="text-right">
            <Ticket size={36} className="text-black/70 ml-auto" />
            <span className="text-[10px] font-mono font-black uppercase text-black/90">
              {firstTicket?.showtime?.format || '2D'} {firstTicket?.showtime?.language || 'Phụ đề'}
            </span>
          </div>
        </div>

        {/* Ticket Body with QR Code */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Mã Vé Điện Tử</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-gradient-gold tracking-widest">
                {booking.ticketCode || 'GLX-XXXXXX'}
              </div>
              <span className="text-[11px] text-white/50 mt-1 block">
                Cung cấp mã này hoặc quét QR tại cổng soát vé
              </span>
            </div>

            {booking.qrCodeUrl && (
              <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 border-2 border-amber-500/40">
                <img 
                  src={booking.qrCodeUrl} 
                  alt="Ticket QR Code" 
                  className="w-32 h-32 object-contain"
                />
              </div>
            )}
          </div>

          {/* Ticket Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-white/40 text-[10px] uppercase block mb-1">Ngày chiếu</span>
              <strong className="text-white capitalize block">{showDate}</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-white/40 text-[10px] uppercase block mb-1">Suất chiếu</span>
              <strong className="text-amber-400 font-mono text-sm block">{startTime}</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-white/40 text-[10px] uppercase block mb-1">Số ghế</span>
              <strong className="text-amber-300 font-mono text-sm block">{seatNames}</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-white/40 text-[10px] uppercase block mb-1">Tổng tiền</span>
              <strong className="text-emerald-400 font-mono text-sm block">
                {Number(booking.total).toLocaleString()} đ
              </strong>
            </div>
          </div>

          {/* Food Items if any */}
          {booking.foodItems && booking.foodItems.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
              <span className="text-white/40 text-[10px] uppercase block mb-1">Bắp nước & Combo:</span>
              <div className="text-white/90 font-medium">
                {booking.foodItems.map((f: any, idx: number) => (
                  <span key={f.id || idx} className="mr-3 inline-block">
                    🍿 {f.quantity}x {f.food?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/[0.06] pt-4">
            <span>Phương thức: <strong className="text-white font-mono">Stripe Checkout (Thẻ quốc tế)</strong></span>
            <span>Trạng thái: <strong className="text-emerald-400 font-semibold">Đã thanh toán (PAID)</strong></span>
          </div>
        </div>

        {/* Dashed Tear-Off Stub */}
        <div className="border-t-2 border-dashed border-white/20 p-4 bg-black/40 text-center">
          <p className="text-[11px] text-white/40 font-mono">
            ★ AEON CINE TICKETING SYSTEM • PLEASE ARRIVE 10 MINUTES BEFORE SHOWTIME ★
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
        <Link 
          to="/profile" 
          className="cinema-btn-primary w-full sm:w-auto px-6 py-3 text-xs flex items-center justify-center gap-2 font-bold"
        >
          <User size={15} /> Xem Trong Lịch Sử Đặt Vé
        </Link>
        <Link 
          to="/" 
          className="cinema-btn-glass w-full sm:w-auto px-6 py-3 text-xs flex items-center justify-center gap-2 font-semibold"
        >
          <Home size={15} /> Về Trang Chủ Aeon Cine
        </Link>
      </div>
    </div>
  );
}
