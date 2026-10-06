import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

export default function StaffScanner() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        navigate('/login', { replace: true });
        return;
      }
    } catch (e) {
      navigate('/login', { replace: true });
      return;
    }
  }, []);
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/tickets/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: ticketInput })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setErrorMsg(data.message || 'Mã vé không hợp lệ');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến hệ thống xác thực vé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-zoom-80 min-h-[125vh] w-[125vw] bg-slate-900 dark:bg-[#0a0d14] flex flex-col justify-center items-center p-6 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-[#1a1e29] border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-2 text-center">HỆ THỐNG SOÁT VÉ TẠI RẠP (STAFF SCANNER)</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Nhập mã vé hoặc dữ liệu mã QR từ vé của khách hàng để check-in vào phòng chiếu.</p>

        <form onSubmit={handleVerify} className="flex gap-3 mb-8">
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="Nhập mã vé (Ví dụ: GLX-102948)..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-orange-500 font-mono font-bold"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {loading ? 'ĐANG KIỂM TRA...' : 'XÁC THỰC VÉ'}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl text-center font-bold mb-6">
            ❌ {errorMsg}
          </div>
        )}

        {result && result.valid && (
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-6 text-white animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex items-center gap-3 text-green-400 text-xl font-bold mb-4 border-b border-green-500/30 pb-3">
              <span>✓</span> {result.message}
            </div>
            
            <div className="space-y-3 text-sm">
              <p><strong className="text-gray-400">Mã vé:</strong> <span className="font-mono text-orange-400 font-bold">{result.bookingDetails.ticketCode}</span></p>
              <p><strong className="text-gray-400">Khách hàng:</strong> {result.bookingDetails.customerName} ({result.bookingDetails.customerEmail})</p>
              <p><strong className="text-gray-400">Tên phim:</strong> <span className="font-bold text-lg text-white">{result.bookingDetails.movieTitle}</span></p>
              <p><strong className="text-gray-400">Rạp & Phòng chiếu:</strong> {result.bookingDetails.cinemaName} - <span className="text-orange-400 font-bold">{result.bookingDetails.roomName}</span></p>
              <p><strong className="text-gray-400">Ghế ngồi:</strong> <span className="text-xl font-black text-orange-500">{result.bookingDetails.seats.join(', ')}</span></p>
              {result.bookingDetails.foods.length > 0 && (
                <p><strong className="text-gray-400">Bắp nước kèm:</strong> {result.bookingDetails.foods.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
