import { useState, useEffect } from 'react';
import { 
  Receipt, Search, Download, Eye, CheckCircle2, Clock, 
  RefreshCw, QrCode, X 
} from 'lucide-react';
import { API_URL } from '../../config/api';

interface BookingItem {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string; phone?: string };
  status: string;
  total: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus: string;
  ticketCode?: string;
  qrCodeUrl?: string;
  voucherCode?: string;
  createdAt: string;
  tickets?: Array<{
    id: string;
    price: number;
    seat: { name: string; type: string };
    showtime?: {
      format: string;
      startTime: string;
      movie?: { title: string; posterUrl?: string };
      room?: { name: string; cinema?: { name: string } };
    };
  }>;
  foodItems?: Array<{
    id: string;
    quantity: number;
    price: number;
    food: { name: string; price: number };
  }>;
}

export default function OrderManager() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
        }
      })
      .catch(err => console.error('Error fetching bookings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.ticketCode && b.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.id && b.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.user?.name && b.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.user?.email && b.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.user?.phone && b.user.phone.includes(searchTerm));

    const matchesStatus = 
      statusFilter === 'ALL' || 
      b.paymentStatus === statusFilter || 
      (statusFilter === 'PAID' && (b.paymentStatus === 'PAID' || b.status === 'COMPLETED')) ||
      (statusFilter === 'PENDING' && (b.paymentStatus === 'UNPAID' || b.status === 'PENDING'));

    const matchesPayment = 
      paymentFilter === 'ALL' || 
      (b.paymentMethod && b.paymentMethod.toUpperCase() === paymentFilter.toUpperCase());

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate Metrics
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'PAID' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.total) || 0), 0);

  const paidCount = bookings.filter(b => b.paymentStatus === 'PAID' || b.status === 'COMPLETED').length;
  const pendingCount = bookings.filter(b => b.paymentStatus === 'UNPAID' || b.status === 'PENDING').length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Mã Đơn', 'Mã Vé', 'Khách Hàng', 'Email', 'SĐT', 'Tổng Tiền (VNĐ)', 'Giảm Giá (VNĐ)', 'Phương Thức', 'Trạng Thái', 'Ngày Tạo'];
    const rows = filteredBookings.map(b => [
      `"${b.id}"`,
      `"${b.ticketCode || ''}"`,
      `"${b.user?.name || 'Khách'}"`,
      `"${b.user?.email || ''}"`,
      `"${b.user?.phone || ''}"`,
      b.total || 0,
      b.discountAmount || 0,
      `"${b.paymentMethod || 'VNPAY'}"`,
      `"${b.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}"`,
      `"${new Date(b.createdAt).toLocaleString('vi-VN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_Don_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Receipt size={13} /> Sổ Cái Đơn Hàng & Doanh Thu
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Quản Lý Đơn Đặt Vé & Giao Dịch
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Theo dõi dòng tiền, đối soát thanh toán trực tuyến và xuất báo cáo tài chính rạp phim
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:text-orange-500 hover:border-orange-500/30 transition-all cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Download size={14} /> Xuất Báo Cáo Excel (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              ₫
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalRevenue.toLocaleString('vi-VN')} <span className="text-sm font-sans font-normal">đ</span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
            ✓ Đã hạch toán thành công
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Tổng Số Đơn Hàng</span>
            <Receipt size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {bookings.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium mt-1 inline-block">
            Toàn bộ giao dịch hệ thống
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Đã Thanh Toán</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {paidCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium mt-1 inline-block">
            Tỷ lệ thành công {bookings.length > 0 ? Math.round((paidCount / bookings.length) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Chờ Xử Lý / Hủy</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {pendingCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium mt-1 inline-block">
            Đơn đang giữ ghế hoặc chưa trả tiền
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã vé, Mã đơn, Tên, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="PENDING">Chờ thanh toán (UNPAID)</option>
          </select>

          {/* Payment Method filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Mọi cổng thanh toán</option>
            <option value="VNPAY">VNPAY</option>
            <option value="MOMO">MoMo</option>
            <option value="STRIPE">Stripe</option>
            <option value="CASH">Tiền mặt (CASH)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-gray-800">
                <th className="py-3 px-4">Mã Vé / Đơn Hàng</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Suất Chiếu & Ghế</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Cổng TT</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-medium">
              {filteredBookings.slice(0, 50).map(booking => {
                const isPaid = booking.paymentStatus === 'PAID' || booking.status === 'COMPLETED';
                const firstTicket = booking.tickets?.[0];
                const movieTitle = firstTicket?.showtime?.movie?.title || 'Phim rạp Aeon';
                const cinemaName = firstTicket?.showtime?.room?.cinema?.name || 'Aeon Cine';
                const seatNames = booking.tickets?.map(t => t.seat.name).join(', ') || 'Chưa chọn';

                return (
                  <tr key={booking.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <QrCode size={12} className="text-orange-500" />
                          {booking.ticketCode || 'GLX-CHƯA_CÓ'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 truncate max-w-[110px]" title={booking.id}>
                          {booking.id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-gray-200">
                          {booking.user?.name || 'Khách vãng lai'}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-gray-500">
                          {booking.user?.phone || booking.user?.email || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-slate-800 dark:text-gray-200 truncate" title={movieTitle}>
                          {movieTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-gray-400">
                          {cinemaName} • Ghế: <strong className="font-mono text-orange-600 dark:text-orange-400">{seatNames}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {Number(booking.total || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700">
                        {booking.paymentMethod || 'VNPAY'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock size={11} /> Chờ thanh toán
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                      {new Date(booking.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all font-semibold inline-flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết hóa đơn"
                      >
                        <Eye size={13} /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-gray-500">
                    Không tìm thấy đơn đặt vé nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredBookings.length > 50 && (
          <div className="p-3 text-center text-xs text-slate-400 dark:text-gray-500 border-t border-slate-100 dark:border-gray-800">
            Hiển thị 50 / {filteredBookings.length} đơn hàng gần nhất. Xuất Excel để xem toàn bộ.
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-gray-800 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="text-center pb-4 border-b border-slate-100 dark:border-gray-800 mb-4">
              <span className="text-[10px] font-mono uppercase font-bold text-orange-500">PHIẾU HẠCH TOÁN ĐƠN VÉ</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {selectedBooking.ticketCode || 'GLX-CHƯA_CÓ'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-mono mt-0.5">
                ID: {selectedBooking.id}
              </p>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                <span className="text-slate-500 dark:text-gray-400">Khách hàng:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedBooking.user?.name || 'Khách vãng lai'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                <span className="text-slate-500 dark:text-gray-400">Email:</span>
                <span className="font-mono text-slate-700 dark:text-gray-300">{selectedBooking.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                <span className="text-slate-500 dark:text-gray-400">Số điện thoại:</span>
                <span className="font-mono text-slate-700 dark:text-gray-300">{selectedBooking.user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                <span className="text-slate-500 dark:text-gray-400">Cổng thanh toán:</span>
                <span className="font-bold text-slate-800 dark:text-white uppercase">{selectedBooking.paymentMethod || 'VNPAY'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                <span className="text-slate-500 dark:text-gray-400">Trạng thái:</span>
                <span className={`font-bold ${selectedBooking.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {selectedBooking.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                </span>
              </div>
              {selectedBooking.voucherCode && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                  <span className="text-slate-500 dark:text-gray-400">Mã voucher áp dụng:</span>
                  <span className="font-mono font-bold text-orange-500">{selectedBooking.voucherCode}</span>
                </div>
              )}
              {Number(selectedBooking.discountAmount || 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-800/60">
                  <span className="text-slate-500 dark:text-gray-400">Số tiền chiết khấu voucher:</span>
                  <span className="font-mono text-emerald-500">-{Number(selectedBooking.discountAmount).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between py-2 items-center bg-slate-50 dark:bg-gray-800/50 px-3 rounded-xl">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Tổng thu thực tế:</span>
                <span className="font-mono font-black text-lg text-orange-500">
                  {Number(selectedBooking.total || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                In Phiếu Đối Soát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
