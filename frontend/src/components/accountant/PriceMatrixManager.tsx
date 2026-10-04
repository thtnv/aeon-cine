import { useState, useEffect } from 'react';
import { DollarSign, Save, CheckCircle2, Award, Layers } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function PriceMatrixManager() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Price matrix state
  const [stdWeekday, setStdWeekday] = useState('75000');
  const [stdWeekend, setStdWeekend] = useState('95000');
  const [vipWeekday, setVipWeekday] = useState('95000');
  const [vipWeekend, setVipWeekend] = useState('110000');
  const [sweetboxWeekday, setSweetboxWeekday] = useState('180000');
  const [sweetboxWeekend, setSweetboxWeekend] = useState('210000');

  // Surcharges
  const [surcharge3D, setSurcharge3D] = useState('20000');
  const [surchargeIMAX, setSurchargeIMAX] = useState('50000');

  // Loyalty Program Config
  const [pointsRatio, setPointsRatio] = useState('10000');
  const [pointRedeemValue, setPointRedeemValue] = useState('1000');

  useEffect(() => {
    // 1. Fetch from Backend Database API
    fetch(`${API_URL}/api/prices`)
      .then(res => res.json())
      .then(prices => {
        if (Array.isArray(prices) && prices.length > 0) {
          prices.forEach((p: any) => {
            if (p.seatType === 'STANDARD' && p.format === '2D' && !p.isWeekend) setStdWeekday(String(p.price));
            if (p.seatType === 'STANDARD' && p.format === '2D' && p.isWeekend) setStdWeekend(String(p.price));
            if (p.seatType === 'VIP' && p.format === '2D' && !p.isWeekend) setVipWeekday(String(p.price));
            if (p.seatType === 'VIP' && p.format === '2D' && p.isWeekend) setVipWeekend(String(p.price));
            if (p.seatType === 'SWEETBOX' && p.format === '2D' && !p.isWeekend) setSweetboxWeekday(String(p.price));
            if (p.seatType === 'SWEETBOX' && p.format === '2D' && p.isWeekend) setSweetboxWeekend(String(p.price));
          });
        }
      })
      .catch(() => {});

    // 2. Load extra settings from localStorage fallback
    const saved = localStorage.getItem('aeon_price_matrix');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.surcharge3D) setSurcharge3D(data.surcharge3D);
        if (data.surchargeIMAX) setSurchargeIMAX(data.surchargeIMAX);
        if (data.pointsRatio) setPointsRatio(data.pointsRatio);
        if (data.pointRedeemValue) setPointRedeemValue(data.pointRedeemValue);
      } catch (e) {}
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      stdWeekday, stdWeekend, vipWeekday, vipWeekend,
      sweetboxWeekday, sweetboxWeekend, surcharge3D, surchargeIMAX,
      pointsRatio, pointRedeemValue, updatedAt: new Date().toISOString()
    };

    // Save to LocalStorage
    localStorage.setItem('aeon_price_matrix', JSON.stringify(config));

    // Save directly to Backend Database API
    try {
      await fetch(`${API_URL}/api/prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch (err) {
      console.error('Failed to sync prices to backend:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <DollarSign size={13} /> Biểu Phí & Bảng Giá Vé Chuẩn
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Cấu Hình Bảng Giá Vé & Phụ Thu Hệ Thống
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Thiết lập định mức giá vé ngày thường, cuối tuần, phụ thu định dạng chiếu và tỷ lệ điểm thưởng
          </p>
        </div>

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-500/30 flex items-center gap-2 uppercase tracking-wider text-xs cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} className="text-white" /> Đã Lưu Thành Công!
            </>
          ) : (
            <>
              <Save size={16} /> Lưu Cấu Hình Giá
            </>
          )}
        </button>
      </div>

      {/* Grid Pricing Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ghế Thường (Standard) */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
              STD
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ghế Thường (Standard)</h3>
              <p className="text-[11px] text-slate-400">Định dạng tiêu chuẩn 2D</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 2 - Thứ 5 (VNĐ)
            </label>
            <input
              type="number"
              value={stdWeekday}
              onChange={(e) => setStdWeekday(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 6 - CN & Ngày Lễ (VNĐ)
            </label>
            <input
              type="number"
              value={stdWeekend}
              onChange={(e) => setStdWeekend(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-orange-600 dark:text-orange-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Ghế VIP */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 font-mono font-bold flex items-center justify-center text-xs">
              VIP
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ghế VIP (Prime Seat)</h3>
              <p className="text-[11px] text-slate-400">Vị trí trung tâm góc nhìn hoàn hảo</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 2 - Thứ 5 (VNĐ)
            </label>
            <input
              type="number"
              value={vipWeekday}
              onChange={(e) => setVipWeekday(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 6 - CN & Ngày Lễ (VNĐ)
            </label>
            <input
              type="number"
              value={vipWeekend}
              onChange={(e) => setVipWeekend(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-orange-600 dark:text-orange-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Ghế Đôi Sweetbox */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 font-mono font-bold flex items-center justify-center text-xs">
              BOX
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ghế Đôi Sweetbox (2 Người)</h3>
              <p className="text-[11px] text-slate-400">Không gian riêng tư cho cặp đôi</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 2 - Thứ 5 (VNĐ)
            </label>
            <input
              type="number"
              value={sweetboxWeekday}
              onChange={(e) => setSweetboxWeekday(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Thứ 6 - CN & Ngày Lễ (VNĐ)
            </label>
            <input
              type="number"
              value={sweetboxWeekend}
              onChange={(e) => setSweetboxWeekend(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Surcharge & Loyalty Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phụ thu công nghệ chiếu */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-gray-800">
            <Layers size={16} className="text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Phụ Thu Công Nghệ Phòng Chiếu
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                Phụ thu 3D Kính Lọc (VNĐ)
              </label>
              <input
                type="number"
                value={surcharge3D}
                onChange={(e) => setSurcharge3D(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                Phụ thu IMAX Laser 4K (VNĐ)
              </label>
              <input
                type="number"
                value={surchargeIMAX}
                onChange={(e) => setSurchargeIMAX(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Điểm thưởng & Chính sách quy đổi thành viên */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-gray-800">
            <Award size={16} className="text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Chính Sách Điểm Thưởng & Chiết Khấu Thành Viên
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                Định mức tích điểm (VNĐ = 1 Điểm)
              </label>
              <input
                type="number"
                value={pointsRatio}
                onChange={(e) => setPointsRatio(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mặc định: 10.000 VNĐ tích 1 điểm</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                Giá trị quy đổi (1 Điểm = VNĐ)
              </label>
              <input
                type="number"
                value={pointRedeemValue}
                onChange={(e) => setPointRedeemValue(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mặc định: 1 điểm = 1.000 VNĐ khi đổi vé</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
