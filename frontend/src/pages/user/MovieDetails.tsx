import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, MapPin, Star, PlayCircle, Ticket, Heart, MessageSquare, Send, X, Film, ArrowRight } from 'lucide-react';
import { API_URL } from '../../config/api';
import UserAvatar from '../../components/UserAvatar';
import { formatYouTubeEmbedUrl } from '../../utils/youtube';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface Showtime {
  id: string;
  movieId: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  room?: {
    id: string;
    name: string;
    cinema?: {
      id: string;
      name: string;
      location?: string;
      address?: string;
    };
  };
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [trailerModalUrl, setTrailerModalUrl] = useState<string | null>(null);
  const [activeCinemaId, setActiveCinemaId] = useState<string>('all');
  const [activeFormat, setActiveFormat] = useState<string>('all');

  const token = localStorage.getItem('token');

  const handleBookingAction = (targetUrl: string) => {
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
    const userToken = localStorage.getItem('token');
    if (userToken) {
      navigate(targetUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  const cinemaGroups = useMemo(() => {
    return showtimes.reduce((acc: { [cinemaId: string]: { id: string; name: string; address?: string; list: Showtime[] } }, st) => {
      const cId = st.room?.cinema?.id || 'default';
      const cName = st.room?.cinema?.name || 'Aeon Cine';
      const cAddress = st.room?.cinema?.address;
      if (!acc[cId]) {
        acc[cId] = { id: cId, name: cName, address: cAddress, list: [] };
      }
      acc[cId].list.push(st);
      return acc;
    }, {});
  }, [showtimes]);

  const cinemaList = useMemo(() => Object.values(cinemaGroups), [cinemaGroups]);

  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    showtimes.forEach(st => {
      if (st.format) set.add(st.format);
    });
    return Array.from(set);
  }, [showtimes]);

  const openTrailer = (url?: string | null, title?: string) => {
    const embedUrl = formatYouTubeEmbedUrl(url);
    if (!embedUrl) {
      alert(`Phim "${title || 'này'}" hiện chưa có video trailer từ nhà phát hành.`);
      return;
    }
    setTrailerModalUrl(embedUrl);
  };

  const fetchReviews = () => {
    if (!id) return;
    fetch(`${API_URL}/api/reviews/movie/${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(err => console.error('Error fetching reviews:', err));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/movies/${id}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      });

    fetchReviews();

    fetch(`${API_URL}/api/showtimes/movie/${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setShowtimes(data);
        }
      })
      .catch(err => console.error('Error fetching showtimes:', err))
      .finally(() => setLoadingShowtimes(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const userToken = localStorage.getItem('token');
    let userId = '';
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      userId = userObj.id;
    } catch {}

    if (!userToken || !userId) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          userId,
          movieId: id,
          rating: ratingInput,
          comment: commentInput
        })
      });

      if (res.ok) {
        setCommentInput('');
        fetchReviews();
        // Refresh movie rating
        fetch(`${API_URL}/api/movies/${id}`)
          .then(r => r.json())
          .then(d => setMovie(d));
      }
    } catch (error) {
      console.error('Error posting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!movie) return <div className="text-center text-gray-500 py-24 font-medium">Không tìm thấy tác phẩm</div>;

  return (
    <div className="w-full bg-transparent text-[var(--text-main)] relative">
      {/* Cinematic Backdrop Header */}
      <div className="relative w-full h-[520px] md:h-[640px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80'}
            alt="Backdrop"
            className="w-full h-full object-cover object-center opacity-35 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-[var(--bg-void)]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-void)] via-[var(--bg-void)]/60 to-transparent"></div>
        </div>

        <div className="absolute inset-0 z-10 container mx-auto px-4 lg:px-8 flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="w-52 md:w-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl shadow-black border border-white/10 hidden md:block">
              <img src={movie.posterUrl || 'https://via.placeholder.com/400x600?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-white animate-[fadeIn_0.5s_ease-in-out]">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {movie.ageRating || 'T18'}
                </span>
                <span className="font-mono text-xs font-semibold px-3 py-1 rounded-lg cinema-glass-subtle text-gray-300 border border-white/15">
                  2D DIGITAL • PHỤ ĐỀ
                </span>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  IMAX LASER
                </span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl mb-4 uppercase tracking-normal sm:tracking-tight drop-shadow-xl text-white leading-[1.2] sm:leading-[1.15]">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-gray-300 font-medium mb-8 text-sm">
                <span className="flex items-center gap-2 font-mono"><Clock size={16} className="text-amber-400" /> {movie.duration} Phút</span>
                <span className="flex items-center gap-2 font-mono"><Calendar size={16} className="text-amber-400" /> {movie.releaseDate || 'Đang chiếu'}</span>
                <span className="flex items-center gap-2 font-mono">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{movie.rating || '9.5'}</span>/10 ({movie.votes || 1} đánh giá)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleBookingAction(`/booking/${movie.id}`)}
                  className="cinema-btn-primary py-4 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/30 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" /> MUA VÉ NGAY
                </button>
                <button
                  onClick={() => openTrailer(movie.trailerUrl, movie.title)}
                  className="cinema-btn-glass py-4 px-7 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-amber-400" /> TRAILER
                </button>
                <button 
                  onClick={() => {
                    if (!localStorage.getItem('token')) {
                      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    } else {
                      alert('Đã lưu tác phẩm vào danh sách yêu thích của bạn!');
                    }
                  }}
                  className="w-12 h-12 flex items-center justify-center cinema-glass rounded-full hover:border-rose-500/40 transition-all group cursor-pointer"
                  title="Thêm vào danh sách yêu thích"
                >
                  <Heart className="w-5 h-5 text-gray-400 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 lg:px-8 py-14 flex flex-col lg:flex-row gap-12">

        {/* Left Column - Details & Reviews */}
        <div className="lg:w-2/3">
          <div className="mb-12">
            <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-4 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Nội Dung Tác Phẩm
            </h2>
            <p className="text-gray-300 leading-relaxed text-justify text-base sm:text-lg font-normal text-pretty">
              {movie.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            <div className="cinema-glass-subtle p-5 rounded-2xl border border-white/[0.08]">
              <span className="text-gray-400 text-xs font-mono uppercase block mb-1">Đạo diễn</span>
              <p className="text-white font-bold text-sm sm:text-base truncate">{movie.director || 'Đang cập nhật'}</p>
            </div>
            <div className="cinema-glass-subtle p-5 rounded-2xl border border-white/[0.08]">
              <span className="text-gray-400 text-xs font-mono uppercase block mb-1">Diễn viên</span>
              <p className="text-white font-bold text-sm sm:text-base truncate">{movie.actors || 'Đang cập nhật'}</p>
            </div>
            <div className="cinema-glass-subtle p-5 rounded-2xl border border-white/[0.08]">
              <span className="text-gray-400 text-xs font-mono uppercase block mb-1">Thể loại</span>
              <p className="text-white font-bold text-sm sm:text-base truncate">{movie.genre}</p>
            </div>
            <div className="cinema-glass-subtle p-5 rounded-2xl border border-white/[0.08]">
              <span className="text-gray-400 text-xs font-mono uppercase block mb-1">Quốc gia</span>
              <p className="text-white font-bold text-sm sm:text-base truncate">{movie.country || 'Việt Nam'}</p>
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="border-t border-white/[0.08] pt-12">
            <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <MessageSquare className="text-amber-400" /> Đánh Giá Từ Khán Giả ({reviews.length})
            </h2>

            {/* Write Review Form or Login Callout */}
            {!token ? (
              <div className="cinema-glass rounded-3xl p-6 sm:p-8 mb-10 border border-amber-500/20 text-center flex flex-col items-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
                  <MessageSquare size={22} />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-1.5">
                  Bạn Đã Thưởng Thức Tác Phẩm Này?
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-5 leading-relaxed">
                  Vui lòng đăng nhập tài khoản AEON CINE để gửi đánh giá, chấm điểm sao và chia sẻ cảm nhận với cộng đồng yêu điện ảnh.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                  className="cinema-btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  <span>Đăng Nhập Để Đánh Giá</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="cinema-glass rounded-3xl p-6 sm:p-7 mb-10 border border-white/10">
                <h3 className="font-display font-bold text-white text-base mb-4">Chia sẻ cảm nhận của bạn</h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400 text-xs font-bold mr-2">Chấm điểm:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= ratingInput ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                      />
                    </button>
                  ))}
                  <span className="font-mono text-xs font-bold text-amber-300 ml-2">{ratingInput * 2}/10 điểm</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Chia sẻ nhận xét về nội dung, diễn xuất, kỹ xảo hoặc cảm xúc của bạn..."
                    required
                    rows={3}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="cinema-btn-primary disabled:opacity-50 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 self-stretch sm:self-end text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Send size={15} /> Gửi Đánh Giá
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 cinema-glass-subtle rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-sm">Chưa có bình luận nào. Hãy là người đầu tiên để lại đánh giá cho bộ phim này!</p>
                </div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="cinema-glass-subtle border border-white/[0.07] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          name={rev.user?.name || 'Khán giả'} 
                          avatarUrl={rev.user?.avatar} 
                          size="md" 
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{rev.user?.name || 'Khán giả'}</p>
                          <p className="text-gray-500 font-mono text-xs">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rev.rating * 2}/10
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed text-pretty">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Showtime */}
        <div className="lg:w-1/3">
          <div className="cinema-glass rounded-3xl border border-white/10 p-5 sticky top-28 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="text-amber-500" size={18} /> Suất Chiếu
              </h2>
              {showtimes.length > 0 && (
                <span className="font-mono text-xs bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                  {showtimes.length} suất
                </span>
              )}
            </div>

            {loadingShowtimes ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : showtimes.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-white/5 p-6">
                <Film className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3 stroke-[1.2]" />
                <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">Chưa có lịch chiếu hôm nay</p>
                <p className="text-slate-500 dark:text-gray-400 text-xs mb-5 leading-relaxed">
                  Lịch chiếu cho tác phẩm này sẽ sớm được cập nhật tại các cụm rạp Aeon Cine.
                </p>
                <button
                  onClick={() => handleBookingAction(`/booking/${movie.id}`)}
                  className="cinema-btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Chọn Rạp & Xem Chi Tiết
                </button>
              </div>
            ) : (
              <div>
                {/* Cinema Filter Tabs (if > 1 cinema) */}
                {cinemaList.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 sidebar-scroll">
                    <button
                      onClick={() => setActiveCinemaId('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                        activeCinemaId === 'all'
                          ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                          : 'bg-white dark:bg-white/[0.04] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      Tất cả rạp ({cinemaList.length})
                    </button>
                    {cinemaList.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCinemaId(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                          activeCinemaId === c.id
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-white dark:bg-white/[0.04] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-amber-500/40'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Format Filter Chips (if > 1 format) */}
                {availableFormats.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 sidebar-scroll">
                    <button
                      onClick={() => setActiveFormat('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                        activeFormat === 'all'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      Tất cả
                    </button>
                    {availableFormats.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setActiveFormat(fmt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                          activeFormat === fmt
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cinema Groups List with Max Height Scroll */}
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto sidebar-scroll pr-1">
                  {(activeCinemaId === 'all' ? cinemaList : cinemaList.filter(c => c.id === activeCinemaId)).map(cinema => {
                    const filteredList = cinema.list.filter(st => activeFormat === 'all' || st.format === activeFormat);
                    if (filteredList.length === 0) return null;

                    const roomMap = filteredList.reduce((acc: { [roomId: string]: { name: string; format: string; list: Showtime[] } }, st) => {
                      const rId = st.room?.id || st.room?.name || 'default';
                      const rName = st.room?.name || 'Phòng Chiếu';
                      const rFormat = st.format || '2D';
                      if (!acc[rId]) {
                        acc[rId] = { name: rName, format: rFormat, list: [] };
                      }
                      acc[rId].list.push(st);
                      return acc;
                    }, {});

                    const rooms = Object.values(roomMap).map(r => ({
                      ...r,
                      list: r.list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    }));

                    return (
                      <div key={cinema.id} className="cinema-glass-subtle border border-white/[0.08] rounded-2xl p-3.5 shadow-sm">
                        <div className="mb-2.5">
                          <h4 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1.5">
                            <MapPin size={14} className="text-amber-500 shrink-0" />
                            <span className="truncate">{cinema.name}</span>
                          </h4>
                          {cinema.address && (
                            <p className="text-slate-500 dark:text-gray-400 text-[11px] mt-0.5 ml-5 line-clamp-1">{cinema.address}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          {rooms.map((room, rIdx) => (
                            <div key={rIdx} className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.05]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                                  <Film size={12} className="text-amber-500 shrink-0" />
                                  <span className="truncate">{room.name}</span>
                                </span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  room.format.includes('IMAX')
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    : room.format.includes('3D')
                                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-400'
                                }`}>
                                  {room.format}
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5">
                                {room.list.map(st => {
                                  const timeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                  return (
                                    <button
                                      key={st.id}
                                      onClick={() => handleBookingAction(`/booking/${movie.id}?showtimeId=${st.id}`)}
                                      title={`${cinema.name} • ${room.name} • ${timeStr}`}
                                      className="py-1.5 px-1 rounded-lg bg-white dark:bg-white/[0.07] hover:bg-orange-500 hover:text-white dark:hover:bg-amber-400 dark:hover:text-black border border-slate-300 dark:border-white/10 hover:border-orange-500 dark:hover:border-amber-400 transition-all font-mono text-xs font-black text-slate-900 dark:text-white text-center shadow-2xs hover:scale-105 cursor-pointer"
                                    >
                                      {timeStr}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YOUTUBE TRAILER MODAL */}
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
