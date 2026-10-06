import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Film, PlayCircle, X, ChevronRight, Filter, Clock } from 'lucide-react';
import { API_URL } from '../../config/api';
import { formatYouTubeEmbedUrl } from '../../utils/youtube';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  releaseDate?: string | null;
  rating?: number | null;
  ageRating?: string | null;
  posterUrl: string | null;
  trailerUrl?: string | null;
  status: string;
}

interface Genre {
  id: string;
  name: string;
}

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'NOW_SHOWING' | 'COMING_SOON') || 'NOW_SHOWING';
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>(initialTab);
  const [trailerModalUrl, setTrailerModalUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Helper for official Vietnam cinema age rating badges (Galaxy Cinema standard)
  const getAgeRatingBadge = (rating?: string | null) => {
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

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/movies`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/genres`).then(res => res.json()).catch(() => [])
    ]).then(([moviesData, genresData]) => {
      if (Array.isArray(moviesData)) {
        setMovies(moviesData);
      }
      if (Array.isArray(genresData)) {
        setGenres(genresData);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'NOW_SHOWING' || tabParam === 'COMING_SOON') {
      setActiveTab(tabParam);
    }
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      setSelectedGenre(genreParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'NOW_SHOWING' | 'COMING_SOON') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openTrailer = (url?: string | null, title?: string) => {
    const embedUrl = formatYouTubeEmbedUrl(url);
    if (!embedUrl) {
      alert(`Phim "${title || 'này'}" hiện chưa có video trailer từ nhà phát hành.`);
      return;
    }
    setTrailerModalUrl(embedUrl);
  };

  const nowShowing = movies.filter(m => m.status === 'NOW_SHOWING');
  const comingSoon = movies.filter(m => m.status === 'COMING_SOON');
  const currentList = (activeTab === 'NOW_SHOWING' ? nowShowing : comingSoon).filter(m => {
    if (selectedGenre === 'ALL') return true;
    return m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pt-10 pb-24 relative overflow-hidden">
      {/* Ambient Cinema Lighting */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[350px] bg-amber-500/[0.04] blur-[140px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/[0.08] pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2.5">
              <Link to="/" className="hover:text-amber-400 transition-colors">Trang chủ</Link>
              <ChevronRight size={13} className="text-gray-600" />
              <span className="text-amber-400 font-semibold">Tác phẩm điện ảnh</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white flex items-center gap-3">
              <span className="border-l-4 border-amber-500 pl-3">Kho Phim Điện Ảnh</span>
            </h1>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1.5 rounded-full cinema-glass-subtle border border-white/10 shadow-xl self-start md:self-auto">
            <button
              onClick={() => handleTabChange('NOW_SHOWING')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'NOW_SHOWING'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ĐANG CHIẾU ({nowShowing.length})
            </button>
            <button
              onClick={() => handleTabChange('COMING_SOON')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'COMING_SOON'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SẮP CHIẾU ({comingSoon.length})
            </button>
          </div>
        </div>

        {/* Genre Filter Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 sidebar-scroll">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            <Filter size={13} className="text-amber-400" /> Thể loại:
          </span>
          <button
            onClick={() => setSelectedGenre('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedGenre === 'ALL'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/30'
                : 'cinema-glass-subtle text-gray-300 hover:text-white hover:border-amber-500/30 border border-white/10'
            }`}
          >
            Tất cả ({movies.length})
          </button>
          {genres.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedGenre === g.name
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/30 font-bold'
                  : 'cinema-glass-subtle text-gray-400 hover:text-white hover:border-amber-500/30 border border-white/10'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        {currentList.length === 0 ? (
          <div className="text-center py-24 cinema-glass rounded-3xl border border-white/10">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4 stroke-[1.2]" />
            <p className="text-gray-400 text-base font-medium">Hiện chưa có tác phẩm nào phù hợp với bộ lọc này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {currentList.map(movie => (
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

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                    <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      ★ {movie.rating || '9.0'}
                    </span>
                    {getAgeRatingBadge(movie.ageRating)}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-5 z-30">
                    {activeTab === 'NOW_SHOWING' ? (
                      <button
                        onClick={() => {
                          const userStr = localStorage.getItem('user');
                          if (userStr) {
                            try {
                              const u = JSON.parse(userStr);
                              const role = (u.role || '').toUpperCase();
                              if (role && role !== 'USER') {
                                const portal = role === 'ADMIN' ? '/admin' : role === 'ACCOUNTANT' ? '/accountant' : '/admin/scanner';
                                alert(`Tài khoản ${role} là tài khoản quản trị/nội bộ, không được phép đặt vé xem phim B2C. Đang chuyển hướng về trang làm việc.`);
                                navigate(portal);
                                return;
                              }
                            } catch (e) {}
                          }
                          const target = `/booking/${movie.id}`;
                          if (localStorage.getItem('token')) {
                            navigate(target);
                          } else {
                            navigate(`/login?redirect=${encodeURIComponent(target)}`);
                          }
                        }}
                        className="cinema-btn-primary w-full py-3 text-xs tracking-wider cursor-pointer shadow-lg shadow-amber-500/30 uppercase font-bold"
                      >
                        MUA VÉ NGAY
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="cinema-btn-primary w-full py-3 text-xs tracking-wider cursor-pointer shadow-lg shadow-amber-500/30 uppercase font-bold"
                      >
                        XEM THÔNG TIN
                      </button>
                    )}
                    <button
                      onClick={() => openTrailer(movie.trailerUrl, movie.title)}
                      className="cinema-btn-glass w-full py-2.5 text-xs tracking-wider flex items-center justify-center gap-1.5 cursor-pointer uppercase font-bold"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" /> TRAILER
                    </button>
                    <Link to={`/movie/${movie.id}`} className="text-[11px] text-amber-300/90 hover:text-white font-medium mt-1 underline-offset-4 hover:underline">
                      Chi Tiết Phim →
                    </Link>
                  </div>
                </div>

                {/* Movie Title & Info */}
                <div className="p-4 flex flex-col flex-1 justify-between bg-white dark:bg-[#0e1118]/80">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-normal truncate group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors mb-1.5" title={movie.title}>
                      {movie.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate font-medium">{movie.genre}</p>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-gray-400 font-mono mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500 dark:text-amber-400" />
                      {movie.duration} phút
                    </span>
                    {movie.releaseDate ? (
                      <span className="text-amber-600 dark:text-amber-400/90 font-semibold">{movie.releaseDate}</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">2D / Laser</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Age Rating Guide Legend (Galaxy Cinema Standard) */}
        <div className="mt-16 bg-slate-100 dark:bg-[#1a1d24] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            Bảng Phân Loại Độ Tuổi Phim Điện Ảnh (Theo Tiêu Chuẩn Cục Điện Ảnh)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500 !text-white text-always-white badge-age-rating font-black font-mono text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-sm" style={{ color: '#ffffff' }}>P</span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">Phim dành cho mọi đối tượng khán giả.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-500 !text-white text-always-white badge-age-rating font-black font-mono text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-sm" style={{ color: '#ffffff' }}>K</span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">Khán giả dưới 13 tuổi xem cùng người lớn.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 !text-white text-always-white badge-age-rating font-black font-mono text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-sm" style={{ color: '#ffffff' }}>T13</span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">Khán giả từ đủ 13 tuổi trở lên.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 !text-white text-always-white badge-age-rating font-black font-mono text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-sm" style={{ color: '#ffffff' }}>T16</span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">Khán giả từ đủ 16 tuổi trở lên.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-red-600 !text-white text-always-white badge-age-rating font-black font-mono text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-sm" style={{ color: '#ffffff' }}>T18</span>
              <span className="text-xs text-slate-600 dark:text-gray-300 font-medium">Khán giả từ đủ 18 tuổi trở lên.</span>
            </div>
          </div>
        </div>

      </div>

      {/* YOUTUBE TRAILER MODAL */}
      {trailerModalUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setTrailerModalUrl(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all border border-white/20"
            >
              <X size={20} />
            </button>
            <div className="relative aspect-video w-full">
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
