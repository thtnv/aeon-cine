import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, X, CheckCircle, Clapperboard, Users } from 'lucide-react';
import { API_URL } from '../../config/api';

const DEFAULT_DIRECTORS = [
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
  { value: 'Zach Cregger', label: 'Zach Cregger', badge: 'Mỹ' },
  { value: 'Kirk DeMicco', label: 'Kirk DeMicco', badge: 'Mỹ' },
  { value: 'Januel Mercado, Joel Crawford', label: 'Januel Mercado, Joel Crawford', badge: 'Mỹ' }
];

export default function ActorManager() {
  const [activeSubTab, setActiveSubTab] = useState<'actors' | 'directors'>('actors');

  // State Diễn viên
  const [actors, setActors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<any>(null);
  const [editName, setEditName] = useState('');

  // State Đạo diễn (Đồng bộ với localStorage cine_dd_movie_directors)
  const [directors, setDirectors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cine_dd_movie_directors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_DIRECTORS;
  });
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [editingDirectorIndex, setEditingDirectorIndex] = useState<number | null>(null);
  const [directorName, setDirectorName] = useState('');
  const [directorBadge, setDirectorBadge] = useState('');

  const fetchActors = () => {
    fetch(`${API_URL}/api/actors`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActors(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const saveDirectors = (newDirectors: any[]) => {
    setDirectors(newDirectors);
    try {
      localStorage.setItem('cine_dd_movie_directors', JSON.stringify(newDirectors));
    } catch (e) {}
  };

  // --- THAO TÁC DIỄN VIÊN (ACTORS) ---
  const handleSaveActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      const url = editingActor 
        ? `${API_URL}/api/actors/${editingActor.id}` 
        : `${API_URL}/api/actors`;
      const method = editingActor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingActor(null);
        setEditName('');
        fetchActors();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Lỗi khi lưu diễn viên (có thể tên diễn viên đã tồn tại)');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ khi lưu diễn viên');
    }
  };

  const handleDeleteActor = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/actors/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchActors();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Lỗi khi xóa diễn viên');
      }
    } catch (error) {
      alert('Lỗi khi xóa diễn viên');
    }
  };

  const openEditModal = (actor: any) => {
    setEditingActor(actor);
    setEditName(actor.name);
    setIsModalOpen(true);
  };

  // --- THAO TÁC ĐẠO DIỄN (DIRECTORS) ---
  const handleSaveDirector = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = directorName.trim();
    if (!trimmed) return;

    if (editingDirectorIndex !== null) {
      // Sửa
      const updated = [...directors];
      updated[editingDirectorIndex] = {
        ...updated[editingDirectorIndex],
        value: trimmed,
        label: trimmed,
        badge: directorBadge.trim() || undefined
      };
      saveDirectors(updated);
    } else {
      // Thêm mới (Kiểm tra trùng)
      const exists = directors.some(d => d.value.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        alert(`Đạo diễn "${trimmed}" đã có trong danh sách!`);
        return;
      }
      const newD = {
        value: trimmed,
        label: trimmed,
        badge: directorBadge.trim() || undefined
      };
      saveDirectors([...directors, newD]);
    }

    setIsDirectorModalOpen(false);
    setEditingDirectorIndex(null);
    setDirectorName('');
    setDirectorBadge('');
  };

  const handleDeleteDirector = (index: number) => {
    const target = directors[index];
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đạo diễn "${target.label}"?`)) return;
    const updated = directors.filter((_, i) => i !== index);
    saveDirectors(updated);
  };

  const openEditDirectorModal = (d: any, index: number) => {
    setEditingDirectorIndex(index);
    setDirectorName(d.label || d.value);
    setDirectorBadge(d.badge || '');
    setIsDirectorModalOpen(true);
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {/* Header chính */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
            <Users className="text-orange-500" /> Quản Lý Diễn Viên & Đạo Diễn
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Quản trị cơ sở dữ liệu nghệ sĩ điện ảnh, phục vụ gắn thẻ ekip và bộ lọc phim
          </p>
        </div>

        {/* Nút thêm mới theo Tab */}
        {activeSubTab === 'actors' ? (
          <button 
            type="button"
            onClick={() => { setEditingActor(null); setEditName(''); setIsModalOpen(true); }} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-orange-500/30 flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider shrink-0"
          >
            <Plus size={16} /> Thêm Diễn Viên
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => { setEditingDirectorIndex(null); setDirectorName(''); setDirectorBadge(''); setIsDirectorModalOpen(true); }} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider shrink-0"
          >
            <Plus size={16} /> Thêm Đạo Diễn
          </button>
        )}
      </div>

      {/* Tab Switcher: Diễn Viên vs Đạo Diễn */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('actors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'actors'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800/60 text-slate-600 dark:text-gray-300 hover:text-orange-500 border border-slate-200 dark:border-gray-700'
          }`}
        >
          <Users size={15} />
          <span>Danh Sách Diễn Viên ({actors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('directors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'directors'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800/60 text-slate-600 dark:text-gray-300 hover:text-emerald-500 border border-slate-200 dark:border-gray-700'
          }`}
        >
          <Clapperboard size={15} />
          <span>Danh Sách Đạo Diễn ({directors.length})</span>
        </button>
      </div>

      {/* --- TAB 1: DANH SÁCH DIỄN VIÊN --- */}
      {activeSubTab === 'actors' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actors.length === 0 && (
            <p className="text-slate-400 dark:text-gray-500 col-span-full py-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-gray-800">
              Chưa có diễn viên nào trong cơ sở dữ liệu.
            </p>
          )}
          {actors.map((a) => (
            <div 
              key={a.id} 
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 p-4 rounded-2xl text-center group relative cursor-pointer hover:border-orange-500/50 shadow-xs transition-all" 
              onClick={() => openEditModal(a)}
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openEditModal(a); }}
                  className="bg-blue-500 text-white p-1 rounded-lg shadow-xs hover:scale-105"
                  title="Sửa"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteActor(a.id); }}
                  className="bg-red-500 text-white p-1 rounded-lg shadow-xs hover:scale-105"
                  title="Xóa"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-gray-800 mb-2.5 overflow-hidden border-2 border-slate-200 dark:border-gray-700 group-hover:border-orange-500 transition-colors shadow-xs">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random`} alt={a.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors truncate">
                {a.name}
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-0.5">Diễn viên</span>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 2: DANH SÁCH ĐẠO DIỄN --- */}
      {activeSubTab === 'directors' && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-gray-400">
            <span>Danh sách đạo diễn hiển thị tự động trên gợi ý khi Thêm / Sửa Phim</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Khôi phục danh sách đạo diễn về mặc định chuẩn?')) {
                  saveDirectors(DEFAULT_DIRECTORS);
                }
              }}
              className="text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
            >
              Khôi phục mặc định
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {directors.map((d, idx) => (
              <div 
                key={`${d.value}-${idx}`} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 p-4 rounded-2xl text-center group relative cursor-pointer hover:border-emerald-500/50 shadow-xs transition-all" 
                onClick={() => openEditDirectorModal(d, idx)}
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEditDirectorModal(d, idx); }}
                    className="bg-blue-500 text-white p-1 rounded-lg shadow-xs hover:scale-105"
                    title="Sửa tên đạo diễn"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteDirector(idx); }}
                    className="bg-red-500 text-white p-1 rounded-lg shadow-xs hover:scale-105"
                    title="Xóa đạo diễn"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-2.5 overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clapperboard size={24} />
                </div>
                <h3 className="font-bold text-xs text-slate-800 dark:text-gray-200 group-hover:text-emerald-500 transition-colors truncate">
                  {d.label || d.value}
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                  {d.badge || 'Đạo diễn'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP THÊM / SỬA DIỄN VIÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col relative animate-[fadeIn_0.15s_ease-out]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a2333] rounded-t-2xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Edit2 className="text-orange-500" size={14} />
                </div>
                {editingActor ? 'Sửa Diễn Viên' : 'Thêm Diễn Viên Mới'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveActor} className="p-5 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden border-2 border-orange-500 shadow-md">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editName || 'Actor')}&background=random`} alt={editName} className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Diễn Viên <span className="text-orange-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  placeholder="Ví dụ: Ninh Dương Lan Ngọc, Ryan Reynolds..."
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none transition-all font-bold text-sm text-center" 
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold transition-colors">
                  Hủy
                </button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs cursor-pointer">
                  <CheckCircle size={15} /> Lưu Diễn Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP THÊM / SỬA ĐẠO DIỄN */}
      {isDirectorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col relative animate-[fadeIn_0.15s_ease-out]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a2333] rounded-t-2xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Clapperboard className="text-emerald-500" size={14} />
                </div>
                {editingDirectorIndex !== null ? 'Sửa Đạo Diễn' : 'Thêm Đạo Diễn Mới'}
              </h2>
              <button type="button" onClick={() => setIsDirectorModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveDirector} className="p-5 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden border-2 border-emerald-500 shadow-md flex items-center justify-center text-emerald-400">
                  <Clapperboard size={36} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Đạo Diễn <span className="text-emerald-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  placeholder="Ví dụ: Januel Mercado, Joel Crawford..."
                  value={directorName}
                  onChange={e => setDirectorName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none transition-all font-bold text-sm text-center" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Quốc Gia / Ghi Chú (Tùy chọn)</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Việt Nam, Hollywood, Hàn Quốc, Hoạt Hình..."
                  value={directorBadge}
                  onChange={e => setDirectorBadge(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none text-center" 
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsDirectorModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold transition-colors">
                  Hủy
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs cursor-pointer">
                  <CheckCircle size={15} /> Lưu Đạo Diễn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
