import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Film, Info, ExternalLink, Navigation, Phone, Loader2, Sparkles as SparkleIcon } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Cinema {
  id: string;
  name: string;
  address: string;
  location?: string;
  phone?: string;
  mapUrl?: string;
  directionsUrl?: string;
  amenities: string[];
}

interface PriceItem {
  id: string;
  seatType: string;
  format: string;
  isWeekend: boolean;
  price: number;
}

export default function Cinemas() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinemaIndex, setSelectedCinemaIndex] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch(`${API_URL}/api/cinemas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            address: c.address || c.location || '',
            location: c.location || c.address || '',
            phone: c.phone || '028 6269 2200',
            mapUrl: c.mapUrl || '',
            directionsUrl: c.directionsUrl || `https://maps.google.com/?q=${encodeURIComponent(c.name + ' ' + (c.address || c.location || ''))}`,
            amenities: Array.isArray(c.amenities) && c.amenities.length > 0
              ? c.amenities
              : ['Phòng chiếu Laser 4K', 'Âm thanh Dolby Atmos', 'Ghế Đôi Sweetbox', 'Bãi đỗ xe thông minh']
          }));
          setCinemas(formatted);
        }
      })
      .catch(err => console.error('Error loading cinemas:', err))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/api/prices`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPrices(data);
        }
      })
      .catch(err => console.error('Error fetching prices:', err));
  }, []);

  useEffect(() => {
    const cinemaId = searchParams.get('id');
    const section = searchParams.get('section');

    if (cinemas.length > 0 && cinemaId) {
      const idx = cinemas.findIndex(c => c.id === cinemaId);
      if (idx !== -1) {
        setSelectedCinemaIndex(idx);
      }
    }

    if (section === 'prices') {
      setTimeout(() => {
        const el = document.getElementById('bang-gia-ve');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [cinemas, searchParams]);

  const activeCinema = cinemas[selectedCinemaIndex] || cinemas[0];

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-32 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-white/60 text-sm font-medium tracking-wide">Đang kết nối hệ thống cụm rạp Aeon Cine...</p>
      </div>
    );
  }

  if (!activeCinema) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-32 text-center">
        <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">Chưa có thông tin cụm rạp</h2>
        <p className="text-white/50 text-sm">Hệ thống đang cập nhật cụm rạp, vui lòng quay lại sau.</p>
      </div>
    );
  }

  const getPrice = (seatType: string, format: string, isWeekend: boolean, fallback: number) => {
    const item = prices.find(p => p.seatType === seatType && p.format === format && p.isWeekend === isWeekend);
    return item ? `${item.price.toLocaleString('vi-VN')} Đ` : `${fallback.toLocaleString('vi-VN')} Đ`;
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-14 max-w-7xl animate-[fadeIn_0.5s_ease-out]">
      {/* Header with Luxury Cinema Aesthetics */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
          <SparkleIcon size={12} /> Cụm Rạp Tiêu Chuẩn Quốc Tế
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight uppercase mb-4">
          Hệ Thống Rạp <span className="text-gradient-gold">Aeon Cine</span> & Bảng Giá
        </h1>
        <p className="text-white/60 text-base leading-relaxed">
          Đắm chìm vào công nghệ trình chiếu Laser 4K thế hệ mới, âm thanh vòm Dolby Atmos đa chiều cùng không gian phòng chiếu sang trọng bậc nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Cột danh sách rạp (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/[0.08]">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-white/50 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-amber-500" /> Chọn Địa Điểm ({cinemas.length})
            </h2>
          </div>
          
          <div className="space-y-3">
            {cinemas.map((c, i) => {
              const isSelected = i === selectedCinemaIndex;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCinemaIndex(i)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative border ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-gradient-to-r dark:from-amber-500/[0.12] dark:to-amber-500/[0.03] border-amber-500/60 shadow-[0_4px_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/40'
                      : 'cinema-glass border-slate-200 dark:border-white/[0.06] hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className={`font-display font-bold text-base transition-colors ${isSelected ? 'text-black dark:text-amber-300' : 'text-black dark:text-white'}`}>
                      {c.name}
                    </h3>
                    {isSelected && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isSelected ? 'text-black dark:text-white/60 font-medium' : 'text-slate-600 dark:text-white/50'}`}>{c.address}</p>
                  {c.phone && (
                    <div className={`text-[11px] font-mono flex items-center gap-1.5 pt-2 border-t ${isSelected ? 'border-amber-500/30 text-black dark:text-white/60 font-semibold' : 'border-slate-200 dark:border-white/[0.04] text-slate-500 dark:text-white/40'}`}>
                      <Phone size={11} className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500 dark:text-amber-400'} /> {c.phone}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột Chi tiết Rạp & Bản đồ Google Maps (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          {/* Card Thông tin Rạp + Google Maps */}
          <div className="cinema-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08]">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.06] blur-[100px] pointer-events-none rounded-full" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/[0.08] relative z-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">{activeCinema.name}</h2>
                <p className="text-white/60 text-sm mt-1">{activeCinema.address}</p>
                {activeCinema.phone && (
                  <p className="text-white/40 text-xs mt-2 font-mono flex items-center gap-1.5">
                    <Phone size={12} className="text-amber-400" /> Hotline hỗ trợ: <span className="text-white font-medium">{activeCinema.phone}</span>
                  </p>
                )}
              </div>

              {activeCinema.directionsUrl && (
                <a
                  href={activeCinema.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cinema-btn-primary text-xs px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 font-display font-bold uppercase tracking-wider"
                >
                  <Navigation size={14} /> Dẫn Đường Đến Rạp <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Google Maps Embed Frame */}
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-white/[0.08] mb-6 bg-black/40 relative shadow-inner flex items-center justify-center">
              {activeCinema.mapUrl ? (
                <iframe
                  title={activeCinema.name}
                  src={activeCinema.mapUrl}
                  className="w-full h-full border-0 filter grayscale contrast-125 opacity-90 hover:filter-none hover:opacity-100 transition-all duration-500"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="text-center p-6">
                  <MapPin className="w-12 h-12 text-amber-500/40 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">{activeCinema.address}</p>
                </div>
              )}
            </div>

            {/* Cinema Amenities */}
            {activeCinema.amenities && activeCinema.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Film size={13} className="text-amber-400" /> Tiêu chuẩn phòng chiếu & Tiện ích
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeCinema.amenities.map((item, idx) => (
                    <span key={idx} className="bg-white/[0.04] text-white/80 border border-white/[0.08] text-xs font-medium px-3.5 py-1.5 rounded-xl">
                      <span className="text-amber-400 mr-1.5">✦</span>{item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột bảng giá vé */}
          <div id="bang-gia-ve" className="cinema-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Film className="text-amber-400" size={18} /> Bảng Giá Vé Tiêu Chuẩn Aeon Cine
                </h2>
                <p className="text-xs text-white/40 mt-1">Áp dụng cho khách hàng đặt vé trực tuyến hoặc tại quầy</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-white/40 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Loại Vé & Định Dạng</th>
                    <th className="py-3 px-4">Thứ 2 - Thứ 5</th>
                    <th className="py-3 px-4">Thứ 6 - CN & Lễ</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-white/[0.04]">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      Người lớn (Standard Seat 2D)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white/90">{getPrice('STANDARD', '2D', false, 75000)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{getPrice('STANDARD', '2D', true, 95000)}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Ghế VIP (VIP Screen Seat 2D)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{getPrice('VIP', '2D', false, 95000)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{getPrice('VIP', '2D', true, 110000)}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Ghế Đôi Sweetbox (Dành cho 2 người)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-300">{getPrice('SWEETBOX', '2D', false, 180000)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-300">{getPrice('SWEETBOX', '2D', true, 210000)}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Vé Phim 3D (Standard 3D)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{getPrice('STANDARD', '3D', false, 90000)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{getPrice('STANDARD', '3D', true, 115000)}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      HSSV / Trẻ em / U22 / Người cao tuổi
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">55.000 Đ</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">65.000 Đ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 flex items-start gap-3">
              <Info className="text-amber-400 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-white/60 leading-relaxed">
                * Giá vé đã bao gồm 8% thuế VAT. Giá vé phim 3D và các suất chiếu đặc biệt (IMAX, Suất chiếu sớm) có phụ thu từ 15.000đ - 30.000đ. Thành viên Aeon Cine tích 5% - 10% giá trị giao dịch vào thẻ thành viên để đổi quà bắp nước.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


