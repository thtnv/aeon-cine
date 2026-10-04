import { useState } from 'react';
import { Settings, Clock, DollarSign, Award, MessageSquare, Mail, ShieldAlert, Save, CheckCircle2, Building2, PhoneCall } from 'lucide-react';

export default function SystemSettingsManager() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Seat Hold & Booking Config
  const [holdDuration, setHoldDuration] = useState('10');
  const [maxSeatsPerBooking, setMaxSeatsPerBooking] = useState('8');
  const [autoReleaseHold, setAutoReleaseHold] = useState(true);

  // Pricing Matrix Config
  const [vipSeatSurcharge, setVipSeatSurcharge] = useState('10000');
  const [sweetboxSeatSurcharge, setSweetboxSeatSurcharge] = useState('20000');
  const [surcharge3D, setSurcharge3D] = useState('20000');
  const [surchargeIMAX, setSurchargeIMAX] = useState('50000');
  const [weekendSurcharge, setWeekendSurcharge] = useState('15000');

  // Loyalty Program Config
  const [pointsRatio, setPointsRatio] = useState('10000');
  const [pointRedeemValue, setPointRedeemValue] = useState('1000');
  const [gstarThreshold, setGstarThreshold] = useState('100');
  const [xstarThreshold, setXstarThreshold] = useState('500');

  // System & Chatbot Integrations
  const [enableAiChatbot, setEnableAiChatbot] = useState(true);
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [enableEmailNotification, setEnableEmailNotification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // General Brand Info
  const [brandName, setBrandName] = useState('AEON CINE');
  const [supportHotline, setSupportHotline] = useState('1900 2224');
  const [supportEmail, setSupportEmail] = useState('support@aeoncine.vn');
  const [headquarters, setHeadquarters] = useState('AEON MALL Tân Phú Celadon, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] space-y-8 pb-12">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-xl gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Settings className="text-orange-500" /> Cài Đặt Hệ Thống Rạp AEON CINE
          </h1>
          <p className="text-gray-400 text-sm mt-1">Quản lý cấu hình vận hành, thời gian giữ ghế, bảng giá phụ thu, hạng thành viên & AI</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center gap-2 uppercase tracking-wider text-xs shrink-0"
        >
          <Save size={18} /> LƯU CẤU HÌNH HỆ THỐNG
        </button>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="bg-green-500/10 border border-green-500/40 text-green-400 p-4 rounded-2xl flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Đã lưu cài đặt hệ thống thành công!</h4>
            <p className="text-xs text-green-300/80">Toàn bộ cấu hình giữ ghế, tích điểm và quy trình rạp đã được cập nhật toàn hệ thống.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SECTION 1: Cấu hình Giữ ghế & Đặt vé */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 space-y-5 shadow-lg">
          <h2 className="text-lg font-black text-orange-400 uppercase tracking-wide flex items-center gap-2.5 border-b border-gray-800 pb-3">
            <Clock size={20} className="text-orange-500" /> 1. Khóa Giữ Ghế & Đặt Vé (SeatHold Timer)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Thời gian giữ ghế tối đa (Phút)
              </label>
              <input
                type="number"
                value={holdDuration}
                onChange={e => setHoldDuration(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">Mặc định: 10 phút (chuẩn Galaxy Cinema)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Số ghế đặt tối đa / đơn
              </label>
              <input
                type="number"
                value={maxSeatsPerBooking}
                onChange={e => setMaxSeatsPerBooking(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">Giới hạn tối đa mỗi lần giao dịch</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-xl border border-gray-800">
            <div>
              <h4 className="text-sm font-bold text-white">Tự động hủy giữ ghế khi hết giờ</h4>
              <p className="text-xs text-gray-400 mt-0.5">Tự động nhả ghế trong DB nếu người dùng không thanh toán sau 10p</p>
            </div>
            <input
              type="checkbox"
              checked={autoReleaseHold}
              onChange={e => setAutoReleaseHold(e.target.checked)}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 2: Bảng Giá Phụ Thu Vé */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 space-y-5 shadow-lg">
          <h2 className="text-lg font-black text-amber-400 uppercase tracking-wide flex items-center gap-2.5 border-b border-gray-800 pb-3">
            <DollarSign size={20} className="text-amber-500" /> 2. Ma Trận Giá Vé & Phụ Thu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Phụ thu Ghế VIP (VNĐ)</label>
              <input
                type="number"
                value={vipSeatSurcharge}
                onChange={e => setVipSeatSurcharge(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Phụ thu Sweetbox / Đôi (VNĐ)</label>
              <input
                type="number"
                value={sweetboxSeatSurcharge}
                onChange={e => setSweetboxSeatSurcharge(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Phụ thu Phim 3D (VNĐ)</label>
              <input
                type="number"
                value={surcharge3D}
                onChange={e => setSurcharge3D(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Phụ thu Phim IMAX 3D (VNĐ)</label>
              <input
                type="number"
                value={surchargeIMAX}
                onChange={e => setSurchargeIMAX(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Phụ thu Cuối tuần (Thứ 7, Chủ Nhật)</label>
            <input
              type="number"
              value={weekendSurcharge}
              onChange={e => setWeekendSurcharge(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 3: Tích Điểm Thành Viên STAR / G-STAR / X-STAR */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 space-y-5 shadow-lg">
          <h2 className="text-lg font-black text-blue-400 uppercase tracking-wide flex items-center gap-2.5 border-b border-gray-800 pb-3">
            <Award size={20} className="text-blue-500" /> 3. Chương Trình Thành Viên Star Points
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Tỷ lệ tích điểm (Doanh thu / Điểm)</label>
              <input
                type="number"
                value={pointsRatio}
                onChange={e => setPointsRatio(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">Ví dụ: 10.000 VNĐ = 1 Star Point</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Giá trị quy đổi (VNĐ / 1 Điểm)</label>
              <input
                type="number"
                value={pointRedeemValue}
                onChange={e => setPointRedeemValue(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">1 Star Point = 1.000 VNĐ giảm giá</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
              <span className="text-xs font-black text-amber-400 uppercase">Hạng G-STAR (Thành viên Bạc)</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Yêu cầu từ:</span>
                <input
                  type="number"
                  value={gstarThreshold}
                  onChange={e => setGstarThreshold(e.target.value)}
                  className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
                />
                <span className="text-xs text-gray-400">điểm</span>
              </div>
            </div>

            <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
              <span className="text-xs font-black text-purple-400 uppercase">Hạng X-STAR (Thành viên Vàng)</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Yêu cầu từ:</span>
                <input
                  type="number"
                  value={xstarThreshold}
                  onChange={e => setXstarThreshold(e.target.value)}
                  className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
                />
                <span className="text-xs text-gray-400">điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Trợ Lý AI & Thông Báo */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 space-y-5 shadow-lg">
          <h2 className="text-lg font-black text-purple-400 uppercase tracking-wide flex items-center gap-2.5 border-b border-gray-800 pb-3">
            <MessageSquare size={20} className="text-orange-500" /> 4. Cấu Hình Chatbot Tư Vấn & Thông Báo
          </h2>

          <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-xl border border-gray-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Bật Chatbot Tư Vấn Trực Tuyến
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Tự động hỗ trợ tư vấn thông tin phim & suất chiếu cho khách hàng Flash</p>
            </div>
            <input
              type="checkbox"
              checked={enableAiChatbot}
              onChange={e => setEnableAiChatbot(e.target.checked)}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Mô Hình Xử Lý Dữ Liệu</label>
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng - Nhanh)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Chuyên sâu)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-900/80 rounded-xl border border-gray-800">
              <div>
                <h4 className="text-xs font-bold text-white">Gửi Email Vé QR tự động</h4>
                <p className="text-[11px] text-gray-400">Gửi mail vé khi thanh toán xong</p>
              </div>
              <input
                type="checkbox"
                checked={enableEmailNotification}
                onChange={e => setEnableEmailNotification(e.target.checked)}
                className="w-5 h-5 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/30 mt-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-400">Chế độ Bảo Trì Hệ Thống (Maintenance Mode)</h4>
                <p className="text-xs text-red-300/80">Tạm dừng đặt vé trực tuyến trên toàn bộ website</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={e => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 accent-red-500 cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 5: Thông Tin Rạp & CSKH */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 space-y-5 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-black text-green-400 uppercase tracking-wide flex items-center gap-2.5 border-b border-gray-800 pb-3">
            <Building2 size={20} className="text-green-500" /> 5. Thông Tin Thương Hiệu & Tổng Đài CSKH
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Tên Thương Hiệu Hệ Thống</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                <PhoneCall size={14} className="text-orange-400" /> Hotline Hỗ Trợ 24/7
              </label>
              <input
                type="text"
                value={supportHotline}
                onChange={e => setSupportHotline(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                <Mail size={14} className="text-orange-400" /> Email Tiếp Nhận Phản Hồi
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Địa Chỉ Trụ Sở Chính</label>
            <input
              type="text"
              value={headquarters}
              onChange={e => setHeadquarters(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

      </form>
    </div>
  );
}
