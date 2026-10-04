import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home, Film } from 'lucide-react';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="cinema-glass p-8 sm:p-10 rounded-3xl text-center max-w-lg w-full border border-white/10 shadow-2xl animate-[fadeIn_0.4s_ease-out]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
          <XCircle size={36} />
        </div>

        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-amber-400 block mb-2">
          Giao Dịch Đã Hủy
        </span>

        <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-3">
          Thanh Toán Chưa Hoàn Tất
        </h1>

        <p className="text-xs text-white/60 leading-relaxed mb-8 max-w-sm mx-auto">
          Giao dịch thanh toán trực tuyến qua cổng Stripe của bạn đã được hủy hoặc chưa hoàn tất. Ghế và vé của đơn hàng {bookingId ? <span className="font-mono text-amber-300">#{bookingId.slice(0, 8)}</span> : ''} chưa được xuất.
        </p>

        <div className="space-y-3">
          <Link
            to="/movies"
            className="cinema-btn-primary w-full py-3.5 text-xs flex items-center justify-center gap-2 font-bold"
          >
            <RefreshCw size={15} /> Thử Đặt Vé Lại
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/movies"
              className="cinema-btn-glass py-2.5 text-xs flex items-center justify-center gap-2 font-semibold"
            >
              <Film size={14} /> Chọn Phim Khác
            </Link>
            <Link
              to="/"
              className="cinema-btn-glass py-2.5 text-xs flex items-center justify-center gap-2 font-semibold"
            >
              <Home size={14} /> Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
