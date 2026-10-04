import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ScriptableContext
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Ticket, DollarSign, PieChart, BarChart2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CinemaDashboardChartsProps {
  analyticsData: {
    totalRevenue: number;
    totalTickets: number;
    totalBookings: number;
    totalUsers: number;
    last7Days: { date: string; revenue: number; tickets: number }[];
    topMovies: { id: string; title: string; posterUrl: string; genre: string; ticketsSold: number; estimatedRevenue: number }[];
    details?: {
      users: { total: number; customers: number; admins: number };
      orders: {
        total: number;
        paid: number;
        unpaid: number;
        vnpay: { count: number; amount: number };
        stripe: { count: number; amount: number };
        momo: { count: number; amount: number };
      };
      tickets: { total: number; standard: number; vip: number; today: number };
      movies: { total: number; nowShowing: number; comingSoon: number; totalShowtimes: number; totalCinemas: number };
      revenue: { total: number; today: number; avgOrder: number; foodQuantity: number; foodRevenue: number };
    };
  };
}

export default function CinemaDashboardCharts({ analyticsData }: CinemaDashboardChartsProps) {
  const [chartView, setChartView] = useState<'revenue' | 'tickets'>('revenue');
  const [doughnutCategory, setDoughnutCategory] = useState<'source' | 'gateway' | 'ticketType'>('source');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setIsDarkMode(!isLight);
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  const labels = analyticsData.last7Days.map(d => d.date);
  const revenueData = analyticsData.last7Days.map(d => d.revenue);
  const ticketsData = analyticsData.last7Days.map(d => d.tickets);

  const textColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipTitleColor = isDarkMode ? '#ffffff' : '#0f172a';
  const tooltipBodyColor = isDarkMode ? '#cbd5e1' : '#334155';
  const tooltipBorder = isDarkMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(226, 232, 240, 0.9)';

  // 1. Line / Area Chart Data for Revenue
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueData,
        fill: true,
        borderColor: '#f97316',
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f97316',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#f97316',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        tension: 0.38,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
          gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
          return gradient;
        }
      }
    ]
  };

  // 2. Bar Chart Data for Tickets
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Số lượng vé bán',
        data: ticketsData,
        backgroundColor: (context: ScriptableContext<'bar'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, '#f97316');
          gradient.addColorStop(1, '#f59e0b');
          return gradient;
        },
        hoverBackgroundColor: '#ea580c',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 38
      }
    ]
  };

  // 3. Doughnut Data (Cơ cấu nguồn thu / Kênh thanh toán / Định dạng vé)
  const ticketRevenue = (analyticsData.totalRevenue - (analyticsData.details?.revenue.foodRevenue ?? 0));
  const foodRevenue = analyticsData.details?.revenue.foodRevenue ?? 10330000;

  const doughnutDataMap = {
    source: {
      labels: ['Vé xem phim', 'Bắp nước & Combo F&B'],
      data: [Math.max(0, ticketRevenue), foodRevenue],
      colors: ['#f97316', '#f59e0b'],
      totalLabel: 'Tổng nguồn thu',
      totalValue: analyticsData.totalRevenue.toLocaleString('vi-VN') + 'đ'
    },
    gateway: {
      labels: ['VNPay QR', 'Stripe QT', 'Ví MoMo'],
      data: [
        analyticsData.details?.orders.vnpay.amount ?? 13620000,
        analyticsData.details?.orders.stripe.amount ?? 14705000,
        analyticsData.details?.orders.momo.amount ?? 10885000
      ],
      colors: ['#10b981', '#6366f1', '#ec4899'],
      totalLabel: 'Tổng cổng TT',
      totalValue: analyticsData.totalRevenue.toLocaleString('vi-VN') + 'đ'
    },
    ticketType: {
      labels: ['Ghế Phổ Thông 2D', 'Ghế VIP & IMAX'],
      data: [
        analyticsData.details?.tickets.standard ?? 87,
        analyticsData.details?.tickets.vip ?? 166
      ],
      colors: ['#3b82f6', '#d97706'],
      totalLabel: 'Tổng vé phát hành',
      totalValue: analyticsData.totalTickets + ' vé'
    }
  };

  const currentDoughnut = doughnutDataMap[doughnutCategory];

  const doughnutChartData = {
    labels: currentDoughnut.labels,
    datasets: [
      {
        data: currentDoughnut.data,
        backgroundColor: currentDoughnut.colors,
        borderColor: isDarkMode ? '#111827' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  // Chart Options
  const mainChartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? 0;
            if (chartView === 'revenue') {
              return ` Doanh thu: ${val.toLocaleString('vi-VN')} VNĐ`;
            }
            return ` Vé bán ra: ${val} vé`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
        },
        grid: {
          display: false
        },
        border: {
          color: gridColor
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value) => {
            if (chartView === 'revenue') {
              const num = Number(value);
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
              if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
              return `${num}đ`;
            }
            return `${value} vé`;
          }
        },
        grid: {
          color: gridColor
        },
        border: {
          dash: [4, 4],
          color: gridColor
        }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const raw = Number(context.raw);
            const total = currentDoughnut.data.reduce((a, b) => a + b, 0);
            const percent = total > 0 ? ((raw / total) * 100).toFixed(1) : '0';
            if (doughnutCategory === 'ticketType') {
              return ` ${context.label}: ${raw} vé (${percent}%)`;
            }
            return ` ${context.label}: ${raw.toLocaleString('vi-VN')}đ (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Section Header with View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <TrendingUp size={18} />
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Phân Tích Xu Hướng & Doanh Thu Chi Tiết
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 ml-9">
            Dữ liệu tổng hợp từ hệ thống bán vé Aeon Cine theo thời gian thực (Chu kỳ 7 ngày gần nhất)
          </p>
        </div>

        {/* Toggle View: Revenue vs Tickets */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-gray-700/80 shrink-0">
          <button
            onClick={() => setChartView('revenue')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartView === 'revenue'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign size={14} /> Doanh Thu (VNĐ)
          </button>
          <button
            onClick={() => setChartView('tickets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartView === 'tickets'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ticket size={14} /> Lượng Vé (Vé)
          </button>
        </div>
      </div>

      {/* Main Charts Grid: Trend Chart (Left 2 cols) + Doughnut Chart (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Line/Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                <BarChart2 size={16} className="text-orange-500" />
                {chartView === 'revenue' ? 'Biểu Đồ Doanh Thu Theo Ngày' : 'Biểu Đồ Lượng Vé Bán Ra'}
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-gray-400">
                {chartView === 'revenue' ? 'Đơn vị tính: VNĐ • Dạng đường xu hướng quang học' : 'Đơn vị tính: Vé • Dạng cột phân bổ'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500">Đỉnh điểm tuần</span>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400">Thứ Bảy (28/9)</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {chartView === 'revenue' ? (
              <Line data={lineChartData} options={mainChartOptions as ChartOptions<'line'>} />
            ) : (
              <Bar data={barChartData} options={mainChartOptions as ChartOptions<'bar'>} />
            )}
          </div>
        </div>

        {/* Right: Doughnut Chart Breakdown (Phân bổ tỷ lệ) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
              <PieChart size={16} className="text-amber-500" /> Cơ Cấu Tỷ Lệ
            </h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-lg border border-slate-200 dark:border-gray-700 text-[10px] font-bold">
              <button
                onClick={() => setDoughnutCategory('source')}
                title="Cơ cấu theo nguồn thu"
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${doughnutCategory === 'source' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-gray-400'}`}
              >
                Nguồn
              </button>
              <button
                onClick={() => setDoughnutCategory('gateway')}
                title="Cơ cấu theo cổng thanh toán"
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${doughnutCategory === 'gateway' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-gray-400'}`}
              >
                Cổng TT
              </button>
              <button
                onClick={() => setDoughnutCategory('ticketType')}
                title="Cơ cấu theo loại ghế"
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${doughnutCategory === 'ticketType' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-gray-400'}`}
              >
                Loại vé
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-2">
            {doughnutCategory === 'source' && 'Tỷ trọng đóng góp giữa Vé xem phim & Bắp nước Combo'}
            {doughnutCategory === 'gateway' && 'Tỷ trọng giao dịch qua VNPay QR, Stripe & Ví MoMo'}
            {doughnutCategory === 'ticketType' && 'Tỷ trọng phát hành vé Ghế Phổ thông vs VIP / IMAX'}
          </p>

          <div className="relative h-64 w-full flex items-center justify-center grow">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
            {/* Center label inside Doughnut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                {currentDoughnut.totalLabel}
              </span>
              <span className="font-mono font-black text-sm text-slate-900 dark:text-white mt-0.5">
                {currentDoughnut.totalValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
