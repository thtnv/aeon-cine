import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, X, CheckCircle, CalendarDays, 
  Search, Clock, Filter, ChevronLeft, ChevronRight, 
  RotateCcw, Film, MapPin, Monitor
} from 'lucide-react';
import { API_URL } from '../../config/api';
import ManageableDropdown, { type DropdownItem } from './ManageableDropdown';

export default function ShowtimeManager() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCinemaFilter, setSelectedCinemaFilter] = useState('');
  const [selectedMovieFilter, setSelectedMovieFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    roomId: '',
    format: '2D Digital',
    language: 'Phụ đề',
    startTime: '',
    endTime: ''
  });

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/showtimes?_t=${Date.now()}`, {
        cache: 'no-cache',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setShowtimes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch showtimes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [moviesRes, cinemasRes] = await Promise.all([
        fetch(`${API_URL}/api/movies?_t=${Date.now()}`, { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`${API_URL}/api/cinemas?_t=${Date.now()}`, { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } })
      ]);
      if (moviesRes.ok) {
        const mData = await moviesRes.json();
        setMovies(Array.isArray(mData) ? mData : []);
      }
      if (cinemasRes.ok) {
        const cData = await cinemasRes.json();
        setCinemas(Array.isArray(cData) ? cData : []);
      }
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
    }
  };

  useEffect(() => {
    fetchShowtimes();
    fetchDependencies();
  }, []);

  // Filtered & Searched Showtimes
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      // 1. Search text (Title, Cinema, Room, Format)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const movieTitle = (st.movie?.title || '').toLowerCase();
        const cinemaName = (st.room?.cinema?.name || '').toLowerCase();
        const roomName = (st.room?.name || '').toLowerCase();
        const format = (st.format || '').toLowerCase();
        const matches = movieTitle.includes(query) || 
                        cinemaName.includes(query) || 
                        roomName.includes(query) ||
                        format.includes(query);
        if (!matches) return false;
      }

      // 2. Cinema Filter
      if (selectedCinemaFilter && st.room?.cinemaId !== selectedCinemaFilter) {
        return false;
      }

      // 3. Movie Filter
      if (selectedMovieFilter && st.movieId !== selectedMovieFilter) {
        return false;
      }

      // 4. Date Filter
      if (selectedDateFilter) {
        const stDate = new Date(st.startTime).toISOString().slice(0, 10);
        if (stDate !== selectedDateFilter) return false;
      }

      // 5. Format Filter
      if (selectedFormatFilter) {
        const itemFmt = (st.format || '').toUpperCase();
        const filterFmt = selectedFormatFilter.toUpperCase();
        if (filterFmt === 'IMAX') {
          if (!itemFmt.includes('IMAX')) return false;
        } else if (filterFmt === '3D') {
          if (!itemFmt.includes('3D')) return false;
        } else if (filterFmt === '2D') {
          if (itemFmt.includes('3D') || itemFmt.includes('IMAX')) return false;
        } else {
          if (!itemFmt.includes(filterFmt)) return false;
        }
      }

      return true;
    });
  }, [showtimes, searchTerm, selectedCinemaFilter, selectedMovieFilter, selectedDateFilter, selectedFormatFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCinemaFilter, selectedMovieFilter, selectedDateFilter, selectedFormatFilter, pageSize]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredShowtimes.length / pageSize));
  const paginatedShowtimes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShowtimes.slice(start, start + pageSize);
  }, [filteredShowtimes, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    searchTerm || selectedCinemaFilter || selectedMovieFilter || selectedDateFilter || selectedFormatFilter
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCinemaFilter('');
    setSelectedMovieFilter('');
    setSelectedDateFilter('');
    setSelectedFormatFilter('');
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setEditingShowtime(null);
    setFormData({
      movieId: '',
      cinemaId: cinemas[0]?.id || '',
      roomId: '',
      format: '2D Digital',
      language: 'Phụ đề',
      startTime: '',
      endTime: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (showtime: any) => {
    setEditingShowtime(showtime);
    
    const formatTime = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const rawFmt = (showtime.format || '').toUpperCase();
    let normalizedFmt = '2D Digital';
    if (rawFmt.includes('IMAX')) normalizedFmt = 'IMAX Laser';
    else if (rawFmt.includes('3D')) normalizedFmt = '3D Atmos';
    else if (rawFmt.includes('ATMOS')) normalizedFmt = '2D Atmos';

    setFormData({
      movieId: showtime.movieId,
      cinemaId: showtime.room?.cinemaId || '',
      roomId: showtime.roomId,
      format: normalizedFmt,
      language: showtime.language || 'Phụ đề',
      startTime: formatTime(showtime.startTime),
      endTime: formatTime(showtime.endTime)
    });
    setIsModalOpen(true);
  };

  // Auto-fill end time when start time or movie changes
  const handleStartTimeChange = (startTimeVal: string) => {
    let nextEndTime = formData.endTime;
    if (startTimeVal && formData.movieId) {
      const selectedMovie = movies.find(m => m.id === formData.movieId);
      if (selectedMovie && selectedMovie.duration) {
        const start = new Date(startTimeVal);
        const end = new Date(start.getTime() + (selectedMovie.duration + 20) * 60000); // duration + 20m cleanup
        nextEndTime = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
    }
    setFormData(prev => ({ ...prev, startTime: startTimeVal, endTime: nextEndTime }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.movieId || !formData.roomId || !formData.startTime || !formData.endTime) {
      alert("Vui lòng điền đầy đủ các trường thông tin!");
      return;
    }
    
    const url = editingShowtime 
      ? `${API_URL}/api/showtimes/${editingShowtime.id}`
      : `${API_URL}/api/showtimes`;
      
    const method = editingShowtime ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchShowtimes();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.message || 'Không thể lưu lịch chiếu'}`);
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteShowtime = async (id: string) => {
    if (deletingId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) return;
    try {
      setDeletingId(id);
      // Optimistic update: ẩn ngay khỏi danh sách để giao diện phản hồi tức thì
      setShowtimes(prev => prev.filter(st => st.id !== id));

      const res = await fetch(`${API_URL}/api/showtimes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Lỗi khi xóa lịch chiếu');
      }
      // Đồng bộ lại với máy chủ
      await fetchShowtimes();
    } catch (error) {
      alert('Lỗi kết nối khi xóa lịch chiếu');
      await fetchShowtimes();
    } finally {
      setDeletingId(null);
    }
  };

  const selectedCinemaInModal = cinemas.find(c => c.id === formData.cinemaId);

  // Danh sách phòng chiếu dạng DropdownItem của Cụm Rạp được chọn
  const currentCinemaRooms: DropdownItem[] = useMemo(() => {
    if (!selectedCinemaInModal?.rooms) return [];
    return selectedCinemaInModal.rooms.map((r: any) => ({
      value: r.id,
      label: r.name,
      badge: '80 ghế'
    }));
  }, [selectedCinemaInModal]);

  // Handler thêm phòng chiếu mới cho Cụm rạp
  const handleServerAddRoom = async (name: string) => {
    if (!formData.cinemaId) {
      alert('Vui lòng chọn Cụm Rạp trước khi thêm phòng chiếu!');
      return false;
    }
    try {
      const res = await fetch(`${API_URL}/api/cinemas/${formData.cinemaId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newRoom = await res.json();
        await fetchDependencies();
        setFormData(prev => ({ ...prev, roomId: newRoom.id }));
        return true;
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể tạo phòng chiếu'}`);
        return false;
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
      return false;
    }
  };

  // Handler sửa tên phòng chiếu
  const handleServerEditRoom = async (roomId: string, newName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/cinemas/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        await fetchDependencies();
        return true;
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể cập nhật phòng chiếu'}`);
        return false;
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
      return false;
    }
  };

  // Handler xóa phòng chiếu
  const handleServerDeleteRoom = async (roomId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/cinemas/rooms/${roomId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchDependencies();
        if (formData.roomId === roomId) {
          setFormData(prev => ({ ...prev, roomId: '' }));
        }
        return true;
      } else {
        const err = await res.json();
        alert(`Không thể xóa: ${err.error || 'Có lỗi xảy ra'}`);
        return false;
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
      return false;
    }
  };

  // Status helper
  const getShowtimeStatus = (startStr: string, endStr: string) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now > end) {
      return { label: 'Đã chiếu', color: 'bg-gray-800 text-gray-400 border-gray-700' };
    } else if (now >= start && now <= end) {
      return { label: 'Đang chiếu', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' };
    } else {
      return { label: 'Sắp chiếu', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] p-5 sm:p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
            <CalendarDays className="text-orange-500" /> Quản Lý Lịch Chiếu
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Tổng cộng: <strong className="text-orange-400">{showtimes.length}</strong> suất chiếu | Đang hiển thị: <strong className="text-white">{filteredShowtimes.length}</strong> kết quả
          </p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center gap-2 text-sm shrink-0 hover:scale-105"
        >
          <Plus size={18} /> Thêm Lịch Chiếu
        </button>
      </div>

      {/* 2. Compact Search & Filter Toolbar */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-gray-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Quick Search Input */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên phim, cụm rạp, phòng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none transition-all placeholder:text-gray-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter by Cinema */}
          <div className="lg:col-span-3">
            <select
              value={selectedCinemaFilter}
              onChange={e => setSelectedCinemaFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">🏢 Tất cả Cụm Rạp ({cinemas.length})</option>
              {cinemas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Movie */}
          <div className="lg:col-span-3">
            <select
              value={selectedMovieFilter}
              onChange={e => setSelectedMovieFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer truncate"
            >
              <option value="">🎬 Tất cả Phim ({movies.length})</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          {/* Filter by Date */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={selectedDateFilter}
              onChange={e => setSelectedDateFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
              title="Lọc theo ngày chiếu"
            />
          </div>
        </div>

        {/* Secondary Filters & Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Filter size={13} /> Định dạng:
            </span>
            {['', '2D', '3D', 'IMAX'].map(fmt => {
              const active = selectedFormatFilter === fmt;
              return (
                <button
                  key={fmt || 'ALL'}
                  onClick={() => setSelectedFormatFilter(fmt)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    active 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  {fmt || 'Tất cả'}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-semibold transition-colors py-1 px-2.5 rounded-lg hover:bg-orange-500/10"
            >
              <RotateCcw size={13} /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 3. Compact Showtimes Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-gray-800/60 text-slate-700 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80 w-12 text-center">STT</th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80">Phim & Định Dạng</th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80">Cụm Rạp & Phòng Chiếu</th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80">Thời Gian Chiếu</th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80 text-center">Trạng Thái</th>
                <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-gray-700/80 text-right w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                    <p>Đang tải danh sách lịch chiếu...</p>
                  </td>
                </tr>
              ) : paginatedShowtimes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <CalendarDays size={36} className="mx-auto text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-300">Không tìm thấy lịch chiếu nào phù hợp</p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3.5 py-1.5 rounded-lg font-bold transition-colors"
                      >
                        Đặt lại toàn bộ bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedShowtimes.map((item, index) => {
                  const status = getShowtimeStatus(item.startTime, item.endTime);
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const startDate = new Date(item.startTime);
                  const endDate = new Date(item.endTime);

                  return (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      {/* STT */}
                      <td className="py-3 px-4 text-center text-gray-500 font-semibold text-xs">
                        {stt}
                      </td>

                      {/* Phim & Định dạng */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.movie?.posterUrl ? (
                            <img 
                              src={item.movie.posterUrl} 
                              alt={item.movie.title}
                              className="w-9 h-12 rounded-lg object-cover shadow-sm shrink-0 border border-gray-800" 
                            />
                          ) : (
                            <div className="w-9 h-12 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 text-gray-600">
                              <Film size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm hover:text-orange-400 transition-colors truncate max-w-[220px]" title={item.movie?.title}>
                              {item.movie?.title || 'Chưa đặt tên'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`font-extrabold text-[10px] px-1.5 py-0.5 rounded border ${
                                (item.format || '').toUpperCase().includes('IMAX')
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : (item.format || '').toUpperCase().includes('3D')
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              }`}>
                                {(item.format || '').toUpperCase().includes('IMAX') 
                                  ? 'IMAX Laser' 
                                  : (item.format || '').toUpperCase().includes('3D') 
                                  ? '3D Atmos' 
                                  : (item.format || '').toUpperCase().includes('ATMOS')
                                  ? '2D Atmos'
                                  : (item.format === '2D' ? '2D Digital' : (item.format || '2D Digital'))}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {item.language || 'Phụ đề'}
                              </span>
                              {item.movie?.duration && (
                                <span className="text-gray-500 text-xs">
                                  • {item.movie.duration}p
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cụm rạp & Phòng */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-200 flex items-center gap-1.5">
                            <MapPin size={13} className="text-orange-500 shrink-0" />
                            {item.room?.cinema?.name || 'Rạp chưa xác định'}
                          </span>
                          <span className="text-xs text-gray-400 pl-4 flex items-center gap-1">
                            <Monitor size={11} className="text-gray-500" />
                            {item.room?.name || 'Phòng chiếu'}
                          </span>
                        </div>
                      </td>

                      {/* Thời gian chiếu */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-orange-400 flex items-center gap-1 text-xs sm:text-sm">
                            <Clock size={13} className="shrink-0" />
                            {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {startDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="text-blue-400 hover:text-white hover:bg-blue-600/80 p-1.5 rounded-lg transition-colors" 
                            title="Sửa lịch chiếu"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteShowtime(item.id)} 
                            disabled={deletingId === item.id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              deletingId === item.id 
                                ? 'text-gray-500 cursor-not-allowed opacity-40' 
                                : 'text-red-400 hover:text-white hover:bg-red-600/80'
                            }`}
                            title="Xóa lịch chiếu"
                          >
                            <Trash2 size={16} className={deletingId === item.id ? 'animate-pulse' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Compact Pagination Footer */}
        {filteredShowtimes.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-gray-800/40 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>
                Hiển thị <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredShowtimes.length)}</strong> trên <strong className="text-orange-500">{filteredShowtimes.length}</strong> suất chiếu
              </span>
              <div className="flex items-center gap-1.5">
                <span>Số dòng:</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                title="Trang trước"
              >
                <ChevronLeft size={15} />
              </button>

              <div className="px-3 py-1 font-bold text-slate-700 dark:text-gray-200">
                Trang <span className="text-orange-500">{currentPage}</span> / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                title="Trang sau"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. POPUP THÊM / SỬA LỊCH CHIẾU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col relative max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a2333] shrink-0">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <CalendarDays className="text-orange-500" size={16} />
                </div>
                {editingShowtime ? 'Cập Nhật Lịch Chiếu' : 'Tạo Lịch Chiếu Mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="showtime-form" onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                
                {/* Chọn Phim */}
                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">Bộ Phim *</label>
                  <select 
                    required
                    value={formData.movieId}
                    onChange={e => {
                      const mId = e.target.value;
                      setFormData(prev => ({ ...prev, movieId: mId }));
                      if (formData.startTime && mId) {
                        const m = movies.find(x => x.id === mId);
                        if (m?.duration) {
                          const start = new Date(formData.startTime);
                          const end = new Date(start.getTime() + (m.duration + 20) * 60000);
                          setFormData(prev => ({
                            ...prev,
                            movieId: mId,
                            endTime: new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                          }));
                        }
                      }
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none transition-all"
                  >
                    <option value="">-- Chọn phim chiếu --</option>
                    {movies.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.duration ? `(${m.duration} phút)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chọn Rạp & Phòng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1.5">Cụm Rạp *</label>
                    <select 
                      required
                      value={formData.cinemaId}
                      onChange={e => {
                        const nextCinemaId = e.target.value;
                        const nextCin = cinemas.find(c => c.id === nextCinemaId);
                        const firstRoomId = nextCin?.rooms?.[0]?.id || '';
                        setFormData(prev => ({ ...prev, cinemaId: nextCinemaId, roomId: firstRoomId }));
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none transition-all"
                    >
                      <option value="">-- Chọn rạp chiếu --</option>
                      {cinemas.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <ManageableDropdown
                      label="Phòng Chiếu"
                      required
                      value={formData.roomId}
                      onChange={val => setFormData(prev => ({ ...prev, roomId: val }))}
                      placeholder="-- Chọn phòng chiếu --"
                      customItems={currentCinemaRooms}
                      defaultOptions={[]}
                      disabled={!formData.cinemaId}
                      onServerAdd={handleServerAddRoom}
                      onServerEdit={handleServerEditRoom}
                      onServerDelete={handleServerDeleteRoom}
                      serverSubtitle={`Phòng mới sẽ thuộc cụm rạp "${selectedCinemaInModal?.name || ''}" và tự động sinh 80 ghế (Standard, VIP, Sweetbox) chuẩn rạp.`}
                    />
                  </div>
                </div>

                {/* Định dạng & Ngôn ngữ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <ManageableDropdown
                      label="Định Dạng"
                      storageKey="showtime_formats"
                      value={formData.format}
                      onChange={val => setFormData(prev => ({ ...prev, format: val }))}
                      defaultOptions={[
                        { value: '2D Digital', label: '2D Digital', badge: 'Tiêu chuẩn', isDefault: true },
                        { value: '2D Atmos', label: '2D Atmos', badge: 'Âm thanh vòm', isDefault: true },
                        { value: '3D Atmos', label: '3D Atmos', badge: 'Kính 3D', isDefault: true },
                        { value: 'IMAX Laser', label: 'IMAX Laser', badge: 'Màn cực đại', isDefault: true },
                        { value: 'ScreenX', label: 'ScreenX', badge: 'Màn hình 270°' },
                        { value: '4DX', label: '4DX', badge: 'Ghế chuyển động' }
                      ]}
                    />
                  </div>
                  <div>
                    <ManageableDropdown
                      label="Phiên Bản"
                      storageKey="showtime_languages"
                      value={formData.language}
                      onChange={val => setFormData(prev => ({ ...prev, language: val }))}
                      defaultOptions={[
                        { value: 'Phụ đề', label: 'Phụ đề (SUB)', badge: 'Vietsub', isDefault: true },
                        { value: 'Lồng tiếng', label: 'Lồng tiếng (DUB)', badge: 'Vietdub', isDefault: true },
                        { value: 'Thuyết minh', label: 'Thuyết minh', badge: 'Voice-over' },
                        { value: 'Nguyên bản (Không Sub)', label: 'Nguyên bản (RAW)', badge: 'Original' }
                      ]}
                    />
                  </div>
                </div>

                {/* Thời gian chiếu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1.5">Bắt Đầu *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={formData.startTime}
                      onChange={e => handleStartTimeChange(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1.5">Kết Thúc *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={formData.endTime}
                      onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-[#1a2333] shrink-0 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-gray-300 hover:text-white font-bold transition-colors text-xs sm:text-sm rounded-xl hover:bg-white/5"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                form="showtime-form" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm transition-all hover:scale-105"
              >
                <CheckCircle size={16} /> Lưu Lịch Chiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
