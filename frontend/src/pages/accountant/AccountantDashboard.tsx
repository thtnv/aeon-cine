import { useState, useEffect } from 'react';
import { 
  BarChart3, Receipt, DollarSign, Coffee, LogOut, 
  ChevronLeft, ChevronRight, UserCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CinemaDashboardCharts from '../../components/admin/CinemaDashboardCharts';
import OrderManager from '../../components/accountant/OrderManager';
import PriceMatrixManager from '../../components/accountant/PriceMatrixManager';
import FoodManager from '../../components/admin/FoodManager';
import ThemeToggle from '../../components/ThemeToggle';
import UserAvatar from '../../components/UserAvatar';
import { API_URL } from '../../config/api';

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'pricing' | 'food'>('analytics');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('accountant_sidebar_collapsed') === 'true';
  });

  const [analyticsStats, setAnalyticsStats] = useState<{
    totalRevenue: number;
    totalTickets: number;
    totalBookings: number;
    totalUsers: number;
    last7Days: { date: string; revenue: number; tickets: number }[];
    topMovies: { id: string; title: string; posterUrl: string; genre: string; ticketsSold: number; estimatedRevenue: number }[];
    details?: {
      users: { total: number; customers: number; admins: number };
      orders: {
        total: number;
        paid: number;
        unpaid: number;
        vnpay: { count: number; amount: number };
        stripe: { count: number; amount: number };
        momo: { count: number; amount: number };
      };
      tickets: { total: number; standard: number; vip: number; today: number };
      movies: { total: number; nowShowing: number; comingSoon: number; totalShowtimes: number; totalCinemas: number };
      revenue: { total: number; today: number; avgOrder: number; foodQuantity: number; foodRevenue: number };
    };
  }>({
    totalRevenue: 0,
    totalTickets: 0,
    totalBookings: 0,
    totalUsers: 0,
    last7Days: [],
    topMovies: []
  });

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('accountant_sidebar_collapsed', String(next));
      return next;
    });
  };

  const fetchAnalytics = () => {
    fetch(`${API_URL}/api/bookings/stats/analytics`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalRevenue === 'number') {
          setAnalyticsStats(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = (user.role || '').toUpperCase();
      if (role !== 'ACCOUNTANT' && role !== 'ADMIN') {
        navigate('/login', { replace: true });
        return;
      }
      setCurrentUser(user);
    } catch (e) {
      navigate('/login', { replace: true });
    }

    fetchAnalytics();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    navigate('/login');
  };

  const navItems = [
    { id: 'analytics', label: 'Tổng Quan Doanh Thu & KPIs', icon: BarChart3, badge: 'KPI' },
    { id: 'orders', label: 'Quản Lý Đơn Vé & Giao Dịch', icon: Receipt, badge: 'Sổ Cái' },
    { id: 'pricing', label: 'Bảng Giá Vé & Phụ Thu', icon: DollarSign, badge: 'Biểu Phí' },
    { id: 'food', label: 'Bắp Nước & Combo F&B', icon: Coffee, badge: 'Thực Đơn' },
  ];

  return (
    <div className="portal-zoom-80 flex h-[125vh] w-[125vw] bg-slate-100 dark:bg-[#0a0d14] text-slate-900 dark:text-white font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Sidebar - Accountant Portal */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-68'} bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-gray-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none`}>
        {/* Sidebar Header */}
        <div className={`px-5 py-4 border-b border-slate-200 dark:border-gray-800/80 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 font-bold">
                ₫
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wider whitespace-nowrap text-slate-900 dark:text-white">
                  AEON <span className="text-emerald-500">FINANCE</span>
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 block -mt-0.5 uppercase">
                  Bộ Phận Kế Toán
                </span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn"}
            className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 transition-all flex items-center justify-center shrink-0"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-3 py-4 sidebar-scroll">
          <div className={`text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-gray-500 tracking-wider mb-1 px-3 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            {isSidebarCollapsed ? 'MENU' : 'NGHIỆP VỤ TÀI CHÍNH'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-gray-400 group-hover:text-emerald-500'} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!isSidebarCollapsed && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-gray-800/80 shrink-0 space-y-2">
          {!isSidebarCollapsed && currentUser && (
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-gray-800/40">
              <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <UserCheck size={11} /> Kế Toán Trưởng
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <ThemeToggle showLabel={false} />

            <button
              onClick={handleLogout}
              title="Đăng xuất phiên làm việc công vụ"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              {!isSidebarCollapsed && <span>Đăng Xuất</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">CỔNG NGHIỆP VỤ</span>
            <span className="text-slate-300 dark:text-gray-600">/</span>
            <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>HỆ THỐNG TÀI CHÍNH ONLINE</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 sidebar-scroll">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'analytics' && <CinemaDashboardCharts analyticsData={analyticsStats} />}
            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'pricing' && <PriceMatrixManager />}
            {activeTab === 'food' && <FoodManager />}
          </div>
        </main>
      </div>
    </div>
  );
}
