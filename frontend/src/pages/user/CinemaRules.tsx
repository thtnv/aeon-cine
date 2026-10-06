import { Link } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, VideoOff, VolumeX, Ban, 
  CheckCircle2, ChevronRight, HeartHandshake
} from 'lucide-react';

export default function CinemaRules() {
  return (
    <div className="w-full relative min-h-screen bg-[var(--bg-void)] text-[var(--text-main)] py-10 transition-colors duration-200">
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-amber-500/[0.05] blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-amber-400 transition-colors">Trang Chủ</Link>
          <ChevronRight size={14} />
          <span className="text-amber-400 font-bold">Nội Quy & Quy Định Tại Rạp</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full cinema-glass-subtle border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-md shadow-amber-500/10">
            <ShieldAlert size={14} />
            AEON CINE THEATER CODE OF CONDUCT
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight uppercase mb-4">
            QUY ĐỊNH & NỘI QUY <span className="text-gradient-amber">RẠP CHIẾU PHIM</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Để mang đến không gian thưởng thức điện ảnh đẳng cấp, văn minh và an toàn cho tất cả khán giả, AEON CINE trân trọng thông báo các quy định áp dụng tại toàn bộ hệ thống cụm rạp trên toàn quốc.
          </p>
        </div>

        {/* SECTION 1: AGE RATINGS */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-10 border border-white/10 mb-12 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              01
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase">
                QUY CHUẨN PHÂN LOẠI ĐỘ TUỔI KHÁN GIẢ
              </h2>
              <p className="text-xs text-gray-400">
                Tuân thủ theo Thông tư số 05/2023/TT-BVHTTDL của Bộ Văn hóa, Thể thao và Du lịch
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md">
                P
              </span>
              <h4 className="font-bold text-white text-xs mb-1">PHỔ BIẾN</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Phim được phép phổ biến cho khán giả ở mọi lứa tuổi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-blue-500 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md">
                K
              </span>
              <h4 className="font-bold text-white text-xs mb-1">DƯỚI 13 TUỔI</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Khán giả dưới 13 tuổi được xem khi có cha mẹ / người giám hộ đi cùng.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md">
                T13
              </span>
              <h4 className="font-bold text-white text-xs mb-1">TỪ 13 TUỔI</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Phim cấm phổ biến cho khán giả dưới 13 tuổi (13+).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md">
                T16
              </span>
              <h4 className="font-bold text-white text-xs mb-1">TỪ 16 TUỔI</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Phim cấm phổ biến cho khán giả dưới 16 tuổi (16+).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md">
                T18
              </span>
              <h4 className="font-bold text-white text-xs mb-1">TỪ 18 TUỔI</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Phim cấm phổ biến cho khán giả dưới 18 tuổi (18+).
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
            <p className="leading-relaxed">
              <strong>Yêu cầu xác minh giấy tờ tùy thân:</strong> Nhân viên rạp bắt buộc kiểm tra Thẻ Căn cước công dân (CCCD), Thẻ học sinh/sinh viên hoặc ứng dụng VNeID tại cửa soát vé đối với các phim gắn nhãn T13, T16, T18. Nhân viên có quyền từ chối phục vụ và không hoàn tiền nếu khán giả không xuất trình được giấy tờ chứng minh đủ độ tuổi quy định.
            </p>
          </div>
        </div>

        {/* SECTION 2: FOOD & BEVERAGES */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-10 border border-white/10 mb-12 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              02
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase">
              QUY ĐỊNH THỨC ĂN & ĐỒ UỐNG (F&B)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300 leading-relaxed">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 size={16} /> ĐƯỢC PHÉP MANG VÀO
              </div>
              <p>
                • Toàn bộ thức ăn, bắp rang bơ, nước giải khát và snack được mua tại quầy F&B chính thức của AEON CINE.
              </p>
              <p>
                • Bình nước cá nhân kín miệng, nước lọc tinh khiết không mùi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Ban size={16} /> TUYỆT ĐỐI KHÔNG MANG VÀO
              </div>
              <p>
                • Đồ ăn có mùi nồng gắt (sầu riêng, mít, mắm tôm, bún đậu, đồ nướng...).
              </p>
              <p>
                • Đồ ăn nóng có nước dùng, thức ăn nhanh mua từ bên ngoài cụm rạp.
              </p>
              <p>
                • Đồ uống có nồng độ cồn cao, chất kích thích hoặc kẹo cao su.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: COPYRIGHT & SECURITY */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-10 border border-slate-200 dark:border-white/10 mb-12 shadow-xl bg-white/80 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center font-black">
              03
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white uppercase">
              BẢO MẬT BẢN QUYỀN & AN NINH PHÒNG CHIẾU
            </h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50 dark:bg-[#1a0e12] border-2 border-red-500 shadow-md">
              <span className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-300 dark:border-red-500/40 mt-0.5">
                <VideoOff size={22} className="text-red-600 dark:text-red-400" />
              </span>
              <div>
                <strong className="block text-red-700 dark:text-red-400 mb-1.5 uppercase font-display font-black text-sm tracking-wide">
                  NGHIÊM CẤM QUAY PHIM & PHÁT SÓNG TRỰC TIẾP (LIVESTREAM)
                </strong>
                <p className="rules-copyright-desc font-semibold leading-relaxed text-xs">
                  Mọi hành vi quay phim, chụp ảnh, ghi âm hoặc truyền phát trực tiếp nội dung tác phẩm điện ảnh trong phòng chiếu là hành vi vi phạm nghiêm trọng Luật Sở hữu trí tuệ Việt Nam. Hệ thống camera an ninh hồng ngoại trong phòng chiếu sẽ giám sát 24/7. Mọi cá nhân vi phạm sẽ bị mời ra khỏi rạp, lập biên bản và bàn giao cơ quan Công an xử lý hình sự.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-500/30 mt-0.5">
                <ShieldAlert size={22} className="text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <strong className="block text-slate-900 dark:text-amber-400 mb-1 font-display font-bold text-sm uppercase">
                  An toàn & Phòng chống cháy nổ
                </strong>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed font-medium text-xs">
                  Nghiêm cấm mang theo hung khí, vật sắc nhọn, chất dễ cháy nổ, pháo hoa hoặc các chất cấm vào rạp. Khách hàng vui lòng tuân thủ chỉ dẫn an toàn và lối thoát hiểm của rạp khi có sự cố.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: TICKET RULES & REFUND */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-10 border border-white/10 mb-12 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              04
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase">
              QUY ĐỊNH VÉ & CHÍNH SÁCH HOÀN TIỀN
            </h2>
          </div>

          <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
            <p>
              • <strong>Giờ vào rạp:</strong> Khán giả vui lòng có mặt tại rạp trước giờ chiếu tối thiểu <strong>15 phút</strong> để thực hiện check-in hoặc nhận bắp nước.
            </p>
            <p>
              • <strong>Vé điện tử:</strong> Khán giả xuất trình mã QR vé điện tử trên màn hình điện thoại (trong email hoặc trang Hồ Sơ Cá Nhân) tại cửa soát vé để nhân viên quét mã.
            </p>
            <p>
              • <strong>Chính sách hoàn tiền / hủy vé (Chuẩn Galaxy Cinema & CGV):</strong> Hội viên có thể thực hiện <strong>Hủy vé trực tuyến</strong> trong trang Hồ Sơ Cá Nhân trước giờ chiếu tối thiểu <strong>60 phút</strong>. Hệ thống sẽ hoàn lại 100% giá trị vé quy đổi thành Điểm Thưởng Stars vào tài khoản để đặt vé khác. Vé đã check-in tại rạp hoặc quá thời gian quy định sẽ không được hỗ trợ hủy hay đổi trả.
            </p>
          </div>
        </div>

        {/* SECTION 5: CINEMA ETIQUETTE */}
        <div className="rounded-3xl cinema-glass p-8 sm:p-10 border border-white/10 mb-16 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              05
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase">
              VĂN HÓA XEM PHIM VĂN MINH
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-center">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
              <VolumeX size={24} className="text-amber-400 mb-2" />
              <strong className="text-white mb-1">Tắt Chuông Điện Thoại</strong>
              <p className="text-[11px] text-gray-400">Chuyển sang chế độ rung hoặc im lặng khi vào phòng chiếu.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
              <HeartHandshake size={24} className="text-amber-400 mb-2" />
              <strong className="text-white mb-1">Giữ Trật Tự Chung</strong>
              <p className="text-[11px] text-gray-400">Không nói chuyện to tiếng, không bình phẩm làm phiền khán giả khác.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
              <Ban size={24} className="text-amber-400 mb-2" />
              <strong className="text-white mb-1">Không Gác Chân</strong>
              <p className="text-[11px] text-gray-400">Không gác chân hoặc đạp vào lưng ghế phía trước.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
              <CheckCircle2 size={24} className="text-amber-400 mb-2" />
              <strong className="text-white mb-1">Bỏ Rác Đúng Nơi</strong>
              <p className="text-[11px] text-gray-400">Mang vỏ bắp nước ra thùng rác sau khi kết thúc buổi chiếu.</p>
            </div>
          </div>
        </div>

        {/* Bottom Contact */}
        <div className="text-center text-xs text-gray-400">
          Mọi thắc mắc hoặc cần hỗ trợ tại rạp, xin vui lòng liên hệ nhân viên Quản lý sảnh hoặc Tổng đài CSKH: <strong className="text-amber-400 font-mono">1900 2224</strong>.
        </div>

      </div>
    </div>
  );
}
