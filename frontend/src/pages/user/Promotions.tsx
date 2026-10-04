import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, ShieldAlert, ChevronRight, X, Sparkles, Copy, Check, ArrowRight, MapPin, Tag } from 'lucide-react';
import { API_URL } from '../../config/api';

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
  iconType: string;
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/promotions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPromotions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'ALL', label: 'TẤT CẢ ƯU ĐÃI' },
    { id: 'MEMBER', label: 'ƯU ĐÃI THÀNH VIÊN' },
    { id: 'PARTNER', label: 'KHUYẾN MÃI ĐỐI TÁC' },
    { id: 'STUDENT', label: 'HSSV / TRẺ EM' }
  ];

  const filteredPromotions = selectedCategory === 'ALL'
    ? promotions
    : promotions.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      {/* Header Banner */}
      <div className="relative w-full py-16 sm:py-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-amber-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10 max-w-4xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Đặc Quyền Khách Hàng Aeon Cine
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight uppercase mb-4">
            Ưu Đãi & <span className="text-gradient-gold">Sự Kiện Nổi Bật</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Khám phá các chương trình tri ân thành viên Aeon Cine Star Club, ưu đãi giá vé Thứ Ba Happy Day và quà tặng combo bắp nước thượng hạng.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {categories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                    active
                      ? 'cinema-btn-primary shadow-lg shadow-amber-500/20'
                      : 'cinema-glass-subtle text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-14 max-w-7xl">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-20 cinema-glass rounded-3xl border border-white/[0.08]">
            <p className="text-white/50 text-base">Hiện chưa có chương trình ưu đãi nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredPromotions.map(promo => (
              <div
                key={promo.id}
                className="cinema-glass rounded-3xl overflow-hidden border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between shadow-xl shadow-black/20"
              >
                {/* Promo Banner Image */}
                <div 
                  onClick={() => setSelectedPromo(promo)}
                  className="w-full aspect-[16/9] relative overflow-hidden bg-black/50 cursor-pointer"
                >
                  <img
                    src={promo.coverUrl || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80'}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Badge */}
                  {promo.badge && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {promo.badge}
                    </span>
                  )}
                </div>

                {/* Promo Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta Info */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={12} /> Aeon Cine
                      </span>
                      <span className="text-[11px] text-white/50 font-mono flex items-center gap-1.5">
                        <Calendar size={12} className="text-amber-400/80" /> Đến: {promo.validUntil}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setSelectedPromo(promo)}
                      className="text-base sm:text-lg font-display font-bold text-white mb-2 group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {promo.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-5">
                      {promo.desc}
                    </p>
                  </div>

                  {/* Action Bar (No ugly raw voucher code) */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPromo(promo)}
                      className="flex-1 cinema-btn-glass py-2.5 px-3 rounded-xl text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Xem Thể Lệ</span>
                      <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate('/movies')}
                      className="cinema-btn-primary py-2.5 px-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/15 cursor-pointer"
                    >
                      <Ticket size={13} />
                      <span>Đặt Vé</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROMOTION DETAILS MODAL */}
      {selectedPromo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="cinema-glass border border-white/[0.12] text-white rounded-3xl max-w-xl w-full relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header Image */}
            <div className="w-full aspect-[21/9] relative shrink-0 bg-black/60 overflow-hidden">
              <img 
                src={selectedPromo.coverUrl} 
                alt={selectedPromo.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <button
                onClick={() => setSelectedPromo(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {selectedPromo.badge && (
                <span className="absolute bottom-3 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {selectedPromo.badge}
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 leading-tight">
                  {selectedPromo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 font-mono">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Calendar size={13} /> Hạn áp dụng: <strong className="text-white">{selectedPromo.validUntil}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-white/60">
                    <MapPin size={13} className="text-amber-400" /> Toàn bộ hệ thống 35 cụm rạp Aeon Cine
                  </span>
                </div>
              </div>

              {/* Application Mechanism Box */}
              <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider block mb-1">
                      Cơ Chế Áp Dụng Ưu Đãi
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {selectedPromo.category === 'PARTNER' 
                        ? 'Nhập mã giảm giá đối tác khi chọn cổng thanh toán tương ứng.'
                        : 'Ưu đãi tự động áp dụng trực tiếp khi chọn suất chiếu hoặc đăng nhập tài khoản thành viên.'}
                    </p>
                  </div>
                  {selectedPromo.category === 'PARTNER' && selectedPromo.code && (
                    <button
                      onClick={() => handleCopy(selectedPromo.code || '')}
                      className="cinema-btn-glass text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      {copiedCode === selectedPromo.code ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 font-mono font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span className="font-mono font-bold text-amber-300">{selectedPromo.code}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-400" /> Thể Lệ & Điều Kiện Tham Gia
                </h4>
                <div className="cinema-glass-subtle border border-white/[0.08] rounded-2xl p-4 text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line space-y-1">
                  {selectedPromo.terms}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedPromo(null)}
                className="cinema-btn-glass px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSelectedPromo(null);
                  navigate('/movies');
                }}
                className="cinema-btn-primary px-6 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>ĐẶT VÉ ÁP DỤNG NGAY</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
