import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, MapPin, Phone, Navigation, Film, X, ExternalLink, Monitor } from 'lucide-react';
import { API_URL } from '../../config/api';
import ManageableDropdown from './ManageableDropdown';

interface Cinema {
  id: string;
  name: string;
  location: string;
  address?: string;
  city: string;
  phone?: string;
  mapUrl?: string;
  directionsUrl?: string;
  amenities?: string[];
  rooms?: { id: string; name: string }[];
}

const COMMON_AMENITIES = [
  'Phòng chiếu Laser 4K',
  'Phòng chiếu IMAX 4K',
  'Âm thanh Dolby Atmos',
  'Ghế Đôi Sweetbox',
  'Ghế Sofa VIP',
  'Căn tin Bắp Nước',
  'Bãi đỗ xe thông minh',
  'Bãi đỗ xe ô tô',
  'Thanh toán VNPay QR',
  'Khu vui chơi trẻ em',
  'Combo Bắp nước độc quyền'
];

export default function CinemaManager() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('TP.HCM');
  const [phone, setPhone] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [directionsUrl, setDirectionsUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roomModalCinema, setRoomModalCinema] = useState<Cinema | null>(null);
  const [selectedRoomInModal, setSelectedRoomInModal] = useState('');

  const fetchCinemas = () => {
    fetch(`${API_URL}/api/cinemas?_t=${Date.now()}`, {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCinemas(data);
          // Đồng bộ lại phòng chiếu của modal đang mở
          setRoomModalCinema(prev => {
            if (!prev) return null;
            const updated = data.find(c => c.id === prev.id);
            return updated || prev;
          });
        }
      })
      .catch(err => console.error('Error fetching cinemas:', err));
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleAddAmenity = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed]);
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter(a => a !== item));
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setCity('TP.HCM');
    setPhone('');
    setMapUrl('');
    setDirectionsUrl('');
    setAmenities([]);
    setAmenityInput('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !city) return;

    setLoading(true);
    const payload = {
      name,
      location,
      address: location,
      city,
      phone: phone.trim() || undefined,
      mapUrl: mapUrl.trim() || undefined,
      directionsUrl: directionsUrl.trim() || undefined,
      amenities
    };

    const url = editingId 
      ? `${API_URL}/api/cinemas/${editingId}`
      : `${API_URL}/api/cinemas`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetForm();
        fetchCinemas();
      }
    } catch (err) {
      console.error('Error saving cinema:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cinema: Cinema) => {
    setEditingId(cinema.id);
    setName(cinema.name || '');
    setLocation(cinema.address || cinema.location || '');
    setCity(cinema.city || 'TP.HCM');
    setPhone(cinema.phone || '');
    setMapUrl(cinema.mapUrl || '');
    setDirectionsUrl(cinema.directionsUrl || '');
    setAmenities(Array.isArray(cinema.amenities) ? [...cinema.amenities] : []);
    setAmenityInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa rạp này? Sẽ xóa tất cả các phòng chiếu và ghế liên quan!')) return;
    try {
      const res = await fetch(`${API_URL}/api/cinemas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCinemas();
    } catch (err) {
      console.error('Error deleting cinema:', err);
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="text-orange-500 w-8 h-8" />
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Quản lý Cụm Rạp</h2>
          <p className="text-gray-400 text-sm mt-1">Quản lý hệ thống cụm rạp, hotline, định vị Google Maps và tiện ích</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? 'Chỉnh sửa Cụm Rạp' : 'Thêm Cụm Rạp Mới'}
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
            <label className="block text-gray-300 text-xs font-semibold mb-2">Tên Rạp <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Aeon Cine Tân Phú"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm font-bold transition-colors"
            />
          </div>
          <div>
            <ManageableDropdown
              label="Tỉnh / Thành phố"
              required
              storageKey="cinema_cities"
              value={city}
              onChange={val => setCity(val)}
              placeholder="-- Chọn hoặc thêm Tỉnh/Thành --"
              defaultOptions={[
                { value: 'TP.HCM', label: 'Hồ Chí Minh', badge: 'Miền Nam', isDefault: true },
                { value: 'Hà Nội', label: 'Hà Nội', badge: 'Miền Bắc', isDefault: true },
                { value: 'Đà Nẵng', label: 'Đà Nẵng', badge: 'Miền Trung', isDefault: true },
                { value: 'Huế', label: 'Thừa Thiên Huế', badge: 'Miền Trung', isDefault: true },
                { value: 'Cần Thơ', label: 'Cần Thơ', badge: 'Tây Nam Bộ', isDefault: true },
                { value: 'Hải Phòng', label: 'Hải Phòng', badge: 'Miền Bắc', isDefault: true },
                { value: 'Đồng Nai', label: 'Đồng Nai', badge: 'Đông Nam Bộ', isDefault: true },
                { value: 'Bình Dương', label: 'Bình Dương', badge: 'Đông Nam Bộ', isDefault: true }
              ]}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tầng 3, AEON MALL..., Số 1 Đường..., P...., Q...."
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Số điện thoại / Hotline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 028 3849 4567"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Link Nhúng Bản Đồ (Google Maps Embed URL)</label>
            <input
              type="text"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">Dùng để nhúng bản đồ tương tác hiển thị trên trang cụm rạp</p>
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Link Chỉ Đường (Google Maps Directions URL)</label>
            <input
              type="text"
              value={directionsUrl}
              onChange={(e) => setDirectionsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=Aeon+Cine+..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">Dùng cho nút "Dẫn Đường Đến Rạp" mở ứng dụng bản đồ</p>
          </div>
        </div>

        {/* Amenities section */}
        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Film size={14} className="text-orange-500" /> Tiện ích rạp chiếu (Amenities)
          </label>
          
          {/* Selected amenities */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-2 bg-gray-900/60 rounded-xl border border-gray-800">
            {amenities.map((item, idx) => (
              <span
                key={idx}
                className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5"
              >
                ✓ {item}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(item)}
                  className="hover:text-red-400 ml-1 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {amenities.length === 0 && (
              <span className="text-gray-500 text-xs py-1 px-2 italic">Chưa chọn tiện ích nào</span>
            )}
          </div>

          {/* Custom amenity input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAmenity(amenityInput);
                }
              }}
              placeholder="Nhập tiện ích khác và nhấn Thêm (hoặc Enter)..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
            />
            <button
              type="button"
              onClick={() => handleAddAmenity(amenityInput)}
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Thêm tiện ích
            </button>
          </div>

          {/* Preset common amenities */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-gray-500 py-1 mr-1">Gợi ý nhanh:</span>
            {COMMON_AMENITIES.map((cAmenity, idx) => {
              const isSelected = amenities.includes(cAmenity);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => isSelected ? handleRemoveAmenity(cAmenity) : handleAddAmenity(cAmenity)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold'
                      : 'bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {cAmenity}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-2 self-start mt-2"
        >
          {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
          {editingId ? 'Cập Nhật Cụm Rạp' : 'Thêm Mới Cụm Rạp'}
        </button>
      </form>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cinemas.map(cinema => (
          <div key={cinema.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl group hover:border-gray-600 transition-colors">
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-white text-lg group-hover:text-orange-500 transition-colors">{cinema.name}</h3>
                <span className="bg-gray-800 text-xs font-bold text-orange-400 px-3 py-1 rounded-full border border-gray-700 shrink-0">{cinema.city}</span>
              </div>

              <p className="text-gray-400 text-xs flex items-start gap-2 leading-relaxed">
                <MapPin size={14} className="text-gray-500 shrink-0 mt-0.5" />
                {cinema.address || cinema.location}
              </p>

              {cinema.phone && (
                <p className="text-gray-400 text-xs flex items-center gap-2 font-medium">
                  <Phone size={14} className="text-orange-500 shrink-0" />
                  Hotline: <span className="text-white font-semibold">{cinema.phone}</span>
                </p>
              )}

              {/* Amenities tags */}
              {Array.isArray(cinema.amenities) && cinema.amenities.length > 0 && (
                <div className="pt-2 border-t border-gray-800/60">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Film size={12} className="text-orange-500" /> Tiện ích ({cinema.amenities.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cinema.amenities.map((a, i) => (
                      <span key={i} className="bg-gray-800/80 border border-gray-700/60 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms of this cinema */}
              <div className="pt-2 border-t border-gray-800/60">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Monitor size={12} className="text-orange-500" /> Phòng Chiếu ({cinema.rooms?.length || 0}):
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomModalCinema(cinema);
                      setSelectedRoomInModal(cinema.rooms?.[0]?.id || '');
                    }}
                    className="text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                  >
                    <Plus size={11} /> Quản lý phòng
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(cinema.rooms) && cinema.rooms.length > 0 ? (
                    cinema.rooms.map(r => (
                      <span key={r.id} className="bg-gray-800/90 border border-gray-700/80 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {r.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-500 italic">Chưa có phòng chiếu nào</span>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-2 pt-1 text-[11px]">
                {cinema.directionsUrl && (
                  <a
                    href={cinema.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-400 hover:text-orange-300 flex items-center gap-1 underline underline-offset-2"
                  >
                    <Navigation size={12} /> Chỉ đường <ExternalLink size={10} />
                  </a>
                )}
                {cinema.mapUrl && (
                  <a
                    href={cinema.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline underline-offset-2 ml-2"
                  >
                    <MapPin size={12} /> Link nhúng map <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-gray-800 mt-4">
              <button onClick={() => handleEdit(cinema)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors">
                <Edit3 size={15} /> Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(cinema.id)} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-1">
                <Trash2 size={15} /> Xóa
              </button>
            </div>
          </div>
        ))}
        {cinemas.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            Chưa có rạp chiếu nào trong hệ thống.
          </div>
        )}
      </div>

      {/* MODAL QUẢN LÝ PHÒNG CHIẾU CỦA RẠP */}
      {roomModalCinema && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Monitor size={18} className="text-orange-500" />
                Phòng Chiếu - {roomModalCinema.name}
              </h3>
              <button
                onClick={() => setRoomModalCinema(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Bạn có thể thêm phòng chiếu mới, sửa tên phòng hoặc xóa phòng trực tiếp vào cơ sở dữ liệu.
            </p>

            <ManageableDropdown
              label="Phòng Chiếu Cụm Rạp"
              placeholder="-- Danh sách phòng chiếu --"
              value={selectedRoomInModal}
              onChange={val => setSelectedRoomInModal(val)}
              customItems={(roomModalCinema.rooms || []).map(r => ({
                value: r.id,
                label: r.name,
                badge: '80 ghế'
              }))}
              defaultOptions={[]}
              onServerAdd={async (name) => {
                const res = await fetch(`${API_URL}/api/cinemas/${roomModalCinema.id}/rooms`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name })
                });
                if (res.ok) {
                  fetchCinemas();
                  const newR = await res.json();
                  setRoomModalCinema(prev => prev ? ({
                    ...prev,
                    rooms: [...(prev.rooms || []), newR]
                  }) : null);
                  return true;
                }
                const err = await res.json();
                alert(err.error || 'Lỗi khi tạo phòng');
                return false;
              }}
              onServerEdit={async (id, newName) => {
                const res = await fetch(`${API_URL}/api/cinemas/rooms/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newName })
                });
                if (res.ok) {
                  fetchCinemas();
                  setRoomModalCinema(prev => prev ? ({
                    ...prev,
                    rooms: (prev.rooms || []).map(r => r.id === id ? { ...r, name: newName } : r)
                  }) : null);
                  return true;
                }
                const err = await res.json();
                alert(err.error || 'Lỗi khi sửa phòng');
                return false;
              }}
              onServerDelete={async (id) => {
                const res = await fetch(`${API_URL}/api/cinemas/rooms/${id}`, {
                  method: 'DELETE'
                });
                if (res.ok) {
                  fetchCinemas();
                  setRoomModalCinema(prev => prev ? ({
                    ...prev,
                    rooms: (prev.rooms || []).filter(r => r.id !== id)
                  }) : null);
                  return true;
                }
                const err = await res.json();
                if (err.showtimeCount) {
                  const confirmCascade = window.confirm(
                    `Phòng chiếu này đang có ${err.showtimeCount} suất chiếu liên kết.\n\nBạn có chắc chắn muốn XÓA TẤT CẢ các suất chiếu này và xóa phòng chiếu ngay lập tức không?`
                  );
                  if (confirmCascade) {
                    const cascadeRes = await fetch(`${API_URL}/api/cinemas/rooms/${id}?force=true`, {
                      method: 'DELETE'
                    });
                    if (cascadeRes.ok) {
                      fetchCinemas();
                      setRoomModalCinema(prev => prev ? ({
                        ...prev,
                        rooms: (prev.rooms || []).filter(r => r.id !== id)
                      }) : null);
                      alert('Đã xóa phòng chiếu và toàn bộ suất chiếu liên kết thành công!');
                      return true;
                    }
                  }
                  return false;
                }
                alert(err.error || 'Không thể xóa phòng chiếu này');
                return false;
              }}
              serverSubtitle="Phòng mới sẽ tự động sinh 80 ghế (Standard, VIP, Sweetbox) chuẩn rạp."
            />

            <div className="pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setRoomModalCinema(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

