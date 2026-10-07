import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Gift, X, Tag, Check } from 'lucide-react';
import { API_URL } from '../../config/api';
import ManageableDropdown from './ManageableDropdown';

interface Promotion {
  id: string;
  title: string;
  desc: string;
  category: string;
  badge?: string;
  code?: string;
  validUntil: string;
  terms: string;
  coverUrl?: string;
  status: string;
}

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('MEMBER');
  const [badge, setBadge] = useState('');
  const [code, setCode] = useState('');
  const [validUntil, setValidUntil] = useState('31/12/2026');
  const [terms, setTerms] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Vouchers state & quick modal
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherType, setNewVoucherType] = useState('FIXED_AMOUNT');
  const [newVoucherValue, setNewVoucherValue] = useState('');
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState('');
  const [newVoucherLimit, setNewVoucherLimit] = useState('1000');
  const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);

  const fetchPromotions = () => {
    fetch(`${API_URL}/api/promotions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPromotions(data);
      })
      .catch(err => console.error('Error fetching promotions:', err));
  };

  const fetchVouchers = () => {
    fetch(`${API_URL}/api/vouchers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVouchers(data);
      })
      .catch(err => console.error('Error fetching vouchers:', err));
  };

  useEffect(() => {
    fetchPromotions();
    fetchVouchers();
  }, []);

  const handleQuickCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newVoucherCode.trim().toUpperCase();
    if (!trimmed || !newVoucherValue) return;

    setIsCreatingVoucher(true);
    try {
      const payload = {
        code: trimmed,
        discountType: newVoucherType,
        discountValue: Number(newVoucherValue),
        minOrderValue: Number(newVoucherMinOrder || 0),
        usageLimit: Number(newVoucherLimit || 1000),
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      };
      const res = await fetch(`${API_URL}/api/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchVouchers();
        setCode(trimmed);
        setIsVoucherModalOpen(false);
        setNewVoucherCode('');
        setNewVoucherValue('');
        setNewVoucherMinOrder('');
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.message || 'Không thể tạo mã voucher'}`);
      }
    } catch (err: any) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setIsCreatingVoucher(false);
    }
  };

  const selectedVoucher = vouchers.find(v => v.code === code);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setCategory('MEMBER');
    setBadge('');
    setCode('');
    setValidUntil('31/12/2026');
    setTerms('');
    setCoverUrl('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc || !category || !validUntil || !terms) return;

    setLoading(true);
    const payload = {
      title,
      desc,
      category,
      badge: badge.trim() || undefined,
      code: code.trim().toUpperCase() || undefined,
      validUntil,
      terms,
      coverUrl: coverUrl.trim() || undefined,
      status: 'ACTIVE'
    };

    const url = editingId 
      ? `${API_URL}/api/promotions/${editingId}`
      : `${API_URL}/api/promotions`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetForm();
        fetchPromotions();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể lưu chương trình khuyến mãi');
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert('Lỗi kết nối máy chủ khi lưu khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingId(promo.id);
    setTitle(promo.title || '');
    setDesc(promo.desc || '');
    setCategory(promo.category || 'MEMBER');
    setBadge(promo.badge || '');
    setCode(promo.code || '');
    setValidUntil(promo.validUntil || '31/12/2026');
    setTerms(promo.terms || '');
    setCoverUrl(promo.coverUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chương trình ưu đãi này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPromotions();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể xóa khuyến mãi');
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      alert('Lỗi kết nối máy chủ khi xóa khuyến mãi');
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="text-orange-500 w-8 h-8" />
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Quản lý Khuyến Mãi & Ưu Đãi</h2>
          <p className="text-gray-400 text-sm mt-1">Thêm, sửa, xóa các banner chương trình khuyến mãi hiển thị trên hệ thống</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? 'Chỉnh sửa Khuyến Mãi' : 'Thêm Chương Trình Khuyến Mãi Mới'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={14} /> Hủy chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Tiêu đề Ưu đãi <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Ngày Hội Thành Viên - Happy Tuesday"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm font-bold transition-colors"
            />
          </div>
          <div>
            <ManageableDropdown
              label="Danh mục"
              required
              storageKey="promotion_categories"
              value={category}
              onChange={val => setCategory(val)}
              defaultOptions={[
                { value: 'MEMBER', label: 'Ưu Đãi Thành Viên', badge: 'MEMBER', isDefault: true },
                { value: 'PARTNER', label: 'Khuyến Mãi Đối Tác', badge: 'PARTNER', isDefault: true },
                { value: 'STUDENT', label: 'HSSV / Trẻ Em', badge: 'STUDENT', isDefault: true },
                { value: 'WEEKEND', label: 'Cuối Tuần Vui Vẻ', badge: 'WEEKEND' },
                { value: 'HOLIDAY', label: 'Lễ Hội & Tết', badge: 'SPECIAL' }
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Mô tả ngắn <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ví dụ: Đồng giá 55.000 VNĐ cho tất cả thành viên Aeon Member vào mỗi thứ 3..."
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Badge nhãn nổi bật</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="HOT, ƯU ĐÃI KHỦNG..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <label className="block text-gray-300 text-xs font-semibold">
                Mã Voucher (Code)
              </label>
              <button
                type="button"
                onClick={() => {
                  setNewVoucherCode('');
                  setNewVoucherValue('');
                  setNewVoucherMinOrder('');
                  setIsVoucherModalOpen(true);
                }}
                className="text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                title="Tạo mã Voucher mới trong hệ thống"
              >
                <Plus size={12} />
                <span>Thêm Voucher</span>
              </button>
            </div>

            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-500 text-xs font-mono transition-colors cursor-pointer"
            >
              <option value="">-- Không dùng mã (Banner thông tin) --</option>
              {vouchers.map(v => (
                <option key={v.id} value={v.code}>
                  🎟️ {v.code} - {v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}đ`} {v.minOrderValue > 0 ? `(Đơn ≥ ${Number(v.minOrderValue).toLocaleString('vi-VN')}đ)` : ''}
                </option>
              ))}
              {/* Nếu mã hiện tại chưa nằm trong danh sách vouchers, vẫn hiển thị để không mất dữ liệu */}
              {code && !vouchers.some(v => v.code === code) && (
                <option value={code}>
                  ⚠️ {code} (Mã tùy chỉnh / Chưa lưu trong kho Voucher)
                </option>
              )}
            </select>

            {/* Thông tin chi tiết voucher đang chọn */}
            {selectedVoucher ? (
              <div className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 flex items-center justify-between">
                <span>
                  ✓ {selectedVoucher.discountType === 'PERCENTAGE' ? `Giảm ${selectedVoucher.discountValue}%` : `Giảm ${Number(selectedVoucher.discountValue).toLocaleString('vi-VN')}đ`}
                  {selectedVoucher.minOrderValue > 0 && ` | Đơn tối thiểu: ${Number(selectedVoucher.minOrderValue).toLocaleString('vi-VN')}đ`}
                </span>
                <span className="font-mono text-[10px] text-emerald-300">
                  {selectedVoucher.status === 'ACTIVE' ? 'Đang kích hoạt' : selectedVoucher.status}
                </span>
              </div>
            ) : code ? (
              <div className="mt-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-400">
                ⚠️ Mã này chưa có trong kho Voucher. Bấm <strong>+ Thêm Voucher</strong> để tạo mã vào DB giúp khách áp dụng được khi thanh toán.
              </div>
            ) : null}
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Hạn sử dụng <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              placeholder="Ví dụ: 31/12/2026"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Link Ảnh Bìa (Cover URL)</label>
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Thể lệ chương trình (Terms & Conditions) <span className="text-red-500">*</span></label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={4}
            placeholder="Thể lệ chương trình:&#10;1. Áp dụng cho mọi thành viên...&#10;2. Không áp dụng cho suất chiếu đặc biệt..."
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-2 self-start mt-2"
        >
          {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
          {editingId ? 'Cập Nhật Ưu Đãi' : 'Thêm Mới Ưu Đãi'}
        </button>
      </form>

      {/* List */}
      <div className="grid md:grid-cols-2 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex flex-col sm:flex-row">
              {promo.coverUrl && (
                <div className="sm:w-44 h-36 sm:h-auto overflow-hidden shrink-0 relative">
                  <img src={promo.coverUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {promo.badge && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
                      {promo.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-100 dark:bg-gray-800 text-[10px] font-bold text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-gray-700 uppercase">
                    {promo.category}
                  </span>
                  <span className="text-slate-500 dark:text-gray-400 text-xs font-semibold">Hạn: {promo.validUntil}</span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base mb-1 group-hover:text-orange-500 transition-colors">{promo.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 text-xs line-clamp-2 mb-3">{promo.desc}</p>
                {promo.code && (
                  <span className="bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono font-bold text-xs px-2.5 py-1 rounded-lg inline-block">
                    MÃ: {promo.code}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80">
              <button onClick={() => handleEdit(promo)} className="flex-1 bg-white hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-white border border-slate-200 dark:border-gray-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                <Edit3 size={15} /> Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(promo.id)} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-transparent font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-1">
                <Trash2 size={15} /> Xóa
              </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            Chưa có chương trình ưu đãi nào trong cơ sở dữ liệu.
          </div>
        )}
      </div>

      {/* POPUP TẠO MÃ VOUCHER MỚI VÀO DB */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#111827] border border-orange-500/30 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Tag size={16} className="text-orange-500" />
                Tạo Mã Voucher Mới Vào DB
              </h3>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickCreateVoucher} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Mã Voucher (Code) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ví dụ: AEON50K, VNPAY20..."
                  value={newVoucherCode}
                  onChange={e => setNewVoucherCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Loại Giảm</label>
                  <select
                    value={newVoucherType}
                    onChange={e => setNewVoucherType(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="FIXED_AMOUNT">Số tiền (VNĐ)</option>
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Mức giảm <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={newVoucherType === 'PERCENTAGE' ? 'ví dụ: 20 (%)' : 'ví dụ: 30000 (đ)'}
                    value={newVoucherValue}
                    onChange={e => setNewVoucherValue(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Đơn tối thiểu</label>
                  <input
                    type="number"
                    placeholder="ví dụ: 100000"
                    value={newVoucherMinOrder}
                    onChange={e => setNewVoucherMinOrder(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Số lượt dùng</label>
                  <input
                    type="number"
                    value={newVoucherLimit}
                    onChange={e => setNewVoucherLimit(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-400 bg-gray-800/60 p-2 rounded-lg">
                Mã voucher này sẽ được lưu vào bảng <strong>Voucher</strong> trong database và có thể dùng trực tiếp khi khách hàng đặt vé.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingVoucher || !newVoucherCode.trim() || !newVoucherValue}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Check size={14} />
                  <span>{isCreatingVoucher ? 'Đang tạo...' : 'Tạo & Chọn Mã'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
