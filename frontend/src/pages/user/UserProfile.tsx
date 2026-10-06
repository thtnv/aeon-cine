import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, Award, CheckCircle2, Clock, QrCode, Edit3, ShieldCheck, 
  X, DollarSign, RotateCcw, Gift, AlertTriangle, Sparkles, ChevronRight
} from 'lucide-react';
import { API_URL } from '../../config/api';
import UserAvatar from '../../components/UserAvatar';

interface Booking {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  ticketCode: string;
  qrCodeUrl: string;
  total: number;
  createdAt: string;
  tickets: Array<{
    seat: { name: string };
    showtime: {
      startTime: string;
      movie: { title: string; posterUrl: string };
      room: { name: string; cinema: { name: string } };
    };
  }>;
}

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [selectedQrBooking, setSelectedQrBooking] = useState<Booking | null>(null);
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [selectedRefundBooking, setSelectedRefundBooking] = useState<Booking | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState('');
  const [refundErrorMsg, setRefundErrorMsg] = useState('');

  // Edit Profile Form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('Nam');
  const [updateMsg, setUpdateMsg] = useState('');

  // Change Password Form
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch User Profile
      const userRes = await fetch(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-updated'));
        setEditName(userData.name || '');
        setEditPhone(userData.phone || '');
        setEditBirthDate(userData.birthDate || '');
        setEditGender(userData.gender || 'Nam');
        
        // Fetch User Bookings
        const bookingRes = await fetch(`${API_URL}/api/bookings/user/${userData.id}`);
        if (bookingRes.ok) {
          const bookingData = await bookingRes.json();
          if (Array.isArray(bookingData)) setBookings(bookingData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Calculate Progress Bar to Next Tier
  const points = user?.rewardPoints || 0;
  let currentTier = user?.membershipLevel || 'STAR';
  let nextTier = 'G-STAR';
  let targetPoints = 100;
  let progressPercent = Math.min(100, Math.floor((points / targetPoints) * 100));
  let pointsNeeded = targetPoints - points;

  if (points >= 500 || currentTier === 'X-STAR') {
    currentTier = 'X-STAR';
    nextTier = 'HẠNG TỐI ĐA (MAX)';
    targetPoints = 500;
    progressPercent = 100;
    pointsNeeded = 0;
  } else if (points >= 100 || currentTier === 'G-STAR') {
    currentTier = 'G-STAR';
    nextTier = 'X-STAR';
    targetPoints = 500;
    progressPercent = Math.min(100, Math.floor(((points - 100) / 400) * 100));
    pointsNeeded = 500 - points;
  }

  // Handle Edit Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUpdateMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          birthDate: editBirthDate,
          gender: editGender
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateMsg('✅ Cập nhật thông tin thành công!');
        fetchUserData();
        setTimeout(() => setShowEditProfileModal(false), 1500);
      } else {
        setUpdateMsg(`❌ ${data.message}`);
      }
    } catch {
      setUpdateMsg('❌ Lỗi kết nối đến máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmNewPass) {
      setPassMsg('❌ Mật khẩu mới không khớp!');
      return;
    }
    setSubmitting(true);
    setPassMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg('✅ Đổi mật khẩu thành công!');
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        setTimeout(() => setShowEditProfileModal(false), 1500);
      } else {
        setPassMsg(`❌ ${data.message}`);
      }
    } catch {
      setPassMsg('❌ Lỗi kết nối đến máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Refund / Cancel Booking
  const handleRefundBooking = async () => {
    if (!selectedRefundBooking) return;
    setIsRefunding(true);
    setRefundErrorMsg('');
    setRefundSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/bookings/${selectedRefundBooking.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRefundSuccessMsg(data.message || 'Hủy vé và hoàn tiền thành công!');
        // Refresh data
        await fetchUserData();
        setTimeout(() => {
          setSelectedRefundBooking(null);
          setRefundSuccessMsg('');
        }, 2500);
      } else {
        setRefundErrorMsg(data.message || 'Không thể hủy vé. Vui lòng kiểm tra lại điều kiện hoàn vé.');
      }
    } catch {
      setRefundErrorMsg('Lỗi kết nối máy chủ khi thực hiện hoàn tiền.');
    } finally {
      setIsRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 max-w-6xl">
      {/* Profile Header & Card */}
      <div className="bg-[#1a1d24] border border-gray-800 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <UserAvatar 
              name={user?.name} 
              avatarUrl={user?.avatar} 
              size="xl" 
              className="rounded-2xl shrink-0 ring-4 ring-white/10" 
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-white">{user?.name || 'Khách Hàng'}</h1>
                {user?.role === 'ACCOUNTANT' ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <ShieldCheck size={14} /> TÀI KHOẢN KẾ TOÁN TRƯỞNG
                  </span>
                ) : (
                  <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center gap-1">
                    <Award size={14} /> HẠNG {currentTier}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">{user?.email} {user?.phone ? `• ${user.phone}` : ''}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {user?.role === 'ACCOUNTANT' && (
                  <Link
                    to="/accountant"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/40 hover:to-teal-500/40 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <DollarSign size={14} /> Vào Cổng Kế Toán
                  </Link>
                )}
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 size={14} /> Chỉnh sửa thông tin
                </button>
                <button
                  onClick={() => setShowMemberCardModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <QrCode size={14} /> Mã Thẻ Thành Viên
                </button>
                <button
                  onClick={() => setShowRewardsModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Gift size={14} /> Quyền Lợi & Mốc Thưởng
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto justify-end">
            <div 
              onClick={() => setShowRewardsModal(true)}
              className="bg-gray-900 hover:bg-gray-800/80 cursor-pointer transition-colors border border-gray-800 rounded-2xl px-6 py-4 text-center min-w-[140px] group"
              title="Bấm để xem quyền lợi và hướng dẫn tiêu điểm"
            >
              <p className="text-xs text-gray-500 group-hover:text-amber-400 font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                <span>Điểm Tích Lũy</span>
                <Sparkles size={11} className="text-amber-400" />
              </p>
              <p className="text-3xl font-black text-orange-500">{user?.rewardPoints || 0} <span className="text-xs font-normal text-gray-400">điểm</span></p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-center min-w-[140px]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Vé Đã Đặt</p>
              <p className="text-3xl font-black text-white">{bookings.length}</p>
            </div>
          </div>
        </div>

        {/* LEVEL PROGRESS BAR (Thành viên Aeon Member progress) */}
        <div className="mt-8 pt-6 border-t border-gray-800/60 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300 mb-2">
            <span className="flex items-center gap-1.5 text-orange-400">
              <ShieldCheck size={16} /> Tiến Trình Thăng Hạng: <strong className="text-white uppercase">{currentTier}</strong> → <strong className="text-orange-400 uppercase">{nextTier}</strong>
            </span>
            <span className="flex items-center gap-2">
              <span>{pointsNeeded > 0 ? `Tích thêm ${pointsNeeded} điểm để lên ${nextTier}` : '🎉 Bạn đã đạt hạng thành viên cao nhất!'}</span>
              <button onClick={() => setShowRewardsModal(true)} className="text-[11px] text-amber-400 underline hover:text-amber-300">
                Chi tiết mốc
              </button>
            </span>
          </div>

          <div className="w-full bg-gray-900 h-3.5 rounded-full overflow-hidden border border-gray-800 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(249,115,22,0.6)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-semibold">
            <span>STAR (0đ)</span>
            <span>G-STAR (100đ)</span>
            <span>X-STAR (500đ)</span>
          </div>
        </div>
      </div>

      {/* Booking History Section */}
      <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
        <Ticket className="text-orange-500" /> Lịch Sử Đặt Vé Của Tôi ({bookings.length})
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-[#1a1d24] border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          Bạn chưa có lịch sử đặt vé nào. Hãy chọn một bộ phim hay và trải nghiệm dịch vụ ngay nhé!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map(item => {
            const firstTicket = item.tickets[0];
            const movie = firstTicket?.showtime?.movie;
            const cinema = firstTicket?.showtime?.room?.cinema;
            const room = firstTicket?.showtime?.room;
            const seats = item.tickets.map(t => t.seat.name).join(', ');

            const isRefunded = item.status === 'CANCELLED' || item.paymentStatus === 'REFUNDED';
            const startTime = firstTicket?.showtime?.startTime ? new Date(firstTicket.showtime.startTime).getTime() : 0;
            const canRefund = !isRefunded && (startTime - Date.now() > 60 * 60 * 1000);

            return (
              <div key={item.id} className="bg-[#1a1d24] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-700 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-md">
                        Mã: {item.ticketCode || 'GLX-102948'}
                      </span>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {isRefunded ? (
                      <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1">
                        <RotateCcw size={12} /> Đã Hủy Vé & Hoàn Tiền
                      </span>
                    ) : (
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {item.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : item.status}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <img src={movie?.posterUrl || 'https://via.placeholder.com/150'} alt="Poster" className="w-16 h-24 object-cover rounded-xl shrink-0" />
                    <div>
                      <h3 className="text-lg font-black text-white mb-1 line-clamp-1">{movie?.title || 'Phim Chiếu Rạp'}</h3>
                      <p className="text-gray-400 text-xs mb-2">{cinema?.name || 'AEON MALL'} - {room?.name || 'Phòng 01'}</p>
                      <p className="text-sm font-semibold text-gray-300">Ghế: <strong className="text-orange-400">{seats}</strong></p>
                      {firstTicket?.showtime?.startTime && (
                        <p className="text-xs text-amber-400/90 font-mono mt-1">
                          Suất: {new Date(firstTicket.showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {new Date(firstTicket.showtime.startTime).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Tổng tiền</p>
                    <p className={`text-lg font-black ${isRefunded ? 'line-through text-gray-500' : 'text-white'}`}>
                      {item.total.toLocaleString()} đ
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canRefund && (
                      <button
                        onClick={() => {
                          setSelectedRefundBooking(item);
                          setRefundErrorMsg('');
                          setRefundSuccessMsg('');
                        }}
                        className="bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Hủy vé trước giờ chiếu 60 phút và nhận lại 100% điểm thưởng Stars"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Vé</span>
                      </button>
                    )}

                    {!isRefunded && (
                      <button
                        onClick={() => setSelectedQrBooking(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
                      >
                        Xem Mã QR Vé
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* MEMBER CARD MODAL (Barcode / QR Code thành viên) */}
      {showMemberCardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181a20] border border-gray-800 text-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setShowMemberCardModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl">
              <X size={20} />
            </button>
            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-orange-500/30">
              AEON CINE MEMBER CARD
            </span>
            <h3 className="text-2xl font-black mb-1">{user?.name || 'Khách Hàng'}</h3>
            <p className="text-xs text-gray-400 mb-6">Hạng: <strong className="text-orange-400 uppercase">{currentTier}</strong> • Điểm tích lũy: <strong>{points}đ</strong></p>

            <div className="bg-white p-4 rounded-2xl mb-6 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GLX-MEMBER-${user?.id || 'DEMO'}`}
                alt="Member Barcode QR"
                className="w-44 h-44 mx-auto"
              />
              <div className="mt-4 pt-3 border-t border-gray-200 text-gray-900 font-mono font-bold tracking-[0.2em] text-sm">
                GLX-MEM-{user?.id ? user.id.substring(0, 8).toUpperCase() : '84920192'}
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Đưa mã Barcode/QR này cho nhân viên quầy vé hoặc bắp nước tại rạp để quét tích điểm thành viên khi mua hàng trực tiếp.
            </p>
          </div>
        </div>
      )}

      {/* EDIT PROFILE & CHANGE PASSWORD MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181a20] border border-gray-800 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowEditProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold">
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-black mb-6 uppercase tracking-wider">CẤU HÌNH TÀI KHOẢN</h3>

            {/* Tabs */}
            <div className="flex bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'password' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Đổi mật khẩu
              </button>
            </div>

            {/* Form Edit Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Giới tính</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {updateMsg && <p className="text-xs font-bold mt-2">{updateMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                >
                  {submitting ? 'ĐANG LƯU...' : 'CẬP NHẬT THÔNG TIN'}
                </button>
              </form>
            )}

            {/* Form Change Password */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                {passMsg && <p className="text-xs font-bold mt-2">{passMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                >
                  {submitting ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Ticket E-QR Modal */}
      {selectedQrBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-900 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setSelectedQrBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <h3 className="text-xl font-black mb-2">VÉ ĐIỆN TỬ</h3>
            <p className="text-xs text-gray-500 mb-6">Mã: {selectedQrBooking.ticketCode}</p>

            <img
              src={selectedQrBooking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQrBooking.ticketCode}`}
              alt="QR Code"
              className="w-48 h-48 mx-auto mb-6"
            />

            <p className="text-xs text-gray-500">Đưa mã QR này cho nhân viên soát vé tại cửa rạp để vào phòng chiếu.</p>
          </div>
        </div>
      )}

      {/* REFUND MODAL (Hủy vé & Hoàn tiền theo chuẩn Galaxy Cinema & CGV) */}
      {selectedRefundBooking && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#181a20] border border-gray-800 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setSelectedRefundBooking(null)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <RotateCcw size={16} />
              </span>
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase">YÊU CẦU HOÀN VÉ</h3>
                <p className="text-[11px] text-gray-400">Chính sách hủy vé & hoàn tiền rạp AEON CINE</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Mã vé:</span>
                <span className="font-mono font-bold text-orange-400">{selectedRefundBooking.ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phim:</span>
                <span className="font-bold text-white text-right max-w-[220px] truncate">
                  {selectedRefundBooking.tickets[0]?.showtime?.movie?.title || 'Phim Chiếu Rạp'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ghế đặt:</span>
                <span className="font-bold text-amber-300">
                  {selectedRefundBooking.tickets.map(t => t.seat.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Giá trị hoàn trả (100%):</span>
                <span className="font-mono font-extrabold text-white">
                  {Number(selectedRefundBooking.total).toLocaleString()} đ
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-amber-400">
                <span className="font-bold flex items-center gap-1">
                  <Gift size={13} /> Quy đổi Điểm Thưởng Stars:
                </span>
                <span className="font-mono font-black text-sm">
                  +{Math.round(Number(selectedRefundBooking.total) / 1000)} điểm
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed mb-4 flex items-start gap-2.5">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong>Quy định hủy vé:</strong> Theo quy chuẩn rạp Galaxy Cinema & CGV, vé được hủy trước giờ chiếu tối thiểu <strong>60 phút</strong>. Giá trị đơn được hoàn 100% vào Ví Điểm Thưởng Stars của tài khoản để bạn đặt vé khác mọi lúc.
              </div>
            </div>

            {refundSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{refundSuccessMsg}</span>
              </div>
            )}

            {refundErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-4">
                {refundErrorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRefundBooking(null)}
                disabled={isRefunding}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleRefundBooking}
                disabled={isRefunding}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRefunding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <RotateCcw size={13} />
                    <span>Xác Nhận Hoàn Vé</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REWARDS & MILESTONES MODAL (Giải thích chi tiết điểm thưởng và mốc điểm - Ảnh 4) */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#181a20] border border-gray-800 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button 
              onClick={() => setShowRewardsModal(false)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Gift size={18} />
              </span>
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase">
                  ĐẶC QUYỀN & MỐC ĐIỂM THƯỞNG
                </h3>
                <p className="text-xs text-gray-400">Cách nhận quà và nâng hạng hội viên AEON CINE Stars</p>
              </div>
            </div>

            {/* Khung Điểm Tích Lũy Nền Tối Sâu Nổi Bật Sắc Nét với Toàn Bộ Chữ Siêu Sáng */}
            <div className="points-box-dark p-5 rounded-2xl mb-5 flex items-center justify-between shadow-2xl relative overflow-hidden border-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <span className="points-title text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse"></span>
                  ĐIỂM TÍCH LŨY CỦA BẠN
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="points-value text-4xl font-black font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                    {user?.rewardPoints || 0}
                  </span>
                  <span className="points-unit text-sm font-extrabold uppercase tracking-wide">
                    điểm Stars
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="points-sub text-xs font-mono uppercase font-bold block mb-1.5 tracking-wider">
                  QUY ĐỔI TRỪ TIỀN MẶT
                </span>
                <span className="points-badge inline-block px-4 py-2 rounded-xl font-mono text-base font-black shadow-lg shadow-amber-500/30 border">
                  = {((user?.rewardPoints || 0) * 1000).toLocaleString()} VNĐ
                </span>
              </div>
            </div>

            <div className="space-y-3.5 mb-6 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-zinc-800 text-gray-300 font-mono font-bold flex items-center justify-center shrink-0 border border-white/10">
                  01
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1 flex items-center justify-between">
                    <span>MỐC STAR (0 - 99 ĐIỂM)</span>
                    <span className="text-[10px] font-mono text-gray-400">Khởi đầu</span>
                  </h4>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    • Tích lũy <strong>5%</strong> giá trị mọi giao dịch vé & combo.<br />
                    • Quà sinh nhật: <strong>1 Vé xem phim 2D</strong> miễn phí.<br />
                    • Đồng giá vé 55.000đ vào Thứ 4 Vui Vẻ hàng tuần.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-black font-mono font-black flex items-center justify-center shrink-0">
                  02
                </span>
                <div>
                  <h4 className="font-bold text-amber-300 text-xs mb-1 flex items-center justify-between">
                    <span>MỐC G-STAR (KHI ĐẠT 100 ĐIỂM)</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">MỤC TIÊU TIẾP THEO</span>
                  </h4>
                  <p className="text-gray-200 text-[11px] leading-relaxed">
                    • Tự động thăng hạng lên <strong>G-STAR</strong> khi đạt 100 điểm.<br />
                    • <strong>Nhận ngay gói quà thăng hạng:</strong> <strong>2 Vé 2D + 2 Combo Bắp Nước</strong> gửi vào kho voucher.<br />
                    • Nâng tỷ lệ tích điểm lên <strong>8%</strong> cho các lần xem phim sau.<br />
                    • Ưu tiên đặt vé suất chiếu sớm (Sneak Preview) trước 48h.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center shrink-0 border border-rose-500/30">
                  03
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1 flex items-center justify-between">
                    <span>MỐC X-STAR (KHI ĐẠT 500 ĐIỂM)</span>
                    <span className="text-[10px] font-mono text-rose-400">VIP Thượng Lưu</span>
                  </h4>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    • Tặng <strong>4 Vé xem phim (cả IMAX Laser)</strong> + 4 Combo VIP.<br />
                    • Tỷ lệ tích điểm tối đa <strong>10%</strong>.<br />
                    • Lối đi riêng VIP Concierge không xếp hàng và vé mời tham dự Premiere ra mắt phim thảm đỏ.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex gap-3">
              <Link
                to="/membership"
                onClick={() => setShowRewardsModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
              >
                <span>Xem Bảng Chính Sách Hội Viên Chi Tiết</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

