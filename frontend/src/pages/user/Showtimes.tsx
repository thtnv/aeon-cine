import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

export default function Showtimes() {
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tạo danh sách 7 ngày liên tiếp từ ngày hiện tại
  const availableDates = useMemo(() => {
    const list = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const daysOfWeek = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      let label = `${daysOfWeek[d.getDay()]}, ${dayStr}`;
      if (i === 0) label = `Hôm nay, ${dayStr}`;
      if (i === 1) label = `Ngày mai, ${dayStr}`;
      list.push({ key, label, date: d });
    }
    return list;
  }, []);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDateKey) {
      setSelectedDateKey(availableDates[0].key);
    }
  }, [availableDates, selectedDateKey]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/movies`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/cinemas`).then(r => r.json()).catch(() => [])
    ]).then(([moviesData, cinemasData]) => {
      if (Array.isArray(moviesData)) setMovies(moviesData.filter((m: any) => m.status === 'NOW_SHOWING'));
      if (Array.isArray(cinemasData) && cinemasData.length > 0) {
        setCinemas(cinemasData);
        setSelectedCinemaId(cinemasData[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCinemaId) return;
    setLoading(true);
    fetch(`${API_URL}/api/showtimes?cinemaId=${selectedCinemaId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setShowtimes(data);
      })
      .catch(err => console.error('Error fetching showtimes for cinema:', err))
      .finally(() => setLoading(false));
  }, [selectedCinemaId]);


  const activeCinema = cinemas.find(c => c.id === selectedCinemaId) || cinemas[0];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-14 max-w-7xl animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles size={12} /> Đồng Bộ Trực Tiếp Từ Hệ Thống
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight uppercase mb-4">
          Lịch Chiếu Phim <span className="text-gradient-gold">Aeon Cine</span>
        </h1>
        <p className="text-white/60 text-sm md:text-base leading-relaxed">
          Cập nhật lịch chiếu phim mới nhất, lựa chọn rạp chiếu gần bạn và giữ chỗ ngồi đẹp nhất chỉ với vài thao tác.
        </p>
      </div>

      {/* Date Selector Rail */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
          <CalendarIcon size={14} className="text-amber-400" /> Chọn Ngày Chiếu
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {availableDates.map(item => {
            const isSelected = selectedDateKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSelectedDateKey(item.key)}
                className={`shrink-0 px-5 py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  isSelected
                    ? 'cinema-btn-primary shadow-lg shadow-amber-500/25 -translate-y-0.5'
                    : 'cinema-glass-subtle text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <CalendarIcon size={14} className={isSelected ? 'text-black' : 'text-amber-400'} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinema Selector Card */}
      <div className="cinema-glass rounded-2xl p-4 sm:p-5 border border-white/[0.08] mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-white/40 tracking-wider">Cụm Rạp Chiếu</span>
            <p className="text-white font-display font-bold text-sm">{activeCinema?.name || 'Aeon Cine'}</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            className="w-full sm:w-72 bg-black/40 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-semibold cursor-pointer transition-colors"
          >
            {cinemas.map(c => (
              <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                {c.name} {c.city ? `(${c.city})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies List with Real Showtimes */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-20 cinema-glass rounded-3xl border border-white/[0.08]">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-xs font-mono">Đang cập nhật danh sách suất chiếu...</p>
          </div>
        )}
        {!loading && movies.length === 0 && (
          <div className="text-center py-20 cinema-glass rounded-3xl border border-white/[0.08]">
            <p className="text-white/50 text-base">Hiện chưa có phim đang chiếu.</p>
          </div>
        )}
        {movies.map(movie => {
          // Lọc suất chiếu của phim tại rạp đã chọn vào ngày đã chọn
          const movieShowtimes = showtimes
            .filter(st => {
              if (st.movieId !== movie.id) return false;
              if (selectedCinemaId && st.room?.cinemaId !== selectedCinemaId) return false;
              if (selectedDateKey) {
                const d = new Date(st.startTime);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (key !== selectedDateKey) return false;
              }
              return true;
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

          return (
            <div
              key={movie.id}
              className="cinema-glass rounded-3xl p-5 sm:p-7 border border-white/[0.08] hover:border-white/15 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden"
            >
              <Link to={`/movie/${movie.id}`} className="shrink-0 relative group w-28 sm:w-36 md:w-44 overflow-hidden rounded-2xl shadow-xl aspect-[2/3] bg-black/40">
                <img
                  src={movie.posterUrl || 'https://via.placeholder.com/300x450'}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                  <span className="cinema-btn-primary text-[10px] px-3 py-1.5 rounded-full font-display font-bold uppercase tracking-wider">Chi tiết</span>
                </div>
              </Link>

              <div className="flex-1 w-full">
                <Link to={`/movie/${movie.id}`}>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 hover:text-amber-300 transition-colors">
                    {movie.title}
                  </h2>
                </Link>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/50 mb-5">
                  <span className="border border-amber-500/30 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    {movie.ageRating || 'T16'}
                  </span>
                  <span>{movie.genre || 'Đang cập nhật'}</span>
                  <span>•</span>
                  <span>{movie.duration ? `${movie.duration} phút` : 'Đang cập nhật'}</span>
                </div>

                {/* Showtimes for selected cinema */}
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={13} className="text-amber-400" /> Suất Chiếu Khả Dụng
                    </h3>
                    <span className="text-[11px] text-white/40 font-mono">
                      {movieShowtimes.length} suất
                    </span>
                  </div>

                  {movieShowtimes.length === 0 ? (
                    <p className="text-white/40 text-xs italic py-2">
                      Không có suất chiếu vào ngày này tại rạp đã chọn. Vui lòng chọn ngày khác.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {movieShowtimes.map(st => {
                        const timeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <button
                            key={st.id}
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
                              const target = `/booking/${movie.id}?showtimeId=${st.id}&cinemaId=${selectedCinemaId}&date=${selectedDateKey}`;
                              if (localStorage.getItem('token')) {
                                navigate(target);
                              } else {
                                navigate(`/login?redirect=${encodeURIComponent(target)}`);
                              }
                            }}
                            className="cinema-btn-glass px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 group hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300 shadow-sm"
                          >
                            <span className="text-black dark:text-white font-black group-hover:text-amber-500 dark:group-hover:text-amber-300">{timeStr}</span>
                            <span className="text-[10px] text-gray-800 dark:text-white/40 font-semibold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/[0.04] border border-black/10 dark:border-white/[0.06] group-hover:border-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-300/80">
                              {st.format === '2D' ? '2D Digital' : (st.format || '2D Digital')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

