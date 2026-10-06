import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Nếu đã đăng nhập, tự động chuyển hướng đúng cổng (ADMIN, ACCOUNTANT, STAFF, USER)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = (user.role || '').toUpperCase();
        if (role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (role === 'ACCOUNTANT') {
          navigate('/accountant', { replace: true });
        } else if (role === 'STAFF') {
          navigate('/admin/scanner', { replace: true });
        } else if (redirectUrl) {
          navigate(redirectUrl, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (e) {}
    }
  }, [navigate, redirectUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật của AEON CINE.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password, 
          phone: phone.trim() 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra đường truyền.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex justify-center items-center py-16 px-4 relative overflow-hidden">
      {/* Ambient Lighting Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/[0.06] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-white dark:bg-[#0d1117] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl relative z-10 transition-colors duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-white/20 mb-4">
            <Film className="text-white w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Đăng Ký <span className="text-gradient-amber">Thành Viên</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 max-w-sm">
            Gia nhập cộng đồng người yêu điện ảnh AEON CINE để nhận điểm thưởng và ưu đãi vé độc quyền
          </p>
        </div>
        
        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={44} />
            </div>
            <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white mb-2">
              Đăng Ký Thành Công!
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-2 leading-relaxed">
              Chào mừng <strong className="text-amber-500 font-bold">{name}</strong> đến với AEON CINE.
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-8 max-w-sm">
              Tài khoản hội viên của bạn với email <strong>{email}</strong> đã được khởi tạo thành công. Bạn có thể đăng nhập ngay để tích điểm và đặt vé xem phim.
            </p>
            <button
              onClick={() => navigate(redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login')}
              className="w-full cinema-btn-primary font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* FORM ĐĂNG KÝ */
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2 animate-[shake_0.3s_ease-in-out]">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleRegister} className="flex flex-col gap-4.5">
              {/* Họ và Tên */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Grid 2 cột: Email & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                      placeholder="name@gmail.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                      placeholder="0912 345 678"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Mật khẩu (Tối thiểu 6 ký tự) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-11 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu (Confirm Password) */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className={`w-full bg-slate-50 dark:bg-[#131926] border text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-11 py-3 text-sm focus:outline-none transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-slate-200 dark:border-white/10 focus:border-amber-500'
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">
                    ⚠️ Mật khẩu xác nhận không khớp
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
                    ✓ Mật khẩu khớp hoàn toàn
                  </p>
                )}
              </div>

              {/* Checkbox điều khoản */}
              <div className="mt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-gray-400 cursor-pointer select-none leading-relaxed">
                  <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 mt-0.5 shrink-0"
                  />
                  <span>
                    Tôi đồng ý với <a href="#" className="text-amber-600 dark:text-amber-400 underline font-semibold">Điều khoản sử dụng</a> và <a href="#" className="text-amber-600 dark:text-amber-400 underline font-semibold">Chính sách bảo mật</a> hội viên của AEON CINE.
                  </span>
                </label>
              </div>
              
              {/* Nút Đăng Ký */}
              <button 
                type="submit" 
                disabled={loading || !agreeTerms || (confirmPassword !== '' && password !== confirmPassword)}
                className="w-full cinema-btn-primary font-bold py-3.5 rounded-2xl mt-3 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>ĐANG KHỞI TẠO TÀI KHOẢN...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ĐĂNG KÝ HỘI VIÊN NGAY</span>
                  </>
                )}
              </button>
            </form>
            
            {/* Chuyển sang Đăng Nhập */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] text-center text-slate-600 dark:text-gray-400 text-xs">
              Bạn đã có tài khoản AEON CINE?{' '}
              <Link
                to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="text-amber-600 dark:text-amber-400 hover:underline font-extrabold ml-1"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
