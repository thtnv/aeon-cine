import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface FoodCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  status: string;
}

export default function FoodManager() {
  const [foods, setFoods] = useState<FoodCombo[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchFoods = () => {
    fetch(`${API_URL}/api/food`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFoods(data);
      });
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const payload = {
      name,
      description,
      price: Number(price),
      imageUrl
    };

    const url = editingId 
      ? `${API_URL}/api/food/${editingId}`
      : `${API_URL}/api/food`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setEditingId(null);
        fetchFoods();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể lưu combo bắp nước');
      }
    } catch (err) {
      console.error('Error saving food combo:', err);
      alert('Lỗi kết nối máy chủ khi lưu combo bắp nước');
    }
  };

  const handleEdit = (food: FoodCombo) => {
    setEditingId(food.id);
    setName(food.name);
    setDescription(food.description || '');
    setPrice(String(food.price));
    setImageUrl(food.imageUrl || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa món bắp nước này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/food/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFoods();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể xóa món bắp nước');
      }
    } catch (err) {
      console.error('Error deleting food:', err);
      alert('Lỗi kết nối máy chủ khi xóa món bắp nước');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">QUẢN LÝ BẮP NƯỚC & COMBO</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1a1d24] border border-gray-800 p-6 rounded-xl mb-8 flex flex-col gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Tên Combo / Món</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Combo 1 Big..."
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Giá bán (VNĐ)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="89000"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-bold mb-1">Mô tả chi tiết</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="1 Bắp Ngọt Nóng + 1 Nước Lớn..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-bold mb-1">Đường dẫn Hình ảnh (URL)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 self-start mt-2">
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> {editingId ? 'Cập Nhật Combo' : 'Thêm Mới Combo'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center gap-2 border border-gray-700"
            >
              <X size={18} /> Hủy Bỏ
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {foods.map(food => (
          <div key={food.id} className="bg-[#1a1d24] border border-gray-800 rounded-xl p-4 flex gap-4 items-center">
            <img src={food.imageUrl || 'https://via.placeholder.com/150'} alt={food.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-white">{food.name}</h3>
              <p className="text-gray-400 text-xs mb-1 line-clamp-2">{food.description}</p>
              <p className="text-orange-500 font-bold text-sm">{food.price.toLocaleString()} đ</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(food)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(food.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
