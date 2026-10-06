import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, Film, Gift, MonitorPlay, Phone, Mail, 
  CheckCircle2, ChevronRight, Send, Clock
} from 'lucide-react';
import { API_URL } from '../../config/api';

export default function GroupBooking() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    email: '',
    companyName: '',
    cinemaId: '',
    cinemaName: '',
    serviceType: 'GROUP_TICKET',
    expectedGuests: 30,
    expectedDate: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/cinemas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCinemas(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cinemaId') {
      const selected = cinemas.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        cinemaId: value,
        cinemaName: selected ? selected.name : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/group-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || 'Yêu cầu của bạn đã được gửi thành công! Chuyên viên AEON CINE sẽ liên hệ bạn sớm.');
        setFormData({
          contactName: '',
          phone: '',
          email: '',
          companyName: '',
          cinemaId: '',
          cinemaName: '',
          serviceType: 'GROUP_TICKET',
          expectedGuests: 30,
          expectedDate: '',
          notes: ''
        });
      } else {
        setErrorMessage(data.message || 'Không thể gửi yêu cầu. Vui lòng kiểm tra lại thông tin.');
      }
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen bg-[var(--bg-void)] text-[var(--text-main)] py-10 transition-colors duration-200">
      
      {/* Ambient Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-amber-500/[0.05] blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-amber-400 transition-colors">Trang Chủ</Link>
          <ChevronRight size={14} />
          <span className="text-amber-400 font-bold">Đặt Vé Đoàn & Thuê Rạp Sự Kiện</span>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full cinema-glass-subtle border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-md shadow-amber-500/10">
            <Building2 size={14} />
            DỊCH VỤ DOANH NGHIỆP & SỰ KIỆN ĐẲNG CẤP
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight uppercase mb-4">
            ĐẶT VÉ ĐOÀN & <span className="text-gradient-amber">THUÊ TRỌN PHÒNG CHIẾU</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Giải pháp điện ảnh toàn diện dành cho doanh nghiệp, trường học và hội nhóm. Trải nghiệm không gian riêng tư chuẩn Laser 4K, chiết khấu lên đến 25% kèm dịch vụ Concierge VIP độc quyền.
          </p>
        </div>

        {/* 4 Feature Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          <div className="rounded-3xl p-6 cinema-glass border border-white/10 hover:border-amber-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Vé Đoàn (Group Tickets)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Áp dụng cho đoàn từ 20 khách. Chiết khấu hấp dẫn từ 10% - 25% kèm ưu đãi combo bắp nước tiết kiệm.
            </p>
          </div>

          <div className="rounded-3xl p-6 cinema-glass border border-white/10 hover:border-amber-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Film size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Thuê Trọn Rạp Chiếu</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bao trọn phòng chiếu Laser / IMAX / Gold Class để thưởng thức phim riêng tư, tổ chức sinh nhật, cầu hôn đặc biệt.
            </p>
          </div>

          <div className="rounded-3xl p-6 cinema-glass border border-white/10 hover:border-amber-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Gift size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Voucher & Quà Tặng</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Thẻ vé xem phim & Gift Card in logo công ty, là món quà tri ân tinh tế dành cho đối tác và nhân viên dịp lễ Tết.
            </p>
          </div>

          <div className="rounded-3xl p-6 cinema-glass border border-white/10 hover:border-amber-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <MonitorPlay size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Hội Thảo & Sự Kiện</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Màn hình cong khổng lồ, âm thanh vòm Dolby sống động và kết nối máy tính trình chiếu sắc nét cho hội nghị, ra mắt sản phẩm.
            </p>
          </div>

        </div>

        {/* Main Form & Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 cinema-glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative">
            <div className="mb-6">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">ĐĂNG KÝ TRỰC TUYẾN</span>
              <h2 className="text-2xl font-display font-extrabold text-white uppercase mt-1">
                GỬI YÊU CẦU BÁO GIÁ DỊCH VỤ
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Vui lòng cung cấp thông tin, chuyên viên AEON CINE sẽ phản hồi trong vòng 2 giờ.
              </p>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 flex items-start gap-3">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-6">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Họ và Tên Đại Diện *</label>
                  <input
                    type="text"
                    required
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901 234 567"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Email Công Ty / Cá Nhân *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Tên Đơn Vị / Công Ty</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Tập đoàn ABC, Lớp 12A..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Dịch Vụ Quan Tâm *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="GROUP_TICKET">Đặt Vé Đoàn (Từ 20 khách)</option>
                    <option value="HALL_RENTAL">Thuê Trọn Phòng Chiếu Riêng Biệt</option>
                    <option value="VOUCHER">Mua Phiếu Quà Tặng / Gift Card Số Lượng Lớn</option>
                    <option value="EVENT">Hội Thảo, Sự Kiện & Quảng Cáo Rạp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Cụm Rạp Mong Muốn</label>
                  <select
                    name="cinemaId"
                    value={formData.cinemaId}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="">-- Chọn cụm rạp tiện lợi nhất --</option>
                    {cinemas.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city || 'Toàn quốc'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Số Lượng Khách Dự Kiến</label>
                  <input
                    type="number"
                    min="10"
                    name="expectedGuests"
                    value={formData.expectedGuests}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5 uppercase">Ngày Dự Kiến Tổ Chức</label>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase">Yêu Cầu Chi Tiết (Phim, Combo bắp nước, Backdrop...)</label>
                <textarea
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ví dụ: Đoàn 50 người xem phim Mai lúc 19h00, cần hóa đơn đỏ VAT và 50 combo bắp ngọt..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cinema-btn-primary py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Gửi Yêu Cầu Cho Chuyên Viên Doanh Nghiệp</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Workflow & Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 4 Steps Workflow */}
            <div className="cinema-glass rounded-3xl p-8 border border-white/10 shadow-xl">
              <h3 className="font-display font-bold text-lg text-white mb-6 uppercase flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                QUY TRÌNH HỖ TRỢ 4 BƯỚC
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                    01
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Gửi Yêu Cầu</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Điền thông tin vào biểu mẫu trực tuyến hoặc gọi hotline dịch vụ doanh nghiệp.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                    02
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Tư Vấn & Báo Giá Ưu Đãi</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Chuyên viên liên hệ tư vấn vị trí phòng chiếu, suất chiếu và gửi mức chiết khấu tốt nhất.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                    03
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Hợp Đồng & Hóa Đơn VAT</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Ký kết hợp đồng nhanh chóng, hỗ trợ xuất hóa đơn tài chính điện tử đầy đủ theo quy định.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                    04
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs">Đón Tiếp Chu Đáo</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Lối đi riêng Concierge, phục vụ bắp nước tận rạp và hỗ trợ kỹ thuật viên suốt buổi chiếu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Hotline Box - Nền tối nổi bật sắc nét */}
            <div className="rounded-3xl p-6 bg-slate-900 border-2 border-amber-500/40 text-xs shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-black text-amber-400 uppercase text-sm mb-3 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                LIÊN HỆ TRỰC TIẾP PHÒNG KINH DOANH
              </h4>
              <p className="text-gray-200 mb-4 leading-relaxed font-medium">
                Quý công ty cần tư vấn gấp cho sự kiện trong vòng 24h, vui lòng kết nối ngay:
              </p>
              <div className="space-y-2.5 font-mono">
                <div className="flex flex-wrap items-center gap-2 text-white">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Phone size={14} className="text-amber-400" />
                    <strong>Hotline Doanh Nghiệp:</strong>
                  </span>
                  <span className="text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">1900 2224 (Nhánh 2)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-white">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Mail size={14} className="text-amber-400" />
                    <strong>Email B2B:</strong>
                  </span>
                  <span className="text-gray-100 font-semibold underline underline-offset-2">sales@aeoncine.vn</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
