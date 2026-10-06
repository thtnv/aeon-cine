import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Mail, KeyRound, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, Film, ShieldCheck, RotateCcw } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Modal Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Countdown timer cho nút gửi lại OTP
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = '';
      setOtpDigits(nextDigits);
      setOtp(nextDigits.join(''));
      return;
    }

    const digit = clean.slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setOtp(nextDigits.join(''));

    // Tự động chuyển con trỏ sang ô tiếp theo
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
        setOtp(nextDigits.join(''));
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...otpDigits];
        nextDigits[index] = '';
        setOtpDigits(nextDigits);
        setOtp(nextDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    setOtp(nextDigits.join(''));

    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('user-updated'));
        }
        
        const role = (data.user?.role || '').toUpperCase();
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
      } else {
        setError(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotError('');
    setForgotEmail(email || '');
    setOtp('');
    setOtpDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(2);
        setOtp('');
        setOtpDigits(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmNewPassword('');
        setResendCountdown(60); // Đếm ngược 60 giây trước khi được bấm gửi lại
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setForgotError(data.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.');
      }
    } catch (err) {
      setForgotError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (otp.length < 6) {
      setForgotError('Vui lòng nhập đủ 6 chữ số mã xác nhận OTP.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Mật khẩu xác nhận không khớp với mật khẩu mới. Vui lòng kiểm tra lại.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail.trim(), 
          otp: otp.trim(), 
          newPassword 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(3); // Chuyển sang màn hình thành công
      } else {
        setForgotError(data.message || 'Mã xác nhận (OTP) không chính xác hoặc đã hết hạn.');
      }
    } catch (err) {
      setForgotError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFinishReset = () => {
    setShowForgotModal(false);
    setEmail(forgotEmail);
    setPassword('');
    setForgotStep(1);
    setOtp('');
    setOtpDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center py-16 px-4 relative overflow-hidden">
      {/* Ambient Lighting Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.06] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-[#0d1117] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl relative z-10 transition-colors duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-white/20 mb-4">
            <Film className="text-white w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Đăng Nhập <span className="text-gradient-amber">Hội Viên</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 max-w-xs">
            Trải nghiệm không gian điện ảnh thượng lưu & nhận ngập tràn ưu đãi tại AEON CINE
          </p>
        </div>
        
        {redirectUrl && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 p-3.5 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping"></span>
            <span>Vui lòng đăng nhập tài khoản để tiếp tục đặt vé và giữ ghế xem phim.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2 animate-[shake_0.3s_ease-in-out]">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4.5">
          {/* Email field */}
          <div>
            <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
              Email hoặc Số điện thoại
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

          {/* Password field */}
          <div>
            <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-11 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                placeholder="••••••••"
                autoComplete="current-password"
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
          
          {/* Options: Remember & Forgot */}
          <div className="flex justify-between items-center text-xs mt-1">
            <label className="flex items-center gap-2 text-slate-600 dark:text-gray-400 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-gray-700 bg-slate-100 dark:bg-gray-800"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button 
              type="button" 
              onClick={openForgotModal} 
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold transition-colors cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full cinema-btn-primary font-bold py-3.5 rounded-2xl mt-3 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>ĐANG XÁC THỰC...</span>
              </span>
            ) : (
              <span>ĐĂNG NHẬP NGAY</span>
            )}
          </button>
        </form>
        
        {/* Switch to Register */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] text-center text-slate-600 dark:text-gray-400 text-xs">
          Bạn chưa là thành viên AEON CINE?{' '}
          <Link
            to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
            className="text-amber-600 dark:text-amber-400 hover:underline font-extrabold ml-1"
          >
            Đăng ký tài khoản ngay
          </Link>
        </div>
      </div>

      {/* ================= MODAL QUÊN MẬT KHẨU (GỬI OTP QUA EMAIL THẬT) ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative transition-all">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 p-5 flex justify-between items-center text-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center font-bold">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base uppercase tracking-wider leading-none">
                    Quên Mật Khẩu
                  </h3>
                  <span className="text-[10px] font-semibold opacity-85 block mt-0.5">
                    Xác minh bảo mật qua Email chính chủ
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)} 
                className="w-8 h-8 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 sm:p-7">
              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span>{forgotError}</span>
                </div>
              )}
              
              {/* BƯỚC 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP THẬT */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 Vui lòng nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mã xác nhận <strong>OTP (6 chữ số)</strong> qua hòm thư Gmail để bạn đặt lại mật khẩu mới an toàn.
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Địa chỉ Email tài khoản
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5" />
                      <input 
                        type="email" 
                        required 
                        value={forgotEmail} 
                        onChange={e => setForgotEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                        placeholder="nhapemail@gmail.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button 
                    disabled={forgotLoading || !forgotEmail.trim()} 
                    type="submit" 
                    className="cinema-btn-primary font-bold py-3.5 rounded-2xl flex justify-center items-center gap-2 transition-all mt-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>ĐANG GỬI MÃ OTP...</span>
                      </span>
                    ) : (
                      <>
                        <span>GỬI MÃ OTP XÁC NHẬN</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* BƯỚC 2: NHẬP OTP 6 Ô RỜI, MẬT KHẨU MỚI & NHẬP LẠI MẬT KHẨU MỚI */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} autoComplete="off" className="flex flex-col gap-4">
                  {/* Banner thông báo đã gửi email thực tế */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed">
                    Mã xác nhận bảo mật (OTP 6 số) đã được gửi trực tiếp đến hộp thư: <strong className="font-bold text-slate-900 dark:text-white underline">{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam/Quảng cáo).
                  </div>

                  {/* 6 Ô OTP RIÊNG BIỆT (KHÔNG BỊ BROWSER AUTOFILL SỐ 6) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound size={14} className="text-amber-500" />
                        <span>Mã xác nhận OTP (6 số)</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setForgotStep(1);
                          setOtp('');
                          setOtpDigits(['', '', '', '', '', '']);
                        }}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                      >
                        Đổi email khác
                      </button>
                    </div>

                    {/* 6 ô rời */}
                    <div className="flex items-center justify-between gap-2 sm:gap-2.5 my-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          autoComplete="off"
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border transition-all select-none shadow-sm cursor-text ${
                            digit 
                              ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-amber-300 shadow-amber-500/20' 
                              : 'bg-slate-50 dark:bg-[#131926] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500 focus:bg-amber-500/5'
                          } focus:outline-none`}
                        />
                      ))}
                    </div>

                    {/* Resend OTP Row */}
                    <div className="flex items-center justify-end mt-1.5 text-[11px]">
                      {resendCountdown > 0 ? (
                        <span className="text-slate-400 dark:text-gray-500 font-mono">
                          Gửi lại mã sau: <strong className="text-amber-500">{resendCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOTP()}
                          disabled={forgotLoading}
                          className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw size={12} /> Gửi lại mã OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Mật khẩu mới */}
                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Mật khẩu mới (Tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        name="new-password"
                        autoComplete="new-password"
                        required 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        minLength={6}
                        className="w-full bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-11 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(prev => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title={showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Input Nhập lại mật khẩu mới (Confirm Password) */}
                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Nhập lại mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 w-4.5 h-4.5 pointer-events-none" />
                      <input 
                        type={showConfirmNewPassword ? 'text' : 'password'} 
                        name="confirm-new-password"
                        autoComplete="new-password"
                        required 
                        value={confirmNewPassword} 
                        onChange={e => setConfirmNewPassword(e.target.value)} 
                        minLength={6}
                        className={`w-full bg-slate-50 dark:bg-[#131926] border text-slate-900 dark:text-white rounded-2xl pl-10.5 pr-11 py-3 text-sm focus:outline-none transition-all font-medium placeholder-slate-400 dark:placeholder-gray-500 shadow-inner ${
                          confirmNewPassword && newPassword !== confirmNewPassword
                            ? 'border-red-500 focus:border-red-500'
                            : confirmNewPassword && newPassword === confirmNewPassword
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-amber-500'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(prev => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title={showConfirmNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                      >
                        {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmNewPassword && newPassword !== confirmNewPassword && (
                      <p className="text-[11px] text-red-500 mt-1 font-semibold">
                        ⚠️ Mật khẩu xác nhận không khớp
                      </p>
                    )}
                    {confirmNewPassword && newPassword === confirmNewPassword && (
                      <p className="text-[11px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
                        ✓ Mật khẩu khớp hoàn toàn
                      </p>
                    )}
                  </div>

                  <button 
                    disabled={forgotLoading || otp.length < 6 || !newPassword || newPassword !== confirmNewPassword} 
                    type="submit" 
                    className="cinema-btn-primary font-bold py-3.5 rounded-2xl flex justify-center items-center gap-2 transition-all mt-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>ĐANG ĐẶT LẠI MẬT KHẨU...</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>XÁC NHẬN ĐỔI MẬT KHẨU</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* BƯỚC 3: THÔNG BÁO THÀNH CÔNG */}
              {forgotStep === 3 && (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2">
                    Đổi Mật Khẩu Thành Công!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
                    Mật khẩu tài khoản hội viên của bạn đã được cập nhật an toàn. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
                  </p>
                  <button
                    onClick={handleFinishReset}
                    className="w-full cinema-btn-primary font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    ĐĂNG NHẬP VỚI MẬT KHẨU MỚI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
