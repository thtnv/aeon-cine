import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, X, Check } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Voucher {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: string;
}

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchVouchers = () => {
    fetch(`${API_URL}/api/vouchers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVouchers(data);
      })
      .catch(err => console.error('Error fetching vouchers:', err));
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleEdit = (v: Voucher) => {
    setEditingId(v.id);
    setCode(v.code);
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setMinOrderValue(String(v.minOrderValue));
    setUsageLimit(String(v.usageLimit));
    setStatus(v.status || 'ACTIVE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('FIXED_AMOUNT');
    setDiscountValue('');
    setMinOrderValue('');
    setUsageLimit('');
    setStatus('ACTIVE');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã voucher này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/vouchers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVouchers();
      } else {
        alert('Không thể xóa mã voucher');
      }
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    const payload = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      usageLimit: Number(usageLimit || 500),
      status
    };

    const url = editingId 
      ? `${API_URL}/api/vouchers/${editingId}`
      : `${API_URL}/api/vouchers`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        handleCancelEdit();
        fetchVouchers();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.message || 'Không thể lưu voucher'}`);
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">QUẢN LÝ MÃ GIẢM GIÁ (VOUCHER)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tạo, cập nhật và quản lý các mã khuyến mãi trong hệ thống</p>
        </div>
      </div>

      {/* Form Thêm / Sửa Voucher */}
      <form onSubmit={handleSubmit} className="bg-[#1a1d24] border border-gray-800 p-6 rounded-2xl mb-8 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <Tag size={16} /> {editingId ? 'Cập Nhật Mã Voucher' : 'Tạo Mới Mã Voucher'}
          </h3>
          {editingId && (
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-semibold border border-orange-500/30">
              Đang chỉnh sửa: {code}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Mã Voucher (Code) *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AEON20K..."
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white uppercase focus:outline-none focus:border-orange-500 text-sm font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Loại Giảm Giá *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 text-sm font-semibold cursor-pointer"
            >
              <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
              <option value="PERCENTAGE">Phần trăm (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Giá trị giảm *</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'PERCENTAGE' ? '10 (tức 10%)' : '20000 (tức 20.000đ)'}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              placeholder="100000"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Giới hạn số lượt dùng</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="1000"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1">Trạng Thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 text-sm font-semibold cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE (Hoạt động)</option>
              <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 self-start mt-2">
          <button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 hover:scale-105 text-sm"
          >
            {editingId ? <Check size={18} /> : <Plus size={18} />} 
            {editingId ? 'Cập Nhật Voucher' : 'Tạo Mã Voucher'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 border border-gray-700 text-sm"
            >
              <X size={18} /> Hủy Bỏ
            </button>
          )}
        </div>
      </form>

      {/* Danh Sách Vouchers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map(v => (
          <div key={v.id} className="bg-[#1a1d24] border border-gray-800 rounded-2xl p-5 relative overflow-hidden shadow-xl hover:border-gray-700 transition-all flex flex-col justify-between group">
            {/* Header Card với Action Buttons */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center font-bold border border-orange-500/30 shrink-0">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg font-mono tracking-wider">{v.code}</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-700 font-bold inline-block mt-0.5">
                    {v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString()} đ`}
                  </span>
                </div>
              </div>

              {/* Nút Sửa & Xóa */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(v)}
                  className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/80 rounded-xl transition-colors"
                  title="Sửa voucher"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-600/80 rounded-xl transition-colors"
                  title="Xóa voucher"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {/* Chi tiết điều kiện */}
            <div className="text-xs text-gray-400 space-y-1.5 border-t border-gray-800 pt-3 mt-1">
              <p className="flex justify-between">
                <span>Đơn tối thiểu:</span>
                <strong className="text-white">{v.minOrderValue.toLocaleString()} đ</strong>
              </p>
              <p className="flex justify-between">
                <span>Lượt sử dụng:</span>
                <strong className="text-orange-400">{v.usedCount} / {v.usageLimit}</strong>
              </p>
              <p className="flex justify-between">
                <span>Trạng thái:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  v.status === 'ACTIVE' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {v.status}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {vouchers.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-[#1a1d24] rounded-2xl border border-gray-800">
          <Tag size={36} className="mx-auto text-gray-600 mb-2" />
          <p>Chưa có mã voucher nào trong hệ thống.</p>
        </div>
      )}
    </div>
  );
}
