import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/user/Home';
import MovieDetails from './pages/user/MovieDetails';
import Chatbot from './components/Chatbot';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import SeatSelection from './pages/user/SeatSelection';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import StaffScanner from './pages/admin/StaffScanner';
import UserProfile from './pages/user/UserProfile';
import Showtimes from './pages/user/Showtimes';
import Cinemas from './pages/user/Cinemas';
import Promotions from './pages/user/Promotions';
import Blog from './pages/user/Blog';
import MoviesList from './pages/user/MoviesList';
import PaymentSuccess from './pages/user/PaymentSuccess';
import PaymentCancel from './pages/user/PaymentCancel';
import MembershipGuide from './pages/user/MembershipGuide';
import GroupBooking from './pages/user/GroupBooking';
import CinemaRules from './pages/user/CinemaRules';
import { Film, Search, LogOut, X, Smartphone, ShieldCheck, Ticket, ChevronDown, DollarSign, Menu } from 'lucide-react';
import { API_URL } from './config/api';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import UserAvatar from './components/UserAvatar';


function AdminRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = (user.role || '').toUpperCase();
    if (role !== 'ADMIN') {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AccountantRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = (user.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function StaffRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = (user.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function UserPrivateRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}

// BẢO VỆ ĐẶT VÉ B2C: Tuyệt đối chỉ tài khoản Khách Hàng (USER) mới được tham gia đặt vé!
function UserBookingRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      const role = (user.role || '').toUpperCase();
      if (role && role !== 'USER') {
        const portal = role === 'ADMIN' ? '/admin' : role === 'ACCOUNTANT' ? '/accountant' : '/admin/scanner';
        alert(`Tài khoản ${role} là tài khoản quản trị/nội bộ, không được phép đặt vé xem phim B2C nhằm tuân thủ quy định kiểm soát nội bộ. Đang chuyển hướng về trang làm việc.`);
        return <Navigate to={portal} replace />;
      }
    }
  } catch (e) {}

  return children;
}


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/accountant');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Search Modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);

  const loadUserInfo = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const cached = localStorage.getItem('user');
      if (cached) {
        try { setCurrentUser(JSON.parse(cached)); } catch {}
      }
      fetch(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            const cachedUserStr = localStorage.getItem('user');
            let prevRole = 'USER';
            if (cachedUserStr) {
              try { prevRole = JSON.parse(cachedUserStr).role; } catch {}
            }
            const merged = { ...data, role: data.role || prevRole };
            setCurrentUser(merged);
            localStorage.setItem('user', JSON.stringify(merged));
          }
        })
        .catch(() => {});
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUserInfo();

    const handleUserUpdate = () => {
      loadUserInfo();
    };
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, [location.pathname]);

  useEffect(() => {
    fetch(`${API_URL}/api/movies`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllMovies(data);
      })
      .catch(() => {});

    fetch(`${API_URL}/api/cinemas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCinemas(data);
      })
      .catch(() => {});
  }, []);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = allMovies.filter(m =>
      m.title.toLowerCase().includes(q.toLowerCase()) ||
      (m.genre && m.genre.toLowerCase().includes(q.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/login');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-void)] text-[var(--text-main)] font-sans selection:bg-amber-500/25 selection:text-amber-200 transition-colors duration-200">

      {/* Navbar - Modern Cinema Glassmorphism */}
      {!isPortal && (
        <header className="fixed top-0 w-full z-50 cinema-glass transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-[60px] flex items-center justify-between gap-1 sm:gap-2 xl:gap-3 flex-nowrap whitespace-nowrap overflow-visible">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300 border border-white/20">
                <Film className="text-white w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute -inset-1 rounded-xl bg-amber-400/20 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white leading-none flex items-center gap-1">
                  AEON <span className="text-gradient-amber">CINE</span>
                </span>
                <span className="hidden xl:block text-[8px] lg:text-[9px] font-mono tracking-widest text-gray-400 uppercase mt-0.5">
                  PREMIUM CINEMA
                </span>
              </div>
            </Link>

            {/* Navigation Menu with Taste - Single Line Guaranteed on Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-[13px] font-semibold tracking-wide shrink-0">
              <Link 
                to="/" 
                className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                  location.pathname === '/' 
                    ? 'text-white bg-white/[0.08] shadow-sm shadow-black/40' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Trang Chủ
              </Link>

              {/* Menu Phim Dropdown */}
              <div className="relative group">
                <div 
                  role="button"
                  tabIndex={0}
                  className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-0.5 sm:gap-1 cursor-default select-none ${
                    location.pathname.startsWith('/movies') || location.pathname.startsWith('/phim')
                      ? 'text-white bg-white/[0.08]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>Phim Điện Ảnh</span>
                  <ChevronDown size={12} className="text-gray-400 group-hover:text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                </div>
                <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-[100] animate-[fadeIn_0.15s_ease-out]">
                  <div className="bg-white dark:bg-[#0e121a] rounded-2xl p-2.5 min-w-[210px] flex flex-col gap-1 shadow-2xl shadow-black/30 dark:shadow-black/90 border border-slate-200 dark:border-white/10">
                    <Link 
                      to="/movies?tab=NOW_SHOWING" 
                      className="px-3 py-2 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Phim Đang Chiếu</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </Link>
                    <Link 
                      to="/movies?tab=COMING_SOON" 
                      className="px-3 py-2 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Phim Sắp Chiếu</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10">HOT</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menu Lịch Chiếu */}
              <Link 
                to="/showtimes" 
                className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                  location.pathname === '/showtimes' 
                    ? 'text-white bg-white/[0.08]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Lịch Chiếu
              </Link>

              {/* Menu Cụm Rạp & Dịch Vụ Dropdown */}
              <div className="relative group">
                <div 
                  role="button"
                  tabIndex={0}
                  className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-0.5 sm:gap-1 cursor-default select-none ${
                    location.pathname.startsWith('/cinemas') || location.pathname === '/group-booking' || location.pathname === '/rules'
                      ? 'text-white bg-white/[0.08]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>Cụm Rạp & Dịch Vụ</span>
                  <ChevronDown size={12} className="text-gray-400 group-hover:text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                </div>
                <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-[100] animate-[fadeIn_0.15s_ease-out]">
                  <div className="bg-white dark:bg-[#0e121a] rounded-2xl p-2.5 min-w-[250px] flex flex-col gap-1 shadow-2xl shadow-black/30 dark:shadow-black/90 border border-slate-200 dark:border-white/10">
                    <div className="px-3 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-gray-500 tracking-wider">Hệ thống rạp toàn quốc</div>
                    {cinemas.slice(0, 5).map(c => (
                      <Link 
                        key={c.id} 
                        to={`/cinemas?id=${c.id}`} 
                        className="px-3 py-1.5 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium transition-all truncate"
                      >
                        {c.name}
                      </Link>
                    ))}
                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1"></div>
                    <Link 
                      to="/cinemas?section=prices" 
                      className="px-3 py-1.5 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Bảng Giá Vé Toàn Quốc</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300">GIÁ VÉ</span>
                    </Link>
                    <Link 
                      to="/group-booking" 
                      className="px-3 py-1.5 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Đặt Vé Đoàn & Thuê Rạp</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">B2B</span>
                    </Link>
                    <Link 
                      to="/rules" 
                      className="px-3 py-1.5 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Nội Quy & Quy Định Rạp</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menu Hội Viên & Ưu Đãi Dropdown */}
              <div className="relative group">
                <div 
                  role="button"
                  tabIndex={0}
                  className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-0.5 sm:gap-1 cursor-default select-none ${
                    location.pathname === '/promotions' || location.pathname === '/membership'
                      ? 'text-white bg-white/[0.08]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>Hội Viên & Ưu Đãi</span>
                  <ChevronDown size={12} className="text-gray-400 group-hover:text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                </div>
                <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-[100] animate-[fadeIn_0.15s_ease-out]">
                  <div className="bg-white dark:bg-[#0e121a] rounded-2xl p-2.5 min-w-[210px] flex flex-col gap-1 shadow-2xl shadow-black/30 dark:shadow-black/90 border border-slate-200 dark:border-white/10">
                    <Link 
                      to="/membership" 
                      className="px-3 py-2 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Đặc Quyền Hội Viên</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">VIP</span>
                    </Link>
                    <Link 
                      to="/promotions" 
                      className="px-3 py-2 rounded-xl text-slate-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold transition-all flex items-center justify-between"
                    >
                      <span>Khuyến Mãi & Sự Kiện</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Menu Blog */}
              <Link 
                to="/blog" 
                className={`px-1.5 md:px-2 xl:px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                  location.pathname === '/blog' 
                    ? 'text-white bg-white/[0.08]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Góc Điện Ảnh
              </Link>
            </nav>

            {/* Right Action Bar - Guaranteed Single Straight Line */}
            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2.5 shrink-0">
              
              {/* Quick Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-all duration-200 group shrink-0"
                title="Tìm kiếm phim (Ctrl + K)"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-gray-400 group-hover:text-gray-300">Tìm phim...</span>
                <span className="hidden 2xl:inline-block text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-gray-400">⌘K</span>
              </button>

              {/* Theme Toggle */}
              <div className="shrink-0 scale-90 sm:scale-100">
                <ThemeToggle />
              </div>

              {/* Auth Status / Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
                {isLoggedIn ? (
                  <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2">
                    {((currentUser?.role || '').toUpperCase() === 'ADMIN') && (
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-[11px] font-display font-bold uppercase tracking-wider transition-all shadow-sm shrink-0"
                        title="Vào bảng điều khiển Quản trị viên"
                      >
                        <ShieldCheck size={12} className="text-amber-400" />
                        <span className="hidden md:inline">Quản Trị</span>
                      </Link>
                    )}
                    {((currentUser?.role || '').toUpperCase() === 'ACCOUNTANT') && (
                      <Link 
                        to="/accountant" 
                        className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 text-[11px] font-display font-bold uppercase tracking-wider transition-all shadow-sm shrink-0"
                        title="Vào Cổng Kế Toán & Quản Lý Doanh Thu"
                      >
                        <DollarSign size={12} className="text-emerald-400" />
                        <span className="hidden md:inline">Kế Toán</span>
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all group shrink-0"
                    >
                      <UserAvatar 
                        name={currentUser?.name || 'Khách'} 
                        avatarUrl={currentUser?.avatar}
                        size="sm" 
                      />
                      <span className="hidden md:inline text-xs font-semibold text-gray-200 group-hover:text-amber-300 transition-colors max-w-[70px] lg:max-w-[100px] xl:max-w-[130px] truncate">
                        {currentUser?.name || 'Tài khoản'}
                      </span>
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="text-gray-400 hover:text-red-400 p-1 sm:p-1.5 rounded-xl hover:bg-red-500/10 transition-colors shrink-0" 
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Link 
                      to="/login" 
                      className="text-xs font-semibold text-gray-300 hover:text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-white/[0.05] transition-all shrink-0"
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      to="/register" 
                      className="cinema-btn-primary text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bold transition-all shrink-0"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>

              {/* Tab Menu Hamburger Button bên phải khi thu nhỏ màn hình */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-200 hover:text-amber-400 transition-all flex items-center justify-center shrink-0"
                aria-label="Mở menu điều hướng"
                title="Menu điều hướng"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Right Slide-over Drawer Menu khi thu nhỏ màn hình */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden animate-[fadeIn_0.2s_ease-out]">
              {/* Backdrop mờ */}
              <div 
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              ></div>

              {/* Drawer Container trượt ra từ bên phải */}
              <div className="fixed top-0 right-0 h-full w-[310px] sm:w-[350px] bg-[#0c1017] border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)]">
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-4">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                        <Film className="text-white w-4 h-4" />
                      </div>
                      <span className="font-display font-extrabold text-base tracking-tight text-white leading-none">
                        AEON <span className="text-gradient-amber">CINE</span>
                      </span>
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Đóng menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Danh sách Menu bên phải */}
                  <div className="flex flex-col gap-1 text-sm font-semibold">
                    <Link 
                      to="/" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      Trang Chủ
                    </Link>

                    {/* Menu Phim Mobile */}
                    <div className="flex flex-col rounded-xl bg-white/[0.03] p-2 border border-white/[0.05]">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-500/90 font-mono">
                        Phim Điện Ảnh
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <Link 
                          to="/movies?tab=NOW_SHOWING" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 text-xs flex items-center justify-between"
                        >
                          <span>Phim Đang Chiếu</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </Link>
                        <Link 
                          to="/movies?tab=COMING_SOON" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 text-xs flex items-center justify-between"
                        >
                          <span>Phim Sắp Chiếu</span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">HOT</span>
                        </Link>
                      </div>
                    </div>

                    <Link 
                      to="/showtimes" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      Lịch Chiếu
                    </Link>

                    {/* Menu Cụm Rạp & Dịch Vụ Mobile */}
                    <div className="flex flex-col rounded-xl bg-white/[0.03] p-2 border border-white/[0.05]">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-500/90 font-mono">
                        Cụm Rạp & Dịch Vụ
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link 
                          to="/cinemas" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 text-xs font-semibold flex items-center justify-between"
                        >
                          <span>Hệ Thống Cụm Rạp Toàn Quốc</span>
                          <span className="text-[10px] font-mono text-amber-400">Xem tất cả →</span>
                        </Link>
                        <Link 
                          to="/cinemas?section=prices" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-amber-300 text-xs font-semibold flex items-center justify-between"
                        >
                          <span>Bảng Giá Vé Toàn Quốc</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">GIÁ VÉ</span>
                        </Link>
                        <Link 
                          to="/group-booking" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-emerald-400 text-xs font-semibold flex items-center justify-between"
                        >
                          <span>Đặt Vé Đoàn & Thuê Rạp</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">B2B</span>
                        </Link>
                        <Link 
                          to="/rules" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 text-xs font-semibold"
                        >
                          <span>Nội Quy & Quy Định Rạp</span>
                        </Link>
                      </div>
                    </div>

                    {/* Menu Hội Viên Mobile */}
                    <div className="flex flex-col rounded-xl bg-white/[0.03] p-2 border border-white/[0.05]">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-500/90 font-mono">
                        Hội Viên & Ưu Đãi
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link 
                          to="/membership" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-amber-300 text-xs font-semibold flex items-center justify-between"
                        >
                          <span>Đặc Quyền Hội Viên Stars</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">VIP</span>
                        </Link>
                        <Link 
                          to="/promotions" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 text-xs font-semibold"
                        >
                          <span>Khuyến Mãi & Sự Kiện</span>
                        </Link>
                      </div>
                    </div>

                    <Link 
                      to="/blog" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      Góc Điện Ảnh
                    </Link>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-gray-400 font-medium">Chế độ hiển thị</span>
                    <ThemeToggle showLabel={true} />
                  </div>

                  {isLoggedIn ? (
                    <div className="flex items-center justify-between w-full pt-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-sm font-semibold text-white"
                      >
                        <UserAvatar name={currentUser?.name || 'Khách'} avatarUrl={currentUser?.avatar} size="sm" />
                        <span className="max-w-[130px] truncate">{currentUser?.name || 'Tài khoản'}</span>
                      </Link>
                      <button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }} 
                        className="text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 w-full pt-2">
                      <Link 
                        to="/login" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="cinema-btn-glass text-center py-2.5 text-xs font-bold"
                      >
                        Đăng nhập
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="cinema-btn-primary text-center py-2.5 text-xs font-bold"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isPortal ? 'mt-[60px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MoviesList />} />
          <Route path="/phim-dang-chieu" element={<MoviesList />} />
          <Route path="/phim-sap-chieu" element={<MoviesList />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/cinemas" element={<Cinemas />} />
          <Route path="/membership" element={<MembershipGuide />} />
          <Route path="/group-booking" element={<GroupBooking />} />
          <Route path="/cinemas/sale" element={<GroupBooking />} />
          <Route path="/rules" element={<CinemaRules />} />
          <Route path="/cgv-rules" element={<CinemaRules />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserPrivateRoute><UserProfile /></UserPrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/accountant" element={<AccountantRoute><AccountantDashboard /></AccountantRoute>} />
          <Route path="/admin/scanner" element={<StaffRoute><StaffScanner /></StaffRoute>} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/booking/:movieId" element={<UserBookingRoute><SeatSelection /></UserBookingRoute>} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
        </Routes>
      </main>

      {/* SEARCH SPOTLIGHT MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start justify-center z-50 pt-20 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="cinema-glass rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl shadow-black border border-white/10">
            <button
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-gradient-amber">
                Tìm Kiếm Tác Phẩm Điện Ảnh
              </h3>
            </div>

            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Nhập tên phim, thể loại (ví dụ: Dune, Godzilla, Mai...)..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/50 text-white placeholder-gray-500 font-medium shadow-inner transition-colors"
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
              {searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Không tìm thấy tác phẩm nào với từ khóa "<strong className="text-white">{searchQuery}</strong>".
                </div>
              )}

              {searchResults.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] p-3 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group"
                >
                  <img src={m.posterUrl || 'https://via.placeholder.com/150'} alt={m.title} className="w-14 h-20 object-cover rounded-xl shrink-0 shadow-md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors uppercase">{m.title}</h4>
                    <p className="text-xs text-gray-400 truncate mt-1">{m.genre} • {m.duration} phút</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        ★ {m.rating || '9.0'}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {m.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowSearchModal(false);
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          try {
                            const u = JSON.parse(userStr);
                            const role = (u.role || '').toUpperCase();
                            if (role && role !== 'USER') {
                              const portal = role === 'ADMIN' ? '/admin' : role === 'ACCOUNTANT' ? '/accountant' : '/admin/scanner';
                              alert(`Tài khoản ${role} là tài khoản quản trị/nội bộ, không được phép đặt vé xem phim B2C.`);
                              navigate(portal);
                              return;
                            }
                          } catch (e) {}
                        }
                        const target = `/booking/${m.id}`;
                        navigate(localStorage.getItem('token') ? target : `/login?redirect=${encodeURIComponent(target)}`);
                      }}
                      className="cinema-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 font-bold"
                    >
                      <Ticket size={13} /> Mua Vé
                    </button>
                    <Link
                      to={`/movie/${m.id}`}
                      onClick={() => setShowSearchModal(false)}
                      className="text-center text-[11px] text-gray-400 hover:text-white font-medium"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Luxury Cinema Aesthetic */}
      {!isPortal && (
        <footer className="bg-[var(--bg-void)] border-t border-white/[0.07] pt-20 pb-12 mt-24 relative overflow-hidden transition-colors duration-200">
          {/* Subtle Ambient Studio Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-amber-500/[0.04] blur-[140px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
              
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <Link to="/" className="flex items-center gap-3 mb-5 group">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/20">
                    <Film className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                      AEON <span className="text-gradient-amber">CINE</span>
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block -mt-0.5">
                      VIETNAM CINEMA SYSTEM
                    </span>
                  </div>
                </Link>
                <p className="text-gray-400 text-xs leading-relaxed mb-4 max-w-sm">
                  CÔNG TY TNHH AEON CINE VIỆT NAM (AEON GROUP). Hệ thống phòng chiếu tiêu chuẩn quốc tế với công nghệ IMAX Laser, Dolby Atmos và không gian điện ảnh thượng lưu.
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  Tổng đài khách hàng: <strong className="text-amber-400 font-mono font-bold">1900 2224</strong> (8:00 - 22:00) | Email: <span className="text-gray-300">support@aeoncine.vn</span>
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-xl text-[11px] text-gray-300 font-medium">
                    <ShieldCheck size={15} className="text-amber-400" /> Đã đăng ký Bộ Công Thương
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-xl text-[11px] text-gray-300 font-medium">
                    <Smartphone size={15} className="text-amber-400" /> Tải Ứng Dụng Aeon Cine
                  </div>
                </div>
              </div>

              {/* Links Column 1 */}
              <div>
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
                  Khám Phá
                </h4>
                <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                  <li><Link to="/movies?tab=NOW_SHOWING" className="hover:text-amber-300 transition-colors">Phim Đang Chiếu</Link></li>
                  <li><Link to="/movies?tab=COMING_SOON" className="hover:text-amber-300 transition-colors">Phim Sắp Chiếu</Link></li>
                  <li><Link to="/showtimes" className="hover:text-amber-300 transition-colors">Suất Chiếu IMAX Laser</Link></li>
                  <li><Link to="/blog" className="hover:text-amber-300 transition-colors">Bình Luận Điện Ảnh</Link></li>
                  <li><Link to="/membership" className="hover:text-amber-300 transition-colors">Đặc Quyền Hội Viên Stars</Link></li>
                </ul>
              </div>

              {/* Links Column 2 */}
              <div>
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
                  Cụm Rạp & Dịch Vụ
                </h4>
                <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                  <li><Link to="/cinemas" className="hover:text-amber-300 transition-colors">Aeon Cine Tân Phú Celadon</Link></li>
                  <li><Link to="/cinemas" className="hover:text-amber-300 transition-colors">Aeon Cine Bình Tân</Link></li>
                  <li><Link to="/cinemas" className="hover:text-amber-300 transition-colors">Aeon Cine Hà Đông</Link></li>
                  <li><Link to="/cinemas?section=prices" className="hover:text-amber-300 transition-colors">Bảng Giá Vé Chuẩn Toàn Quốc</Link></li>
                  <li><Link to="/group-booking" className="hover:text-amber-300 transition-colors">Đặt Vé Nhóm & Sự Kiện</Link></li>
                </ul>
              </div>

              {/* Links Column 3 */}
              <div>
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-3">
                  Chính Sách & Nội Quy
                </h4>
                <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                  <li><Link to="/rules" className="hover:text-amber-300 transition-colors">Nội Quy & Quy Định Tại Rạp</Link></li>
                  <li><Link to="/rules" className="hover:text-amber-300 transition-colors">Chính Sách Hoàn / Hủy Vé (60p)</Link></li>
                  <li><Link to="/rules" className="hover:text-amber-300 transition-colors">Quy Chuẩn Phân Loại Độ Tuổi</Link></li>
                  <li><Link to="/membership" className="hover:text-amber-300 transition-colors">Hướng Dẫn Thẻ & Tích Điểm</Link></li>
                  <li><Link to="/group-booking" className="hover:text-amber-300 transition-colors">Thuê Trọn Rạp & Vé Doanh Nghiệp</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-xs">
                © 2026 AEON CINE VIỆT NAM. Hệ Thống Đặt Vé Phim Trực Tuyến Thế Hệ Mới.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                <span className="text-gray-300">Tiếng Việt (VN)</span>
                <span>•</span>
                <span className="hover:text-gray-300 cursor-pointer">English (US)</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Chatbot */}
      {!isPortal && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

