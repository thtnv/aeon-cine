import { useState, useEffect } from 'react';
import { Tags, X, Plus, Edit2, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function GenreManager() {
  const [genres, setGenres] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingGenre, setEditingGenre] = useState<any>(null);
  const [editName, setEditName] = useState('');

  const fetchGenres = () => {
    fetch(`${API_URL}/api/genres`)
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleSaveGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      const url = editingGenre
        ? `${API_URL}/api/genres/${editingGenre.id}`
        : `${API_URL}/api/genres`;
      const method = editingGenre ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingGenre(null);
        setEditName('');
        fetchGenres();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Lỗi khi lưu thể loại (có thể tên thể loại đã tồn tại)');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ khi lưu thể loại');
    }
  };

  const handleDeleteGenre = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/genres/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchGenres();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Lỗi khi xóa thể loại');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ khi xóa thể loại');
    }
  };

  const openEditModal = (genre: any) => {
    setEditingGenre(genre);
    setEditName(genre.name);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-8 bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-3xl font-black">Danh sách Thể loại</h1>
          <p className="text-gray-400 mt-1">Quản lý các thể loại phim trong hệ thống</p>
        </div>
        <button onClick={() => { setEditingGenre(null); setEditName(''); setIsModalOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center gap-2">
          <Plus size={20} /> Thêm Thể Loại
        </button>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-gray-800 overflow-hidden shadow-xl p-6">
        <div className="flex flex-wrap gap-4">
          {genres.length === 0 && <p className="text-gray-500">Chưa có thể loại nào.</p>}
          {genres.map((g) => (
            <div key={g.id} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-full flex items-center gap-3 font-bold text-gray-300 group">
              <Tags size={16} className="text-orange-500" />
              <span className="cursor-pointer" onClick={() => openEditModal(g)}>{g.name}</span>
              <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(g)} className="text-blue-400 hover:text-blue-300 mr-2">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDeleteGenre(g.id)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP SỬA/THÊM THỂ LOẠI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col relative">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a2333] rounded-t-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Edit2 className="text-orange-500" size={16} />
                </div>
                {editingGenre ? 'Sửa Thể loại' : 'Thêm Thể Loại'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form id="edit-genre-form" onSubmit={handleSaveGenre} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tên Thể loại</label>
                  <input
                    required
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-all font-bold"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-800 bg-[#1a2333] rounded-b-2xl flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-300 hover:text-white font-bold transition-colors">Hủy</button>
              <button type="submit" form="edit-genre-form" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2">
                <CheckCircle size={18} /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
