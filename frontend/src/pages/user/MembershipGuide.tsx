import { Link } from 'react-router-dom';
import { 
  Award, Star, Crown, Gift, Sparkles, CheckCircle2, ChevronRight, 
  HelpCircle, Ticket, ArrowRight
} from 'lucide-react';

export default function MembershipGuide() {
  return (
    <div className="w-full relative min-h-screen bg-[var(--bg-void)] text-[var(--text-main)] py-10 transition-colors duration-200">
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-amber-500/[0.05] blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-amber-400 transition-colors">Trang Chủ</Link>
          <ChevronRight size={14} />
          <span className="text-amber-400 font-bold">Chính Sách & Hướng Dẫn Hội Viên</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full cinema-glass-subtle border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-md shadow-amber-500/10">
            <Sparkles size={14} className="animate-spin" />
            AEON CINE REWARD STARS PROGRAM
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight uppercase mb-4">
            ĐẶC QUYỀN <span className="text-gradient-amber">HỘI VIÊN ĐIỆN ẢNH</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Chương trình khách hàng thân thiết chuẩn quốc tế tại AEON CINE. Tích lũy điểm thưởng không giới hạn trên từng suất chiếu, thăng hạng hoàng kim và tận hưởng chuỗi quyền lợi thượng lưu bậc nhất.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* TIER 1: STAR */}
          <div className="relative rounded-3xl p-7 cinema-glass border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-5 text-gray-300 group-hover:scale-110 transition-transform shadow-lg">
                <Star size={28} className="text-amber-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-black text-2xl text-white">HẠNG STAR</h3>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                  0 - 99 ĐIỂM
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Dành cho thành viên mới đăng ký tài khoản. Khám phá vũ trụ điện ảnh với ưu đãi khởi đầu hấp dẫn.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Tích lũy <strong>5%</strong> giá trị chi tiêu (vé & bắp nước)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Quà sinh nhật: <strong>1 Vé xem phim 2D</strong> miễn phí</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Ngày hội viên Thứ 4 Vui Vẻ: Đồng giá vé <strong>55.000đ</strong></span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Đổi điểm tích lũy lấy vé & voucher mọi lúc</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-xs text-gray-400 font-mono">Đăng ký tự động miễn phí</span>
            </div>
          </div>

          {/* TIER 2: G-STAR (FEATURED) */}
          <div className="relative rounded-3xl p-7 bg-gradient-to-b from-amber-500/15 via-zinc-900/90 to-zinc-900 border-2 border-amber-500/50 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-2 shadow-2xl shadow-amber-500/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-mono font-black uppercase tracking-widest shadow-md">
              PHỔ BIẾN NHẤT
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 text-black group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <Award size={28} className="text-zinc-950" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-black text-2xl text-gradient-amber">HẠNG G-STAR</h3>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TỪ 100 ĐIỂM
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-6">
                Mốc thăng hạng đầu tiên. Tự động đạt được khi tích lũy đủ 100 điểm thưởng (~1.000.000đ - 2.000.000đ chi tiêu).
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Tích lũy <strong>8%</strong> giá trị giao dịch vé & F&B</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-200">
                  <Gift size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Quà thăng hạng:</strong> Tặng ngay <strong>2 Vé 2D + 2 Combo Bắp Nước</strong></span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Quà sinh nhật: <strong>2 Vé 2D + 1 Sweet Combo</strong></span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Ưu tiên mua vé <strong>Suất chiếu sớm (Sneak Preview)</strong> trước 48h</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-500/20 text-center">
              <span className="text-xs text-amber-400 font-mono font-bold">Thăng hạng tự động khi đạt 100đ</span>
            </div>
          </div>

          {/* TIER 3: X-STAR (VIP) */}
          <div className="relative rounded-3xl p-7 cinema-glass border border-white/10 hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-500 to-rose-600 flex items-center justify-center mb-5 text-black group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                <Crown size={28} className="text-zinc-950" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-black text-2xl text-white">HẠNG X-STAR</h3>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  TỪ 500 ĐIỂM
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Đỉnh cao đặc quyền điện ảnh thượng lưu dành riêng cho tín đồ phim cuồng nhiệt nhất.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Tích lũy tối đa <strong>10%</strong> giá trị mọi đơn hàng</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <Gift size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Quà thăng hạng:</strong> Tặng <strong>4 Vé xem phim (cả IMAX Laser)</strong> + 4 Combo VIP</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Lối đi riêng Concierge VIP:</strong> Không phải xếp hàng tại cụm rạp</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Vé mời tham dự Họp báo công chiếu phim (Premiere Red Carpet)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Miễn phí <strong>Refill & Nâng cỡ bắp nước</strong> trọn năm</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-xs text-amber-300 font-mono font-bold">Thăng hạng tự động khi đạt 500đ</span>
            </div>
          </div>

        </div>

        {/* How Point Accumulation & Redemption Works */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-12 border border-white/10 mb-20 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3">
              <Ticket size={14} /> QUY CHẾ TÍCH ĐIỂM & ĐỔI QUÀ
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-6 uppercase">
              1 Điểm = 1.000 VNĐ Khấu Trừ Trực Tiếp
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed mb-8">
              <p>
                • <strong>Cách tích điểm:</strong> Mỗi khi đặt vé xem phim hoặc mua combo bắp nước trực tuyến trên website hoặc tại quầy, hệ thống tự động quy đổi chi tiêu thành điểm thưởng cộng trực tiếp vào tài khoản (Ví dụ: chi tiêu 100.000đ tích ngay 5 đến 10 điểm tùy theo hạng thẻ).
              </p>
              <p>
                • <strong>Cách tiêu điểm:</strong> Tại bước thanh toán vé (Step 5), bạn có thể nhập số điểm muốn dùng để <strong>trừ trực tiếp tiền mặt</strong> (Ví dụ: bạn có 46 điểm có thể giảm ngay 46.000đ cho đơn đặt vé).
              </p>
              <p>
                • <strong>Cơ chế thăng mốc (Milestones):</strong> Điểm tích lũy được ghi nhận liên tục. Khi tổng điểm đạt mốc <strong>100 điểm</strong>, hệ thống tự động nâng hạng tài khoản của bạn lên <strong>G-STAR</strong>; khi đạt <strong>500 điểm</strong> sẽ tự động nâng lên <strong>X-STAR</strong> để nhận trọn vẹn quà thăng hạng và tỷ lệ tích lũy cao hơn!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/profile" className="cinema-btn-primary px-6 py-3 text-xs font-bold flex items-center gap-2">
                <span>Xem Điểm Của Tôi Trong Hồ Sơ</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/movies" className="cinema-btn-glass px-6 py-3 text-xs font-bold">
                Đặt Vé Tích Điểm Ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-2xl font-display font-black text-white uppercase text-center mb-8">
            BẢNG SO SÁNH QUYỀN LỢI CHI TIẾT
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-white/10 cinema-glass">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="p-4 font-display font-bold text-gray-300">Quyền Lợi & Tiêu Chuẩn</th>
                  <th className="p-4 font-display font-bold text-gray-300 text-center">Hạng STAR</th>
                  <th className="p-4 font-display font-bold text-amber-400 text-center">Hạng G-STAR</th>
                  <th className="p-4 font-display font-bold text-rose-400 text-center">Hạng X-STAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                <tr>
                  <td className="p-4">Điều kiện xét hạng (Điểm tích lũy)</td>
                  <td className="p-4 text-center font-mono">0 - 99 điểm</td>
                  <td className="p-4 text-center font-mono text-amber-400 font-bold">Từ 100 điểm</td>
                  <td className="p-4 text-center font-mono text-rose-400 font-bold">Từ 500 điểm</td>
                </tr>
                <tr>
                  <td className="p-4">Tỷ lệ tích lũy điểm giao dịch</td>
                  <td className="p-4 text-center font-bold">5%</td>
                  <td className="p-4 text-center font-bold text-amber-400">8%</td>
                  <td className="p-4 text-center font-bold text-rose-400">10%</td>
                </tr>
                <tr>
                  <td className="p-4">Quà tặng thăng hạng mốc điểm</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-amber-300">2 Vé 2D + 2 Combo</td>
                  <td className="p-4 text-center text-rose-300">4 Vé IMAX + 4 Combo VIP</td>
                </tr>
                <tr>
                  <td className="p-4">Quà tặng chúc mừng sinh nhật</td>
                  <td className="p-4 text-center">1 Vé 2D + 1 Bắp</td>
                  <td className="p-4 text-center">2 Vé 2D + 1 Sweet Combo</td>
                  <td className="p-4 text-center">4 Vé IMAX + Quà VIP</td>
                </tr>
                <tr>
                  <td className="p-4">Ưu tiên đặt vé Suất chiếu sớm (Sneak)</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-amber-400">Có (Trước 48h)</td>
                  <td className="p-4 text-center text-rose-400">Có (Đặc quyền số 1)</td>
                </tr>
                <tr>
                  <td className="p-4">Lối đi ưu tiên Concierge VIP rạp</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Có</td>
                </tr>
                <tr>
                  <td className="p-4">Miễn phí Nâng cấp / Refill Bắp Nước</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-gray-500">—</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Trọn năm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-black text-white uppercase mb-2">
              CÂU HỎI THƯỜNG GẶP (FAQ)
            </h2>
            <p className="text-xs text-gray-400">Những thắc mắc phổ biến về hội viên AEON CINE Stars</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl cinema-glass border border-white/5">
              <h4 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                Làm thế nào để đăng ký trở thành Hội viên AEON CINE?
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Bạn chỉ cần bấm nút "Đăng Ký" trên thanh menu và tạo tài khoản bằng Email hoặc Số điện thoại. Tài khoản sẽ ngay lập tức kích hoạt hạng thẻ STAR và mã thẻ thành viên điện tử QR kèm theo.
              </p>
            </div>

            <div className="p-5 rounded-2xl cinema-glass border border-white/5">
              <h4 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                Điểm thưởng có bị hết hạn không?
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Điểm tích lũy trong năm hiện tại có thời hạn sử dụng đến ngày 31/12 của năm tiếp theo. Hệ thống sẽ gửi thông báo trước 30 ngày để bạn chủ động quy đổi vé và combo bắp nước trước khi hết hạn.
              </p>
            </div>

            <div className="p-5 rounded-2xl cinema-glass border border-white/5">
              <h4 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" />
                Khi thăng hạng lên G-STAR (100đ), tôi nhận quà bằng cách nào?
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Hệ thống tự động kích hoạt gói quà nâng hạng và gửi mã voucher vé xem phim miễn phí trực tiếp vào mục "Kho Ưu Đãi / Voucher" trong trang Hồ Sơ của bạn. Bạn chỉ cần chọn áp mã khi đặt vé xem phim tiếp theo.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
