import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Ticket, ChevronRight, Film, Calendar, MapPin, X,
  Sparkles, BookOpen, Tv, Volume2, Armchair, Popcorn, ArrowRight, Eye, Clock
} from 'lucide-react';
import { API_URL } from '../../config/api';
import { formatYouTubeEmbedUrl } from '../../utils/youtube';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  posterUrl: string | null;
  trailerUrl?: string | null;
  status: string;
  ageRating?: string;
}

interface Promotion {
  id: string;
  title: string;
  desc: string;
  category: string;
  badge?: string;
  code?: string;
  validUntil: string;
  coverUrl?: string;
}

interface BlogArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  publishDate: string;
  readingTime: string;
  imageUrl?: string;
  views: number;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Quick Booking Widget States (All connected to Database)
  const [quickMovieId, setQuickMovieId] = useState('');
  const [quickCinemaId, setQuickCinemaId] = useState('');
  const [quickDateKey, setQuickDateKey] = useState('');
  const [quickShowtimeId, setQuickShowtimeId] = useState('');
  const [movieShowtimes, setMovieShowtimes] = useState<any[]>([]);

  // Youtube Trailer Modal State
  const [trailerModalUrl, setTrailerModalUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Helper for official Vietnam cinema age rating badges
  const getAgeRatingBadge = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'P':
        return <span className="bg-emerald-500 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>P</span>;
      case 'K':
        return <span className="bg-blue-500 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>K</span>;
      case 'T13':
        return <span className="bg-amber-500 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>T13</span>;
      case 'T16':
        return <span className="bg-orange-500 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>T16</span>;
      case 'T18':
        return <span className="bg-red-600 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>T18</span>;
      default:
        return rating ? (
          <span className="bg-orange-500 !text-white text-always-white badge-age-rating font-black text-xs px-2 py-0.5 rounded-lg shadow-lg" style={{ color: '#ffffff' }}>
            {rating}
          </span>
        ) : null;
    }
  };

  // Fetch movies, cinemas, promotions, and blogs from Backend API
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/movies`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/cinemas`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/promotions`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/blogs`).then(res => res.json()).catch(() => [])
    ]).then(([moviesData, cinemasData, promosData, blogsData]) => {
      if (Array.isArray(moviesData)) {
        setMovies(moviesData);
        const nowPlaying = moviesData.filter(m => m.status === 'NOW_SHOWING');
        if (nowPlaying.length > 0) {
          setQuickMovieId(nowPlaying[0].id);
        } else if (moviesData.length > 0) {
          setQuickMovieId(moviesData[0].id);
        }
      }
      if (Array.isArray(cinemasData) && cinemasData.length > 0) {
        setCinemas(cinemasData);
        setQuickCinemaId(cinemasData[0].id);
      }
      if (Array.isArray(promosData)) {
        setPromotions(promosData);
      }
      if (Array.isArray(blogsData)) {
        setBlogs(blogsData);
      }
      setLoading(false);
    });
  }, []);

  // Fetch Showtimes dynamically whenever quickMovieId changes
  useEffect(() => {
    if (!quickMovieId) return;
    fetch(`${API_URL}/api/showtimes/movie/${quickMovieId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMovieShowtimes(data);
        } else {
          setMovieShowtimes([]);
        }
      })
      .catch(() => setMovieShowtimes([]));
  }, [quickMovieId]);

  // 1. Available Cinemas for selected movie from DB
  const availableCinemas = useMemo(() => {
    if (!movieShowtimes || movieShowtimes.length === 0) {
      return cinemas;
    }
    const map = new Map();
    for (const st of movieShowtimes) {
      if (st.room?.cinema && !map.has(st.room.cinema.id)) {
        map.set(st.room.cinema.id, st.room.cinema);
      }
    }
    const list = Array.from(map.values());
    return list.length > 0 ? list : cinemas;
  }, [movieShowtimes, cinemas]);

  // Auto-sync selected cinema
  useEffect(() => {
    if (availableCinemas.length > 0) {
      const exists = availableCinemas.some(c => c.id === quickCinemaId);
      if (!exists) {
        setQuickCinemaId(availableCinemas[0].id);
      }
    } else {
      setQuickCinemaId('');
    }
  }, [availableCinemas, quickCinemaId]);

  // 2. Filter showtimes by selected cinema
  const filteredByCinema = useMemo(() => {
    if (!quickCinemaId) return [];
    return movieShowtimes.filter(st => st.room?.cinemaId === quickCinemaId);
  }, [movieShowtimes, quickCinemaId]);

  // 3. Available Dates for selected movie & cinema from DB
  const availableDateKeys = useMemo(() => {
    const set = new Set<string>();
    for (const st of filteredByCinema) {
      const d = new Date(st.startTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      set.add(key);
    }
    return Array.from(set).sort();
  }, [filteredByCinema]);

  // Auto-sync selected date
  useEffect(() => {
    if (availableDateKeys.length > 0) {
      if (!availableDateKeys.includes(quickDateKey)) {
        setQuickDateKey(availableDateKeys[0]);
      }
    } else {
      setQuickDateKey('');
    }
  }, [availableDateKeys, quickDateKey]);

  // 4. Available Showtimes for selected movie, cinema & date from DB
  const availableShowtimes = useMemo(() => {
    if (!quickDateKey) return [];
    return filteredByCinema
      .filter(st => {
        const d = new Date(st.startTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return key === quickDateKey;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [filteredByCinema, quickDateKey]);

  // Auto-sync selected showtime
  useEffect(() => {
    if (availableShowtimes.length > 0) {
      const exists = availableShowtimes.some(st => st.id === quickShowtimeId);
      if (!exists) {
        setQuickShowtimeId(availableShowtimes[0].id);
      }
    } else {
      setQuickShowtimeId('');
    }
  }, [availableShowtimes, quickShowtimeId]);

  // Format date label (Hôm nay, Ngày mai, Thứ...)
  const formatDateLabel = (dateKey: string) => {
    if (!dateKey) return '';
    const [y, m, d] = dateKey.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formattedDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    if (diffDays === 0) return `Hôm nay (${formattedDate})`;
    if (diffDays === 1) return `Ngày mai (${formattedDate})`;
    if (diffDays === 2) return `Ngày kia (${formattedDate})`;

    const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return `${daysOfWeek[target.getDay()]} (${formattedDate})`;
  };

  const nowShowing = movies.filter(m => m.status === 'NOW_SHOWING');
  const comingSoon = movies.filter(m => m.status === 'COMING_SOON');
  const displayedMovies = activeTab === 'NOW_SHOWING' ? nowShowing : comingSoon;

  // Hero movies - dynamic from DB
  const heroMovies = useMemo(() => {
    if (nowShowing.length > 0) return nowShowing.slice(0, 5);
    if (movies.length > 0) return movies.slice(0, 5);
    return [];
  }, [nowShowing, movies]);

  // Auto slide
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const openTrailer = (url?: string | null, title?: string) => {
    const embedUrl = formatYouTubeEmbedUrl(url);
    if (!embedUrl) {
      alert(`Phim "${title || 'này'}" hiện chưa có video trailer từ nhà phát hành.`);
      return;
    }
    setTrailerModalUrl(embedUrl);
  };

  const navigateToBooking = (targetMovieId: string, paramsStr: string = '') => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = (u.role || '').toUpperCase();
        if (role && role !== 'USER') {
          const portal = role === 'ADMIN' ? '/admin' : role === 'ACCOUNTANT' ? '/accountant' : '/admin/scanner';
          alert(`Tài khoản ${role} là tài khoản quản trị/nội bộ, không được phép đặt vé xem phim B2C nhằm tuân thủ quy chế kiểm soát nội bộ. Đang chuyển hướng về trang làm việc.`);
          navigate(portal);
          return;
        }
      } catch (e) {}
    }
    const targetUrl = `/booking/${targetMovieId}${paramsStr}`;
    if (localStorage.getItem('token')) {
      navigate(targetUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMovieId = quickMovieId || (movies[0] ? movies[0].id : '1');
    const params = new URLSearchParams();
    if (quickShowtimeId) params.set('showtimeId', quickShowtimeId);
    if (quickCinemaId) params.set('cinemaId', quickCinemaId);
    if (quickDateKey) params.set('date', quickDateKey);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigateToBooking(targetMovieId, queryString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Ambient Spotlight Glow in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-amber-500/[0.05] blur-[150px] rounded-full pointer-events-none -z-10"></div>

      {/* Hero Banner Slider (Tỷ lệ cân đối tinh tế chuẩn rạp chiếu, không bị tràn màn hình) */}
      <div className="relative w-full h-[460px] sm:h-[510px] lg:h-[560px] overflow-hidden bg-[var(--bg-void)]">
        {heroMovies.map((hero: any, index) => {
          const isActive = index === currentHeroIndex;
          return (
            <div
              key={hero.id || index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 z-10 visible scale-100 pointer-events-auto'
                  : 'opacity-0 z-0 invisible pointer-events-none scale-[1.02]'
              }`}
            >
              {/* Multi-layered Theatrical Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-[var(--bg-void)]/60 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-void)] via-[var(--bg-void)]/85 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_30%,_var(--bg-void)_100%)] opacity-70 z-10"></div>

              <img 
                src={hero.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80'} 
                alt={hero.title} 
                className="w-full h-full object-cover object-center opacity-50 dark:opacity-60 transition-transform duration-10000 ease-out" 
              />

              <div className="absolute inset-0 z-20 container mx-auto px-4 lg:px-8 flex flex-col justify-center items-start pt-4 sm:pt-6">
                <div className="max-w-2xl animate-[fadeIn_0.5s_ease-out]">
                  
                  {/* Premiere Tag with Live Indicator */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full cinema-glass-subtle border border-amber-500/30 mb-3.5 shadow-md shadow-amber-500/10 dark:shadow-black/40">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-amber-600 dark:text-amber-300 font-bold uppercase">
                      SIÊU PHẨM KHỞI CHIẾU ĐỘC QUYỀN
                    </span>
                  </div>

                  {/* Film Title in High-End Display Typography */}
                  <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[44px] text-[var(--text-main)] mb-3.5 uppercase tracking-normal sm:tracking-tight drop-shadow-sm dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] leading-[1.15] text-balance">
                    {hero.title}
                  </h1>

                  {/* Film Specs & Badges Row */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-gray-300 mb-5 font-medium">
                    {/* Rating Badge */}
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      ★ {(hero as any).rating || '9.2'} / 10
                    </span>

                    {/* Age Rating Badge */}
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200/90 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15">
                      {hero.ageRating || 'T16'}
                    </span>

                    <span className="text-slate-400 dark:text-gray-500">•</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{hero.genre}</span>

                    {hero.duration ? (
                      <>
                        <span className="text-slate-400 dark:text-gray-500">•</span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 dark:text-gray-300">
                          <Clock size={13} className="text-amber-500 dark:text-amber-400" />
                          {hero.duration} phút
                        </span>
                      </>
                    ) : null}

                    <span className="text-slate-400 dark:text-gray-500">•</span>
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      IMAX Laser 4K
                    </span>
                  </div>

                  {/* Call to Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => navigateToBooking(hero.id)}
                      className="cinema-btn-primary py-2.5 sm:py-3 px-6 text-xs sm:text-sm flex items-center gap-2 group cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Ticket className="w-4 h-4 transition-transform group-hover:rotate-12" />
                      <span>MUA VÉ NGAY</span>
                    </button>

                    <button 
                      onClick={() => openTrailer(hero.trailerUrl, hero.title)}
                      className="cinema-btn-glass py-2.5 sm:py-3 px-5 text-xs sm:text-sm flex items-center gap-2 group cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 transition-transform group-hover:scale-110" />
                      <span>XEM TRAILER</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Theatrical Slider Progress Bar & Thumbnails */}
        <div className="absolute bottom-6 right-4 lg:right-12 z-30 flex items-center gap-2.5">
          {heroMovies.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentHeroIndex 
                  ? 'w-8 bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]' 
                  : 'w-2 bg-slate-400/40 dark:bg-white/20 hover:bg-slate-500/60 dark:hover:bg-white/40'
              }`}
              title={m.title}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* QUICK BOOKING CONCIERGE BAR */}
      <div className="container mx-auto px-4 lg:px-8 -mt-12 sm:-mt-14 relative z-30 mb-16">
        <div className="cinema-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/90 border border-white/10 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 left-1/3 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none"></div>

          {/* Concierge Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-white/[0.07] gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Ticket size={15} />
              </div>
              <div>
                <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  AEON CINE CONCIERGE
                </span>
                <span className="text-[11px] text-gray-400 font-medium ml-2 hidden md:inline">
                  • Đặt vé trực tuyến nhanh chóng, giữ chỗ đẹp không cần xếp hàng
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5 self-start sm:self-auto">
              <Sparkles size={13} />
              <span>GIẢM 15% CHO THÀNH VIÊN ONLINE</span>
            </div>
          </div>

          <form 
            onSubmit={handleQuickBookingSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center"
          >
            {/* Step 1: Phim */}
            <div className="flex flex-col bg-white/[0.03] hover:bg-white/[0.05] p-3 rounded-2xl border border-white/[0.07] transition-all">
              <label className="text-[11px] font-mono font-bold text-gray-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Film className="w-3.5 h-3.5 text-amber-400" /> CHỌN TÁC PHẨM
                </span>
                <span className="text-[10px] text-amber-400/70">01</span>
              </label>
              <select
                value={quickMovieId}
                onChange={(e) => setQuickMovieId(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer py-1 truncate"
              >
                {nowShowing.length === 0 ? (
                  <option value="1" className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">DUNE: PART TWO</option>
                ) : (
                  nowShowing.map(m => (
                    <option key={m.id} value={m.id} className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">
                      {m.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Step 2: Rạp */}
            <div className="flex flex-col bg-white/[0.03] hover:bg-white/[0.05] p-3 rounded-2xl border border-white/[0.07] transition-all">
              <label className="text-[11px] font-mono font-bold text-gray-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> CỤM RẠP
                </span>
                <span className="text-[10px] text-amber-400/70">02</span>
              </label>
              <select
                value={quickCinemaId}
                onChange={(e) => setQuickCinemaId(e.target.value)}
                disabled={availableCinemas.length === 0}
                className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer py-1 truncate disabled:opacity-40"
              >
                {availableCinemas.length === 0 ? (
                  <option value="" className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">Không có rạp chiếu</option>
                ) : (
                  availableCinemas.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Step 3: Ngày */}
            <div className="flex flex-col bg-white/[0.03] hover:bg-white/[0.05] p-3 rounded-2xl border border-white/[0.07] transition-all">
              <label className="text-[11px] font-mono font-bold text-gray-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> NGÀY CHIẾU
                </span>
                <span className="text-[10px] text-amber-400/70">03</span>
              </label>
              <select
                value={quickDateKey}
                onChange={(e) => setQuickDateKey(e.target.value)}
                disabled={availableDateKeys.length === 0}
                className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer py-1 truncate disabled:opacity-40"
              >
                {availableDateKeys.length === 0 ? (
                  <option value="" className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">Chưa có lịch chiếu</option>
                ) : (
                  availableDateKeys.map(key => (
                    <option key={key} value={key} className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">
                      {formatDateLabel(key)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Step 4: Suất chiếu */}
            <div className="flex flex-col bg-white/[0.03] hover:bg-white/[0.05] p-3 rounded-2xl border border-white/[0.07] transition-all">
              <label className="text-[11px] font-mono font-bold text-gray-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> SUẤT CHIẾU
                </span>
                <span className="text-[10px] text-amber-400/70">04</span>
              </label>
              <select
                value={quickShowtimeId}
                onChange={(e) => setQuickShowtimeId(e.target.value)}
                disabled={availableShowtimes.length === 0}
                className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer py-1 truncate disabled:opacity-40"
              >
                {availableShowtimes.length === 0 ? (
                  <option value="" className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">Hết suất chiếu</option>
                ) : (
                  availableShowtimes.map(st => {
                    const tStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <option key={st.id} value={st.id} className="bg-white dark:bg-[#0f121a] text-slate-900 dark:text-white">
                        {tStr} ({st.format || '2D'} - {st.language || 'Phụ đề'})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Action Submit */}
            <div className="flex flex-col md:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="cinema-btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>XÁC NHẬN VÉ</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION: PHIM ĐIỆN ẢNH ĐANG & SẮP CHIẾU */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        
        {/* Section Header with Refined Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/[0.07] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs tracking-widest uppercase mb-1.5">
              <Film size={14} />
              <span>LỰA CHỌN NỔI BẬT HÔM NAY</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Tác Phẩm Điện Ảnh
            </h2>
          </div>

          {/* Capsule Tab Switch */}
          <div className="flex p-1.5 rounded-full cinema-glass-subtle border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('NOW_SHOWING')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'NOW_SHOWING' 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ĐANG CHIẾU ({nowShowing.length})
            </button>
            <button
              onClick={() => setActiveTab('COMING_SOON')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'COMING_SOON' 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SẮP CHIẾU ({comingSoon.length})
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        {displayedMovies.length === 0 ? (
          <div className="text-center py-24 cinema-glass rounded-3xl border border-white/10">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4 stroke-[1.2]" />
            <p className="text-gray-400 text-base font-medium">Hiện chưa có tác phẩm nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {displayedMovies.slice(0, 8).map(movie => (
              <div 
                key={movie.id} 
                className="group relative rounded-2xl overflow-hidden cinema-glass-subtle border border-white/[0.08] cinema-card-interactive flex flex-col"
              >
                {/* Poster Frame */}
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-[#0d1017]">
                  <img
                    src={movie.posterUrl || 'https://via.placeholder.com/400x600?text=No+Poster'}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Overlay for Cinematic Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-[#0b0e14] via-transparent to-black/20 opacity-80 pointer-events-none"></div>

                  {/* Top Badges (Age & Rating) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                    <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      ★ {(movie as any).rating || '9.0'}
                    </span>
                    {getAgeRatingBadge((movie as any).ageRating)}
                  </div>

                  {/* Hover Actions (Frosted Glass Overlay) */}
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-5 z-30">
                    {activeTab === 'NOW_SHOWING' ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToBooking(movie.id);
                        }}
                        className="cinema-btn-primary w-full py-3 text-xs tracking-wider cursor-pointer shadow-lg shadow-amber-500/30"
                      >
                        MUA VÉ NGAY
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/movie/${movie.id}`);
                        }}
                        className="cinema-btn-primary w-full py-3 text-xs tracking-wider cursor-pointer shadow-lg shadow-amber-500/30"
                      >
                        XEM CHI TIẾT
                      </button>
                    )}

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        openTrailer(movie.trailerUrl, movie.title);
                      }}
                      className="cinema-btn-glass w-full py-2.5 text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" /> TRAILER
                    </button>

                    <Link 
                      to={`/movie/${movie.id}`} 
                      className="text-[11px] text-amber-300/90 hover:text-white font-medium mt-1 underline-offset-4 hover:underline"
                    >
                      Chi tiết & Đánh giá →
                    </Link>
                  </div>
                </div>

                {/* Movie Meta Information */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-[#0e1118]/80">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white uppercase tracking-normal truncate group-hover:text-amber-300 transition-colors mb-1.5">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate font-medium">
                      {movie.genre}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-[11px]">
                    <span className="font-mono text-gray-400 flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" />
                      {movie.duration} phút
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      2D / Laser
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-14">
          <button 
            onClick={() => navigate(`/movies?tab=${activeTab}`)}
            className="cinema-btn-glass px-8 py-3.5 text-xs font-bold tracking-wider inline-flex items-center gap-2 group cursor-pointer"
          >
            <span>KHÁM PHÁ TOÀN BỘ DANH SÁCH PHIM</span>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* SECTION: TRẢI NGHIỆM ĐIỆN ẢNH THƯỢNG LƯU (CINEMA STANDARDS) */}
      <div className="container mx-auto px-4 lg:px-8 mt-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs tracking-widest uppercase mb-2">
            <Sparkles size={14} />
            <span>TIÊU CHUẨN THẾ HỆ MỚI</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight mb-3">
            Đẳng Cấp Phòng Chiếu AEON CINE
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed text-pretty">
            Mỗi suất chiếu là một kiệt tác trải nghiệm, kết hợp công nghệ trình chiếu tối tân cùng sự tiện nghi tột bậc.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="cinema-glass-subtle p-6 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Tv size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
              Màn Chiếu Laser 4K
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Máy chiếu Laser RGB thế hệ mới mang lại độ sáng chuẩn DCI, dải màu điện ảnh vượt trội và độ phân giải 4K sắc nét tới từng khung hình.
            </p>
          </div>

          <div className="cinema-glass-subtle p-6 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Volume2 size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
              Âm Thanh Dolby Atmos
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Hệ thống loa vòm 360 độ chuẩn phòng thu quốc tế, giúp người xem cảm nhận từng tiếng rơi nhẹ hay những tiếng gầm vang dội của bom tấn.
            </p>
          </div>

          <div className="cinema-glass-subtle p-6 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Armchair size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
              Ghế VIP Gold Class
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Ghế da thật chỉnh điện ngả 160 độ, tích hợp sạc không dây và vách ngăn riêng tư, nâng niu trọn vẹn từng khoảnh khắc thư giãn.
            </p>
          </div>

          <div className="cinema-glass-subtle p-6 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Popcorn size={22} />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
              Gourmet Concession
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Thực đơn bắp rang bơ nấm thủ công vị Caramel Muối biển và Phô mai Truffle thượng hạng cùng đồ uống pha chế độc quyền.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: KHUYẾN MÃI & ĐẶC QUYỀN */}
      <div className="container mx-auto px-4 lg:px-8 mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs tracking-widest uppercase mb-1">
              <Sparkles size={14} />
              <span>ĐẶC QUYỀN & ƯU ĐÃI</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Khuyến Mãi Dành Cho Bạn
            </h2>
          </div>
          <Link 
            to="/promotions" 
            className="text-xs uppercase font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group transition-colors"
          >
            <span>Toàn Bộ Ưu Đãi</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.slice(0, 4).map((promo) => (
            <Link
              key={promo.id}
              to="/promotions"
              className="group cinema-glass-subtle rounded-3xl overflow-hidden border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-xl shadow-black/40"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-[#0d1017]">
                <img 
                  src={promo.coverUrl || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80'} 
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 dark:from-[#0e1118] via-transparent to-transparent opacity-70"></div>
                {promo.badge && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-mono text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                    {promo.badge}
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-sm line-clamp-2 group-hover:text-amber-300 transition-colors mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {promo.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 font-mono text-gray-400">
                    <Calendar size={12} className="text-amber-400" />
                    <span>Hạn: {promo.validUntil}</span>
                  </span>
                  <span className="text-amber-400 font-bold group-hover:underline flex items-center">
                    Chi tiết <ArrowRight size={11} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION: GÓC ĐIỆN ẢNH & TIN TỨC */}
      <div className="container mx-auto px-4 lg:px-8 mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs tracking-widest uppercase mb-1">
              <BookOpen size={14} />
              <span>GÓC ĐIỆN ẢNH & REVIEW</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Bình Luận & Chuyên Đề
            </h2>
          </div>
          <Link 
            to="/blog" 
            className="text-xs uppercase font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group transition-colors"
          >
            <span>Tất Cả Bài Viết</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map((blog) => (
            <Link
              key={blog.id}
              to="/blog"
              className="group cinema-glass-subtle rounded-3xl overflow-hidden border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-xl shadow-black/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#0d1017]">
                <img 
                  src={blog.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 dark:from-[#0e1118] via-transparent to-transparent opacity-70"></div>
                <span className="absolute top-3 left-3 bg-slate-900/80 dark:bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full">
                  {blog.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-base line-clamp-2 group-hover:text-amber-300 transition-colors mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {blog.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-3 font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" />
                      <span>{blog.readingTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{blog.views}</span>
                    </span>
                  </div>
                  <span className="text-amber-400 font-bold group-hover:underline flex items-center">
                    Đọc tiếp <ArrowRight size={11} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* YOUTUBE THEATER MODAL */}
      {trailerModalUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-4xl cinema-glass rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40">
              <span className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <PlayCircle className="text-amber-400 w-4 h-4" /> Trailer Chính Thức
              </span>
              <button
                onClick={() => setTrailerModalUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-500 hover:text-white flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${trailerModalUrl}?autoplay=1`}
                title="Movie Trailer"
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
