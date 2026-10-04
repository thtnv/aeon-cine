import { useState, useEffect } from 'react';
import { Settings, Film, Users, Calendar, LogOut, X, Plus, Edit2, Trash2, CheckCircle, Tags, UserSquare2, MapPin, Gift, Newspaper, ChevronLeft, ChevronRight, PlayCircle, FileText, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import GenreManager from '../../components/admin/GenreManager';
import ActorManager from '../../components/admin/ActorManager';
import UserManager from '../../components/admin/UserManager';
import ShowtimeManager from '../../components/admin/ShowtimeManager';
import CinemaManager from '../../components/admin/CinemaManager';
import PromotionManager from '../../components/admin/PromotionManager';
import VoucherManager from '../../components/admin/VoucherManager';
import BlogManager from '../../components/admin/BlogManager';
import SystemSettingsManager from '../../components/admin/SystemSettingsManager';
import ThemeToggle from '../../components/ThemeToggle';
import { formatYouTubeEmbedUrl } from '../../utils/youtube';
import ManageableDropdown from '../../components/admin/ManageableDropdown';

export default function AdminDashboard() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [previewTrailerUrl, setPreviewTrailerUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'showtimes' | 'cinemas' | 'users' | 'settings' | 'genres' | 'actors' | 'promotions' | 'blogs' | 'vouchers'>('movies');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navigate = useNavigate();

  const emptyForm = {
    title: '', description: '', genre: '', duration: '120', posterUrl: '', trailerUrl: '',
    status: 'NOW_SHOWING', releaseDate: '', ageRating: 'T16', rating: '9.0',
    votes: '100', country: 'Việt Nam', producer: '', director: '', actors: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [dbGenres, setDbGenres] = useState<any[]>([]);
  const [dbActors, setDbActors] = useState<any[]>([]);

  const fetchMovies = () => {
    fetch(`${API_URL}/api/movies`)
      .then(res => res.json())
      .then(data => setMovies(data));
  };

  const fetchDependencies = () => {
    fetch(`${API_URL}/api/genres`)
      .then(res => res.json())
      .then(data => setDbGenres(data));
      
    fetch(`${API_URL}/api/actors`)
      .then(res => res.json())
      .then(data => setDbActors(data));
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
      if (user.role !== 'ADMIN') {
        if (user.role === 'ACCOUNTANT') {
          navigate('/accountant', { replace: true });
          return;
        }
        navigate('/login', { replace: true });
        return;
      }
    } catch (e) {
      navigate('/login', { replace: true });
      return;
    }

    fetchMovies();
    fetchDependencies();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    navigate('/login');
  };

  const handleEditClick = (movie: any) => {
    fetchDependencies();
    setEditingMovieId(movie.id);
    setFormData({
      title: movie.title || '', description: movie.description || '', genre: movie.genre || '', 
      duration: movie.duration?.toString() || '120', posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      status: movie.status || 'NOW_SHOWING', releaseDate: movie.releaseDate || '',
      ageRating: movie.ageRating || 'T16', rating: movie.rating?.toString() || '9.0',
      votes: movie.votes?.toString() || '100', country: movie.country || '',
      producer: movie.producer || '', director: movie.director || '', actors: movie.actors || ''
    });
    setShowModal(true);
  };

  const handleAddNewClick = () => {
    fetchDependencies();
    setEditingMovieId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleDeleteMovie = async (id: string, title?: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phim "${title || 'này'}" khỏi hệ thống?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/movies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`Đã xóa phim "${title || ''}" thành công!`);
        fetchMovies();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Không thể xóa phim. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ khi xóa phim.');
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration) || 120,
        rating: Number(formData.rating) || 9.0,
        votes: Number(formData.votes) || 100
      };
      
      const url = editingMovieId 
        ? `${API_URL}/api/movies/${editingMovieId}`
        : `${API_URL}/api/movies`;
        
      const method = editingMovieId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        fetchMovies();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Không thể lưu phim. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ khi lưu phim.');
    }
  };

  const toggleGenre = (genre: string) => {
    let currentGenres = formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(Boolean) : [];
    if (currentGenres.includes(genre)) {
      currentGenres = currentGenres.filter(g => g !== genre);
    } else {
      currentGenres.push(genre);
    }
    setFormData({ ...formData, genre: currentGenres.join(', ') });
  };

  const toggleActor = (actor: string) => {
    let currentActors = formData.actors ? formData.actors.split(',').map(a => a.trim()).filter(Boolean) : [];
    if (currentActors.includes(actor)) {
      currentActors = currentActors.filter(a => a !== actor);
    } else {
      currentActors.push(actor);
    }
    setFormData({ ...formData, actors: currentActors.join(', ') });
  };

  const isGenreSelected = (genre: string) => {
    const currentGenres = formData.genre ? formData.genre.split(',').map(g => g.trim()) : [];
    return currentGenres.includes(genre);
  };

  const isActorSelected = (actor: string) => {
    const currentActors = formData.actors ? formData.actors.split(',').map(a => a.trim()) : [];
    return currentActors.includes(actor);
  };

  // Navigation Items (Phân quyền chuẩn: Admin quản trị Vận hành, Phim ảnh & Nội dung)
  const navItems = [
    { id: 'movies', label: 'Quản Lý Phim', icon: Film, group: 1 },
    { id: 'showtimes', label: 'Lịch Chiếu & Suất Chiếu', icon: Calendar, group: 1 },
    { id: 'cinemas', label: 'Cụm Rạp & Phòng Chiếu', icon: MapPin, group: 1 },
    { id: 'promotions', label: 'Khuyến Mãi & Sự Kiện', icon: Gift, group: 2 },
    { id: 'vouchers', label: 'Kho Mã Giảm Giá (Voucher)', icon: Ticket, group: 2 },
    { id: 'blogs', label: 'Góc Điện Ảnh (Blog)', icon: Newspaper, group: 2 },
    { id: 'genres', label: 'Thể Loại Phim', icon: Tags, group: 2 },
    { id: 'actors', label: 'Diễn Viên & Đạo Diễn', icon: UserSquare2, group: 2 },
    { id: 'users', label: 'Người Dùng & Phân Quyền', icon: Users, group: 3 },
    { id: 'settings', label: 'Cài Đặt Hệ Thống', icon: Settings, group: 3 },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#0a0d14] text-slate-900 dark:text-white font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-gray-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none`}>
        {/* Sidebar Header */}
        <div className={`px-5 py-4 border-b border-slate-200 dark:border-gray-800/80 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-black tracking-wider whitespace-nowrap text-slate-900 dark:text-white">
              AEON <span className="text-orange-500">ADMIN</span>
            </h2>
          )}

          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng (Chỉ hiện icon)"}
            className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-gray-800/80 border border-slate-200 dark:border-gray-800 transition-all flex items-center justify-center shrink-0"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-3 py-3 sidebar-scroll">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showDivider = idx > 0 && navItems[idx - 1].group !== item.group;

            return (
              <div key={item.id} className="w-full">
                {showDivider && (
                  <div className="h-px w-full bg-slate-200 dark:bg-gray-800/80 my-2"></div>
                )}
                <button
                  onClick={() => setActiveTab(item.id as any)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-gray-800/80'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">
                      {item.label}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
        
        {/* Footer: Theme Toggle & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-gray-800/80 mt-auto shrink-0 bg-white dark:bg-[#111827] flex flex-col gap-2">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2 py-1'}`}>
            {!isSidebarCollapsed && <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold tracking-wide">Giao diện</span>}
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className={`flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 p-3 rounded-xl transition-colors w-full font-bold ${
              isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 sidebar-scroll bg-slate-100/80 dark:bg-[#0a0d14]">
        
        {/* TAB: QUẢN LÝ PHIM */}
        {activeTab === 'movies' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-8 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Danh Sách Phim</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Quản lý kho phim chiếu rạp trong hệ thống AEON CINE</p>
              </div>
              <button 
                onClick={handleAddNewClick}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40"
              >
                <Plus size={20} /> THÊM PHIM MỚI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map(movie => (
                <div key={movie.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group">
                  <div className="relative h-64 overflow-hidden">
                    <img src={movie.posterUrl || 'https://via.placeholder.com/400x600?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-400 border border-orange-500/30">
                      ★ {movie.rating || '9.0'}
                    </div>
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded shadow">
                      {movie.ageRating || 'T16'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">{movie.title}</h3>
                      <p className="text-slate-500 dark:text-gray-400 text-xs mb-2 line-clamp-2">{movie.genre} • {movie.duration} phút</p>
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${movie.status === 'NOW_SHOWING' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                          {movie.status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                        </span>
                        {movie.trailerUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewTrailerUrl(formatYouTubeEmbedUrl(movie.trailerUrl))}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2 py-0.5 rounded transition-colors"
                          >
                            <PlayCircle size={12} /> Trailer
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 italic">Chưa có Trailer</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-gray-800">
                      <button onClick={() => handleEditClick(movie)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors border border-slate-300 dark:border-gray-700">
                        <Edit2 size={14} /> Sửa
                      </button>
                      <button 
                        title={`Xóa phim ${movie.title}`}
                        onClick={() => handleDeleteMovie(movie.id, movie.title)} 
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 dark:text-red-400 hover:text-white font-bold p-2 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* CỤM RẠP */}
        {activeTab === 'cinemas' && <CinemaManager />}

        {/* CHƯƠNG TRÌNH KHUYẾN MÃI */}
        {activeTab === 'promotions' && <PromotionManager />}

        {/* KHO MÃ GIẢM GIÁ (VOUCHER) */}
        {activeTab === 'vouchers' && <VoucherManager />}

        {/* GÓC ĐIỆN ẢNH (BLOG) */}
        {activeTab === 'blogs' && <BlogManager />}

        {/* THỂ LOẠI */}
        {activeTab === 'genres' && <GenreManager />}

        {/* DIỄN VIÊN */}
        {activeTab === 'actors' && <ActorManager />}

        {/* LỊCH CHIẾU */}
        {activeTab === 'showtimes' && <ShowtimeManager />}

        {/* NGƯỜI DÙNG */}
        {activeTab === 'users' && <UserManager />}

        {/* CÀI ĐẶT HỆ THỐNG */}
        {activeTab === 'settings' && <SystemSettingsManager />}

      </div>

      {/* MODAL THÊM / SỬA PHIM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-700 rounded-3xl w-full max-w-6xl xl:max-w-7xl shadow-2xl flex flex-col relative max-h-[92vh] overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a2333] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/30">
                  <Film size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {editingMovieId ? 'Cập Nhật Thông Tin Phim' : 'Thêm Phim Điện Ảnh Mới'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {editingMovieId ? 'Chỉnh sửa toàn bộ thông số kỹ thuật, ekip và cốt truyện phim' : 'Khởi tạo tác phẩm mới vào kho phim hệ thống Aeon Cine'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto sidebar-scroll grow">
              <form id="add-movie-form" onSubmit={handleSaveMovie} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột 1: Thông tin cơ bản & Media */}
                <div className="space-y-4 bg-slate-50/60 dark:bg-gray-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800/80">
                  <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2 mb-1 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-[10px]">1</span> Thông tin chính & Media
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Tên Phim (Title) <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-bold text-sm shadow-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Link Poster (Ảnh dọc 2:3)</label>
                    <input type="text" placeholder="https://..." value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none text-xs shadow-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><PlayCircle size={13} className="text-red-500" /> Link Trailer (YouTube URL)</span>
                      {formData.trailerUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewTrailerUrl(formatYouTubeEmbedUrl(formData.trailerUrl))}
                          className="text-[10px] text-orange-500 dark:text-orange-400 hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <PlayCircle size={11} /> Xem thử
                        </button>
                      )}
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={formData.trailerUrl} 
                      onChange={e => setFormData({...formData, trailerUrl: e.target.value})} 
                      className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none text-xs font-mono shadow-xs" 
                    />
                  </div>

                  {/* Thumbnail Poster Preview */}
                  {formData.posterUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 shadow-xs">
                      <img 
                        src={formData.posterUrl} 
                        alt="Poster Preview" 
                        className="w-10 h-14 object-cover rounded-lg shadow-xs border border-slate-200 dark:border-gray-700" 
                        onError={(e) => (e.currentTarget.style.display = 'none')} 
                      />
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 min-w-0">
                        <span className="font-bold text-slate-800 dark:text-gray-200 block truncate">Xem trước Poster</span>
                        Tỷ lệ chuẩn rạp 2:3
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột 2: Lịch chiếu & Phân loại */}
                <div className="space-y-4 bg-slate-50/60 dark:bg-gray-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800/80">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">2</span> Lịch Chiếu & Phân Loại
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ManageableDropdown
                      label="Trạng thái"
                      storageKey="movie_statuses"
                      value={formData.status}
                      onChange={val => setFormData({ ...formData, status: val })}
                      defaultOptions={[
                        { value: 'NOW_SHOWING', label: 'Đang Chiếu', badge: 'Now Showing', isDefault: true },
                        { value: 'COMING_SOON', label: 'Sắp Chiếu', badge: 'Coming Soon', isDefault: true },
                        { value: 'SPECIAL_SCREENING', label: 'Suất Chiếu Sớm', badge: 'Sneak Show' },
                        { value: 'STOPPED_SHOWING', label: 'Ngừng Chiếu', badge: 'Archived' }
                      ]}
                    />
                    <ManageableDropdown
                      label="Độ tuổi"
                      storageKey="movie_age_ratings"
                      value={formData.ageRating}
                      onChange={val => setFormData({ ...formData, ageRating: val })}
                      defaultOptions={[
                        { value: 'P', label: 'P (Phổ biến)', badge: 'Mọi lứa tuổi', isDefault: true },
                        { value: 'K', label: 'K (Dưới 13 tuổi có bảo trợ)', badge: 'Kèm người lớn', isDefault: true },
                        { value: 'T13', label: 'T13 (Từ 13 tuổi trở lên)', badge: '13+', isDefault: true },
                        { value: 'T16', label: 'T16 (Từ 16 tuổi trở lên)', badge: '16+', isDefault: true },
                        { value: 'T18', label: 'T18 (Từ 18 tuổi trở lên)', badge: '18+', isDefault: true },
                        { value: 'C', label: 'C (Cấm phổ biến)', badge: 'Cấm chiếu' }
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Thời lượng (phút)</label>
                      <input 
                        type="number" 
                        value={formData.duration} 
                        onChange={e => setFormData({...formData, duration: e.target.value})} 
                        className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none text-xs shadow-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Ngày khởi chiếu</label>
                      <input 
                        type="text" 
                        placeholder="DD/MM/YYYY" 
                        value={formData.releaseDate} 
                        onChange={e => setFormData({...formData, releaseDate: e.target.value})} 
                        className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none text-xs shadow-xs" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Thể loại phim</label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl max-h-[120px] overflow-y-auto sidebar-scroll shadow-xs">
                      {dbGenres.map(g => (
                        <button 
                          key={g.id} type="button" 
                          onClick={() => toggleGenre(g.name)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${isGenreSelected(g.name) ? 'bg-orange-500 text-white border-orange-500 shadow-xs' : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-orange-500'}`}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cột 3: Ekip & Sản xuất */}
                <div className="space-y-4 bg-slate-50/60 dark:bg-gray-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-800/80">
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-[10px]">3</span> Ekip & Sản Xuất
                  </h3>
                  <div>
                    <ManageableDropdown
                      label="Đạo diễn"
                      storageKey="movie_directors"
                      value={formData.director}
                      onChange={val => setFormData({ ...formData, director: val })}
                      placeholder="-- Chọn hoặc nhập tên đạo diễn --"
                      allowCustomInput={true}
                      defaultOptions={[
                        { value: 'Trấn Thành', label: 'Trấn Thành', badge: 'Việt Nam', isDefault: true },
                        { value: 'Victor Vũ', label: 'Victor Vũ', badge: 'Việt Nam', isDefault: true },
                        { value: 'Lý Hải', label: 'Lý Hải', badge: 'Việt Nam', isDefault: true },
                        { value: 'Charlie Nguyễn', label: 'Charlie Nguyễn', badge: 'Việt Nam', isDefault: true },
                        { value: 'Khương Ngọc', label: 'Khương Ngọc', badge: 'Việt Nam' },
                        { value: 'Phan Gia Nhật Linh', label: 'Phan Gia Nhật Linh', badge: 'Việt Nam' },
                        { value: 'Nguyễn Quang Dũng', label: 'Nguyễn Quang Dũng', badge: 'Việt Nam' },
                        { value: 'Christopher Nolan', label: 'Christopher Nolan', badge: 'Hollywood', isDefault: true },
                        { value: 'James Cameron', label: 'James Cameron', badge: 'Hollywood', isDefault: true },
                        { value: 'Denis Villeneuve', label: 'Denis Villeneuve', badge: 'Hollywood', isDefault: true },
                        { value: 'Quentin Tarantino', label: 'Quentin Tarantino', badge: 'Hollywood' },
                        { value: 'Steven Spielberg', label: 'Steven Spielberg', badge: 'Hollywood' },
                        { value: 'Martin Scorsese', label: 'Martin Scorsese', badge: 'Hollywood' },
                        { value: 'Bong Joon-ho', label: 'Bong Joon-ho', badge: 'Hàn Quốc', isDefault: true },
                        { value: 'Park Chan-wook', label: 'Park Chan-wook', badge: 'Hàn Quốc' },
                        { value: 'Shinkai Makoto', label: 'Shinkai Makoto', badge: 'Nhật Bản', isDefault: true },
                        { value: 'Hayao Miyazaki', label: 'Hayao Miyazaki', badge: 'Nhật Bản' },
                        { value: 'Anthony & Joe Russo', label: 'Anthony & Joe Russo', badge: 'Marvel MCU' },
                        { value: 'David Ayer', label: 'David Ayer', badge: 'Mỹ' },
                        { value: 'Zach Cregger', label: 'Zach Cregger', badge: 'Mỹ' }
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <ManageableDropdown
                        label="Quốc gia"
                        storageKey="movie_countries"
                        value={formData.country}
                        onChange={val => setFormData({ ...formData, country: val })}
                        placeholder="-- Chọn hoặc nhập quốc gia --"
                        allowCustomInput={true}
                        defaultOptions={[
                          { value: 'Việt Nam', label: 'Việt Nam', badge: 'VN', isDefault: true },
                          { value: 'Mỹ', label: 'Mỹ (Hollywood)', badge: 'US', isDefault: true },
                          { value: 'Hàn Quốc', label: 'Hàn Quốc', badge: 'KR', isDefault: true },
                          { value: 'Nhật Bản', label: 'Nhật Bản (Anime)', badge: 'JP', isDefault: true },
                          { value: 'Thái Lan', label: 'Thái Lan', badge: 'TH', isDefault: true },
                          { value: 'Trung Quốc', label: 'Trung Quốc', badge: 'CN', isDefault: true },
                          { value: 'Hồng Kông', label: 'Hồng Kông', badge: 'HK' },
                          { value: 'Đài Loan', label: 'Đài Loan', badge: 'TW' },
                          { value: 'Pháp', label: 'Pháp', badge: 'FR' },
                          { value: 'Anh', label: 'Vương Quốc Anh', badge: 'UK' },
                          { value: 'Đức', label: 'Đức', badge: 'DE' },
                          { value: 'Tây Ban Nha', label: 'Tây Ban Nha', badge: 'ES' },
                          { value: 'Ấn Độ', label: 'Ấn Độ (Bollywood)', badge: 'IN' },
                          { value: 'Malaysia', label: 'Malaysia', badge: 'MY' },
                          { value: 'Indonesia', label: 'Indonesia', badge: 'ID' },
                          { value: 'Úc', label: 'Úc', badge: 'AU' },
                          { value: 'Canada', label: 'Canada', badge: 'CA' },
                          { value: 'Ý', label: 'Ý', badge: 'IT' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Nhà sản xuất</label>
                      <input type="text" placeholder="Hãng phim..." value={formData.producer} onChange={e => setFormData({...formData, producer: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs shadow-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Diễn viên chính</label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl max-h-[120px] overflow-y-auto sidebar-scroll shadow-xs">
                      {dbActors.map(a => (
                        <button 
                          key={a.id} type="button" 
                          onClick={() => toggleActor(a.name)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${isActorSelected(a.name) ? 'bg-blue-500 text-white border-blue-500 shadow-xs' : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-blue-500'}`}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toàn bộ chiều ngang: Nội dung Tóm Tắt & Cốt Truyện Phim (Full Synopsis) */}
                <div className="col-span-1 lg:col-span-3 pt-4 border-t border-slate-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={16} className="text-orange-500" />
                      Nội Dung Tóm Tắt & Giới Thiệu Cốt Truyện Phim (Full Synopsis)
                    </label>
                    <span className="text-xs text-slate-400 dark:text-gray-500 font-mono">
                      {formData.description?.length || 0} ký tự
                    </span>
                  </div>
                  <textarea 
                    rows={5}
                    placeholder="Nhập nội dung tóm tắt chi tiết cốt truyện phim điện ảnh..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none text-sm leading-relaxed min-h-[140px] resize-y shadow-xs"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                    <span>💡 Đoạn mô tả này sẽ hiển thị đầy đủ trên trang chi tiết phim, banner giới thiệu và trợ lý ảo AI.</span>
                  </p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#1a2333] flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white font-bold transition-colors rounded-xl text-sm hover:bg-slate-200/60 dark:hover:bg-gray-800 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button 
                type="submit" 
                form="add-movie-form" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-orange-500/25 text-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <CheckCircle size={18} /> LƯU THÔNG TIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM TRƯỚC TRAILER (ADMIN) */}
      {previewTrailerUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setPreviewTrailerUrl(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all border border-white/20"
            >
              <X size={20} />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={`${previewTrailerUrl}?autoplay=1`}
                title="Trailer Preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
