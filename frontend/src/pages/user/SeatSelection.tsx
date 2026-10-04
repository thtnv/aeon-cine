import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Award, Sparkles, Heart, Gift, Calendar, MapPin, Search, Clock, X, Volume2, Film, Star, RotateCcw, ShieldAlert, LogOut } from 'lucide-react';
import { API_URL } from '../../config/api';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

// Dynamic Seat Pricing function based on seat tier & projection format (2D, 3D, IMAX)
const getSeatInfo = (seatId: string, format: '2D' | '3D' | 'IMAX' = '2D') => {
  const row = seatId.charAt(0);
  if (row === 'H') {
    if (format === 'IMAX') {
      return { type: 'SWEETBOX', name: 'Ghế Đôi IMAX VIP Recliner', price: 290000 };
    } else if (format === '3D') {
      return { type: 'SWEETBOX', name: 'Ghế Đôi Sweetbox 3D', price: 240000 };
    }
    return { type: 'SWEETBOX', name: 'Ghế Đôi Sweetbox', price: 210000 };
  } else if (['C', 'D', 'E', 'F', 'G'].includes(row)) {
    if (format === 'IMAX') {
      return { type: 'VIP', name: 'Ghế IMAX Prime', price: 185000 };
    } else if (format === '3D') {
      return { type: 'VIP', name: 'Ghế VIP Dolby Atmos', price: 135000 };
    }
    return { type: 'VIP', name: 'Ghế VIP', price: 110000 };
  }

  if (format === 'IMAX') {
    return { type: 'STANDARD', name: 'Ghế IMAX Standard', price: 155000 };
  } else if (format === '3D') {
    return { type: 'STANDARD', name: 'Ghế Thường 3D', price: 115000 };
  }
  return { type: 'STANDARD', name: 'Ghế Thường', price: 95000 };
};

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialShowtimeId = searchParams.get('showtimeId') || '';
  const initialCinemaId = searchParams.get('cinemaId') || '';

  const [step, setStep] = useState(initialShowtimeId ? 2 : 1);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>(initialShowtimeId);
  const [viewFormat, setViewFormat] = useState<'2D' | '3D' | 'IMAX'>('2D');
  const [showtimesList, setShowtimesList] = useState<any[]>([]);
  const [cinema, setCinema] = useState('Aeon Cine Tân Phú');
  const [, setSelectedCinemaId] = useState(initialCinemaId);
  const [time, setTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [foodList, setFoodList] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<{ [key: string]: number }>({});
  
  // User Points & Voucher
  const [userPoints, setUserPoints] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  // Movie Details & Filters for Step 1
  const [movieData, setMovieData] = useState<any>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [cinemaSearch, setCinemaSearch] = useState<string>('');

  // AUTH GUARD: Bắt buộc đăng nhập trước khi vào luồng đặt vé và chọn ghế
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const redirectUrl = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!movieId) return;
    fetch(`${API_URL}/api/movies/${movieId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setMovieData(data);
          if (data.title) setMovieTitle(data.title);
        }
      })
      .catch(() => {});
  }, [movieId]);

  // Danh sách các ngày có suất chiếu (sắp xếp tăng dần theo thời gian)
  const availableDates = Array.from(
    new Set(
      showtimesList.map(st => {
        const d = new Date(st.startTime);
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Ho_Chi_Minh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(d);
      })
    )
  ).sort();

  // Tự động chọn ngày đầu tiên nếu chưa chọn ngày
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Danh sách các tỉnh/thành phố có rạp chiếu
  const availableCities = Array.from(
    new Set(
      showtimesList
        .filter(st => st.room?.cinema?.city)
        .map(st => st.room.cinema.city)
    )
  ).sort();

  // Mặc định chọn TP.Hồ Chí Minh nếu có, hoặc thành phố đầu tiên
  useEffect(() => {
    if (availableCities.length > 0 && selectedCity === 'ALL') {
      const hcm = availableCities.find((c: string) => c.toLowerCase().includes('hồ chí minh'));
      if (hcm) {
        setSelectedCity(hcm);
      } else {
        setSelectedCity(availableCities[0]);
      }
    }
  }, [availableCities]);

  // Format nhãn ngày hiển thị (Hôm nay, Thứ trong tuần, Ngày/Tháng)
  const formatDayBadge = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const today = new Date();
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month - 1 &&
        today.getDate() === day;

      const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayLabel = isToday ? 'Hôm nay' : dayNames[d.getDay()];
      const dateFormatted = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
      return { dayLabel, dateFormatted, isToday };
    } catch {
      return { dayLabel: 'Ngày', dateFormatted: dateStr, isToday: false };
    }
  };

  // Lọc danh sách suất chiếu theo ngày, thành phố và từ khóa tìm kiếm
  const filteredShowtimes = showtimesList.filter(st => {
    if (selectedDate) {
      const stDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(st.startTime));
      if (stDate !== selectedDate) return false;
    }

    if (selectedCity && selectedCity !== 'ALL') {
      if (st.room?.cinema?.city !== selectedCity) return false;
    }

    if (cinemaSearch.trim()) {
      const cName = st.room?.cinema?.name?.toLowerCase() || '';
      if (!cName.includes(cinemaSearch.trim().toLowerCase())) return false;
    }

    return true;
  });

  // Nhóm suất chiếu theo Cụm Rạp -> Định dạng chiếu
  interface CinemaShowtimesGroup {
    cinema: any;
    formats: Record<string, any[]>;
  }

  const groupedCinemas = filteredShowtimes.reduce((acc: Record<string, CinemaShowtimesGroup>, st) => {
    const c = st.room?.cinema;
    if (!c) return acc;
    if (!acc[c.id]) {
      acc[c.id] = { cinema: c, formats: {} };
    }
    let formatLabel = st.format || '2D Digital';
    if (formatLabel === '2D') formatLabel = '2D Digital';
    else if (formatLabel === '3D') formatLabel = '3D Atmos';
    else if (formatLabel === 'IMAX') formatLabel = 'IMAX Laser';

    const fmt = `${formatLabel} ${st.language || 'Phụ đề'}`;
    if (!acc[c.id].formats[fmt]) {
      acc[c.id].formats[fmt] = [];
    }
    acc[c.id].formats[fmt].push(st);
    return acc;
  }, {});

  // Fetch logged in user profile to get real points
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.rewardPoints === 'number') {
            setUserPoints(data.rewardPoints);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch showtimes for this movie from database
  useEffect(() => {
    if (!movieId) return;
    fetch(`${API_URL}/api/showtimes/movie/${movieId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setShowtimesList(data);
          const target = initialShowtimeId
            ? data.find(st => st.id === initialShowtimeId) || data[0]
            : data[0];
          if (target) {
            setSelectedShowtimeId(target.id);
            if (target.room?.cinema) {
              setCinema(target.room.cinema.name);
              setSelectedCinemaId(target.room.cinema.id);
            }
            const f = (target.format || '').toUpperCase();
            if (f.includes('IMAX')) setViewFormat('IMAX');
            else if (f.includes('3D')) setViewFormat('3D');
            else setViewFormat('2D');

            const tStr = new Date(target.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            setTime(`${tStr} (${target.format || '2D'} - ${target.language || 'Phụ đề'})`);
          }
        }
      })
      .catch(() => {});
  }, [movieId, initialShowtimeId]);

  // Fetch occupied seats for selected showtime dynamically from DB
  useEffect(() => {
    if (!selectedShowtimeId) {
      setOccupiedSeats([]);
      return;
    }
    const fetchOccupied = () => {
      fetch(`${API_URL}/api/showtimes/${selectedShowtimeId}/occupied-seats`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.occupiedSeats)) {
            setOccupiedSeats(data.occupiedSeats);
          }
        })
        .catch(err => console.error('Error fetching occupied seats:', err));
    };

    fetchOccupied();
    const interval = setInterval(fetchOccupied, 8000);
    return () => clearInterval(interval);
  }, [selectedShowtimeId]);

  // Fetch food combos from backend
  useEffect(() => {
    fetch(`${API_URL}/api/food`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFoodList(data);
        } else {
          setFoodList([
            { id: 'f1', name: 'Combo 1 Big', description: '1 Bắp lớn + 1 Nước lớn', price: 89000, imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=150&q=80' },
            { id: 'f2', name: 'Combo 2 Big (Couple)', description: '1 Bắp lớn + 2 Nước lớn', price: 109000, imageUrl: 'https://images.unsplash.com/photo-1572177191856-3cbde6181226?w=150&q=80' }
          ]);
        }
      })
      .catch(() => {
        setFoodList([
          { id: 'f1', name: 'Combo 1 Big', description: '1 Bắp lớn + 1 Nước lớn', price: 89000, imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=150&q=80' },
          { id: 'f2', name: 'Combo 2 Big (Couple)', description: '1 Bắp lớn + 2 Nước lớn', price: 109000, imageUrl: 'https://images.unsplash.com/photo-1572177191856-3cbde6181226?w=150&q=80' }
        ]);
      });
  }, []);

  const handleSeatClick = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      if (selectedSeats.length >= 8) {
        alert("Bạn chỉ được chọn tối đa 8 ghế!");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const updateFoodQuantity = (foodId: string, delta: number) => {
    setSelectedFoods(prev => {
      const currentQty = prev[foodId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [foodId]: newQty };
    });
  };

  // Calculate totals
  const seatsTotal = selectedSeats.reduce((sum, seatId) => sum + getSeatInfo(seatId, viewFormat).price, 0);
  const foodsTotal = foodList.reduce((sum, food) => {
    const qty = selectedFoods[food.id] || 0;
    return sum + qty * food.price;
  }, 0);
  const subTotal = seatsTotal + foodsTotal;

  const voucherDiscount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const pointsDiscount = pointsToUse * 100; // 100 điểm = 10.000đ
  const totalDiscount = voucherDiscount + pointsDiscount;
  const finalTotalAmount = Math.max(0, subTotal - totalDiscount);

  // Apply Voucher API
  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setVoucherMessage('');
    try {
      const res = await fetch(`${API_URL}/api/vouchers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCodeInput, orderTotal: subTotal })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedVoucher({ code: data.voucherCode, discountAmount: data.discountAmount });
        setVoucherMessage(`✅ Đã áp dụng mã ${data.voucherCode}! Giảm ${data.discountAmount.toLocaleString()}đ`);
      } else {
        setVoucherMessage(`❌ ${data.message}`);
      }
    } catch {
      setVoucherMessage('❌ Không thể kết nối đến máy chủ áp dụng voucher');
    }
  };

  // Hold Seats API when advancing from Step 2
  const handleNextStep = async () => {
    if (step === 1 && !time) return alert("Vui lòng chọn suất chiếu!");
    if (step === 2 && selectedSeats.length === 0) return alert("Vui lòng chọn ít nhất 1 ghế!");
    
    if (step === 2) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/seathold/hold`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            showtimeId: selectedShowtimeId || (showtimesList[0] ? showtimesList[0].id : (movieId || 'demo-showtime')),
            seatIds: selectedSeats,
            userId: 'user-demo-id'
          })
        });
      } catch (err) {
        console.error('Error holding seats:', err);
      }
    }

    setStep(prev => prev + 1);
  };

  // Submit Payment API
  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const foodItemsPayload = Object.keys(selectedFoods)
        .filter(foodId => selectedFoods[foodId] > 0)
        .map(foodId => {
          const food = foodList.find(f => f.id === foodId);
          return {
            foodId,
            quantity: selectedFoods[foodId],
            price: food ? food.price : 0
          };
        });

      // Get real logged in user ID from localStorage
      let effectiveUserId = '';
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if ((userObj.role || '').toUpperCase() === 'ACCOUNTANT') {
            alert('Tài khoản công vụ Kế toán không được phép đặt vé xem phim theo quy định kiểm soát nội bộ rạp chiếu phim.');
            setIsProcessing(false);
            return;
          }
          effectiveUserId = userObj.id || '';
        } catch {}
      }

      // Create Booking
      const bookingRes = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: effectiveUserId || undefined,
          showtimeId: selectedShowtimeId || (showtimesList[0] ? showtimesList[0].id : movieId),
          seatIds: selectedSeats,
          foodItems: foodItemsPayload,
          voucherCode: appliedVoucher ? appliedVoucher.code : null,
          discountAmount: totalDiscount,
          pointsUsed: pointsToUse,
          paymentMethod,
          total: finalTotalAmount
        })
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok || !bookingData || !bookingData.id) {
        alert(bookingData?.message || 'Có lỗi xảy ra khi tạo đơn hàng!');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === 'STRIPE') {
        // Create Stripe Checkout Session & Redirect
        const payRes = await fetch(`${API_URL}/api/payment/create-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: bookingData.id, paymentMethod: 'STRIPE' })
        });
        const payData = await payRes.json();
        if (payData && payData.paymentUrl) {
          window.location.href = payData.paymentUrl;
          return;
        } else {
          alert(payData?.message || 'Không thể khởi tạo cổng thanh toán Stripe. Vui lòng thử lại!');
          return;
        }
      } else if (paymentMethod === 'VNPAY') {
        // Create signed VNPay URL
        await fetch(`${API_URL}/api/payment/create-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: bookingData.id, paymentMethod })
        });

        // Confirm Payment & Get QR for local demo flow
        const confirmRes = await fetch(`${API_URL}/api/payment/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: bookingData.id, paymentMethod })
        });
        const confirmData = await confirmRes.json();

        setCompletedBooking(confirmData.booking || bookingData);
        setStep(6);
      } else {
        // Confirm Payment & Get QR directly
        const confirmRes = await fetch(`${API_URL}/api/payment/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: bookingData.id, paymentMethod })
        });
        const confirmData = await confirmRes.json();

        setCompletedBooking(confirmData.booking || bookingData);
        setStep(6);
      }
    } catch (error) {
      alert('Có lỗi xảy ra trong quá trình xử lý thanh toán!');
    } finally {
      setIsProcessing(false);
    }
  };


  const steps = [
    "1. Suất chiếu", "2. Chọn ghế", "3. Bắp nước", 
    "4. Xác nhận", "5. Thanh toán", "6. Nhận vé"
  ];

  // INTERNAL CONTROL GUARD: Tài khoản công vụ Kế toán không được phép đặt vé xem phim
  // (Tuân thủ chuẩn kiểm toán nội bộ rạp chiếu phim Galaxy Cinema / CGV & Segregation of Duties)
  const userStr = localStorage.getItem('user');
  let isAccountant = false;
  let accountantName = '';
  let accountantEmail = '';
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if ((u.role || '').toUpperCase() === 'ACCOUNTANT') {
        isAccountant = true;
        accountantName = u.name || '';
        accountantEmail = u.email || '';
      }
    } catch {}
  }

  if (isAccountant) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 animate-[fadeIn_0.3s_ease-out]">
        <div className="max-w-lg w-full cinema-glass rounded-3xl p-8 sm:p-10 border border-emerald-500/30 text-center shadow-2xl relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
            <ShieldAlert size={34} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            Quy Định Kiểm Soát Nội Bộ (Internal Controls)
          </span>

          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight mb-3">
            Tài Khoản Kế Toán Không Có Quyền Đặt Vé
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
            Bạn đang đăng nhập bằng tài khoản công vụ <strong className="text-white font-mono">{accountantEmail || accountantName || 'Kế Toán'}</strong>. 
            Theo chuẩn vận hành rạp chiếu phim (Galaxy Cinema, CGV) và nguyên tắc phân tách trách nhiệm kiểm toán (<span className="text-emerald-300 font-semibold">Segregation of Duties</span>), nhân sự Kế toán không được phép sử dụng tài khoản công vụ để mua vé xem phim cá nhân nhằm ngăn ngừa rủi ro xung đột lợi ích.
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span>💡 Hướng dẫn nghiệp vụ:</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Quý nhân sự có nhu cầu xem phim cá nhân vui lòng bấm <strong className="text-white">"Đăng Xuất Công Vụ"</strong> và đăng nhập/đăng ký bằng tài khoản Khách hàng cá nhân như mọi khán giả khác.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/accountant')}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Về Cổng Kế Toán</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('user-updated'));
                navigate('/login');
              }}
              className="flex-1 px-5 py-3 rounded-xl cinema-btn-glass text-xs font-semibold text-gray-300 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Đăng Xuất Công Vụ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-5xl animate-[fadeIn_0.5s_ease-out]">
      {/* Wizard Header / Steps Indicator */}
      <div className="w-full mb-10 overflow-x-auto pb-2">
        <div className="flex justify-between items-center min-w-[620px] p-2 cinema-glass rounded-2xl border border-white/[0.08]">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step > stepNumber;
            return (
              <div
                key={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : isCompleted
                    ? 'text-white/80'
                    : 'text-white/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'cinema-btn-primary shadow-sm'
                      : isCompleted
                      ? 'bg-white/10 text-white'
                      : 'bg-white/[0.04] text-white/30'
                  }`}
                >
                  {isCompleted ? '✓' : `0${stepNumber}`}
                </div>
                <span className="text-xs font-display font-bold uppercase tracking-wider">{label.substring(3)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cinema-glass rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/[0.04] blur-[120px] pointer-events-none rounded-full" />
        
        {/* STEP 1: Cinema & Showtime - Redesigned Galaxy Cinema Style */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.3s_ease-in-out] space-y-7">
            {/* Movie Overview Header */}
            {movieData && (
              <div className="cinema-glass-subtle rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-lg">
                <img
                  src={movieData.posterUrl || 'https://via.placeholder.com/150'}
                  alt={movieData.title}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-xl border border-white/10 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {movieData.ageRating || 'T18'}
                    </span>
                    <span className="font-mono text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                      {movieData.duration || 120} phút
                    </span>
                    <span className="text-xs text-white/50 font-medium">
                      {movieData.genre || 'Hành động, Tâm lý'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight truncate">
                    {movieData.title}
                  </h2>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1.5 max-w-2xl leading-relaxed">
                    {movieData.description}
                  </p>
                  <p className="text-[11px] text-amber-400/80 font-mono mt-2">
                    Diễn viên: <span className="text-white/70">{movieData.actors || 'Đang cập nhật'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* 1. Date Selector Rail (Chuẩn Galaxy Cinema) */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5 font-display">
                  <Calendar size={14} className="text-amber-400" />
                  <span>Chọn Ngày Chiếu</span>
                </h3>
                <span className="text-[11px] text-amber-300 font-mono">
                  {availableDates.length} ngày có suất
                </span>
              </div>

              {availableDates.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
                  {availableDates.map(dateStr => {
                    const { dayLabel, dateFormatted, isToday } = formatDayBadge(dateStr);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`min-w-[88px] sm:min-w-[100px] py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer shrink-0 ${
                          isSelected
                            ? 'cinema-btn-primary shadow-lg shadow-amber-500/25 scale-[1.02]'
                            : 'cinema-glass-subtle text-white/70 hover:text-white hover:border-amber-500/40 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`text-[11px] font-medium leading-none mb-1 ${isSelected ? 'text-slate-950 font-bold' : isToday ? 'text-amber-400 font-semibold' : 'text-white/60'}`}>
                          {dayLabel}
                        </span>
                        <span className={`font-mono text-xs font-extrabold tracking-tight ${isSelected ? 'text-slate-950 font-black' : 'text-white'}`}>
                          {dateFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl cinema-glass-subtle text-xs text-white/50 text-center">
                  Hiện chưa có lịch chiếu cho phim này.
                </div>
              )}
            </div>

            {/* 2. City Filter & Quick Search Bar */}
            <div className="cinema-glass-subtle rounded-2xl p-3 sm:p-4 border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* City Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-white/60 flex items-center gap-1 shrink-0">
                  <MapPin size={13} className="text-amber-400" /> Khu vực:
                </span>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="bg-black/50 border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả Tỉnh / Thành ({availableCities.length})</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {selectedCity !== 'ALL' && (
                  <button
                    onClick={() => setSelectedCity('ALL')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>

              {/* Quick Cinema Search Input */}
              <div className="relative sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={cinemaSearch}
                  onChange={e => setCinemaSearch(e.target.value)}
                  placeholder="Tìm rạp (vd: Quang Trung, Tân Bình...)"
                  className="w-full bg-black/40 border border-white/15 text-white rounded-xl pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-amber-500 placeholder:text-white/40"
                />
                {cinemaSearch && (
                  <button
                    onClick={() => setCinemaSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Grouped Showtimes By Cinema (Galaxy Cinema style) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest font-display">
                  Danh Sách Cụm Rạp & Suất Chiếu
                </h3>
                <span className="text-[11px] text-white/40 font-mono">
                  Bấm giờ chiếu để chọn ghế
                </span>
              </div>

              {Object.keys(groupedCinemas).length > 0 ? (
                <div className="space-y-3.5">
                  {Object.values(groupedCinemas).map(({ cinema: c, formats }) => (
                    <div
                      key={c.id}
                      className="cinema-glass-subtle rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-md group"
                    >
                      {/* Cinema Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-white/[0.06] mb-3.5">
                        <div className="flex items-start sm:items-center gap-2">
                          <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                          <div>
                            <h4 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                              {c.name}
                            </h4>
                            <p className="text-[11px] text-white/50 truncate max-w-lg mt-0.5">
                              {c.address || c.city}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300/90 border border-white/10 self-start sm:self-center">
                          {c.city}
                        </span>
                      </div>

                      {/* Showtime Format & Hours */}
                      <div className="space-y-3">
                        {Object.entries(formats).map(([fmt, list]) => (
                          <div key={fmt} className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <span className="text-[11px] font-mono font-semibold text-amber-300/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 sm:w-28 shrink-0 text-center sm:text-left">
                              {fmt}
                            </span>
                            <div className="flex flex-wrap gap-2 flex-1">
                              {list.map((st: any) => {
                                const d = new Date(st.startTime);
                                const tStr = d.toLocaleTimeString('vi-VN', {
                                  timeZone: 'Asia/Ho_Chi_Minh',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                                const isSelected = selectedShowtimeId === st.id;
                                return (
                                  <button
                                    key={st.id}
                                    onClick={() => {
                                      setSelectedShowtimeId(st.id);
                                      setCinema(c.name);
                                      setSelectedCinemaId(c.id);
                                      const f = (st.format || '').toUpperCase();
                                      if (f.includes('IMAX')) setViewFormat('IMAX');
                                      else if (f.includes('3D')) setViewFormat('3D');
                                      else setViewFormat('2D');
                                      setTime(`${tStr} (${st.format || '2D'} - ${st.language || 'Phụ đề'})`);
                                      // 1-Click chuyển ngay sang Bước 02 Chọn Ghế
                                      setStep(2);
                                    }}
                                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                                      isSelected
                                        ? 'cinema-btn-primary shadow-lg shadow-amber-500/30 scale-105'
                                        : 'bg-white/[0.03] hover:bg-amber-500/15 text-white/90 hover:text-amber-300 border-white/10 hover:border-amber-500/40 hover:scale-105'
                                    }`}
                                    title={`Đặt vé suất ${tStr} tại ${c.name}`}
                                  >
                                    <Clock size={11} className="text-amber-400" />
                                    <span>{tStr}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cinema-glass-subtle rounded-2xl p-8 border border-white/[0.08] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                    <Calendar size={22} />
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">Không tìm thấy suất chiếu phù hợp</h4>
                  <p className="text-xs text-white/50 max-w-md mx-auto">
                    Không có suất chiếu nào tại khu vực <strong>{selectedCity === 'ALL' ? 'đã chọn' : selectedCity}</strong> trong ngày này. Bạn hãy thử chọn ngày khác hoặc đổi khu vực nhé.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    {selectedCity !== 'ALL' && (
                      <button
                        onClick={() => setSelectedCity('ALL')}
                        className="cinema-btn-glass px-4 py-2 rounded-xl text-xs font-semibold"
                      >
                        Xem tất cả khu vực
                      </button>
                    )}
                    {availableDates.length > 0 && selectedDate !== availableDates[0] && (
                      <button
                        onClick={() => setSelectedDate(availableDates[0])}
                        className="cinema-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Xem ngày hôm nay
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Seat Selection (Thường, VIP, Sweetbox) */}
        {step === 2 && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>BƯỚC 02 • CHỌN GHẾ NGỒI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-normal mb-3">
                Sơ Đồ Ghế Phòng Chiếu
              </h2>

              {/* Context info bar: Cinema, Room, Showtime, Countdown timer */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300 font-medium max-w-2xl mx-auto mb-4">
                {movieTitle && (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold truncate max-w-[220px]" title={movieTitle}>
                      {movieTitle}
                    </span>
                    <span className="text-slate-400 dark:text-white/30">•</span>
                  </>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold">
                  {cinema || 'Aeon Cine Tân Phú'}
                </span>
                <span className="text-slate-300 dark:text-white/30">•</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-bold">
                  {time || 'Suất chiếu tiêu chuẩn'}
                </span>
                <span className="text-slate-300 dark:text-white/30">•</span>
                <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${
                  viewFormat === 'IMAX'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : viewFormat === '3D'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/10 text-white border-white/20'
                }`}>
                  {viewFormat === 'IMAX' ? 'Phòng 03 (IMAX Laser)' : viewFormat === '3D' ? 'Phòng 02 (3D Atmos)' : 'Phòng 01 (Digital 2D)'}
                </span>
                <span className="text-slate-300 dark:text-white/30">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold flex items-center gap-1">
                  ⏱️ Giữ ghế trong 5:00
                </span>
              </div>

              {/* CÔNG NGHỆ PHÒNG CHIẾU CỐ ĐỊNH THEO SUẤT ĐÃ CHỌN (Khóa cố định chuẩn rạp chiếu phim) */}
              <div className="flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto cinema-glass-subtle px-4 py-2.5 rounded-2xl border border-white/10 shadow-sm text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    viewFormat === 'IMAX'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : viewFormat === '3D'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {viewFormat === 'IMAX' ? <Sparkles size={16} /> : viewFormat === '3D' ? <Volume2 size={16} /> : <Film size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs tracking-wide uppercase">
                        {viewFormat === 'IMAX' ? 'Định dạng: IMAX Laser Dual 4K' : viewFormat === '3D' ? 'Định dạng: 3D Dolby Atmos' : 'Định dạng: 2D Digital Tiêu Chuẩn'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-bold">
                        {viewFormat === 'IMAX' ? 'Màn vòm 18m' : viewFormat === '3D' ? 'Kính 3D RealD' : 'Laser 4K'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 hidden sm:block mt-0.5">
                      {viewFormat === 'IMAX'
                        ? 'Sơ đồ ghế khán đài dốc parabol hướng tâm màn hình vòm khổng lồ'
                        : viewFormat === '3D'
                        ? 'Trang bị vùng âm thanh vòm Dolby Atmos đa chiều với màn chiếu bạc Silver Screen'
                        : 'Màn chiếu độ phân giải cao DCI 4K, bố cục 2 dãy ghế lối đi trung tâm'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-105"
                  title="Quay lại Bước 1 để chọn suất chiếu hoặc định dạng khác"
                >
                  <RotateCcw size={13} />
                  <span>Đổi suất chiếu</span>
                </button>
              </div>
            </div>
            
            {/* FORMAT-SPECIFIC PROJECTOR SCREEN */}
            {viewFormat === '2D' && (
              /* 2D STANDARD SCREEN */
              <div className="w-full max-w-2xl mx-auto mb-10 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="w-full h-8 border-t-[3px] border-amber-400/90 rounded-[50%/100%_100%_0_0] shadow-[0_-16px_32px_rgba(245,158,11,0.25)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-amber-400/5 to-transparent pointer-events-none" />
                </div>
                <div className="flex items-center justify-center gap-2 -mt-4 relative z-10">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/30"></span>
                  <p className="text-white/70 font-mono tracking-[0.3em] text-[11px] uppercase font-bold">
                    MÀN HÌNH CHIẾU 2D DIGITAL • TIÊU CHUẨN
                  </p>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/30"></span>
                </div>
              </div>
            )}

            {viewFormat === '3D' && (
              /* 3D SILVER SCREEN & DOLBY ATMOS */
              <div className="w-full max-w-2xl mx-auto mb-10 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="w-full h-9 border-t-[3px] border-cyan-400 rounded-[50%/100%_100%_0_0] shadow-[0_-18px_36px_rgba(6,182,212,0.35)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-cyan-400/5 to-transparent pointer-events-none" />
                </div>
                <div className="flex items-center justify-center gap-2 -mt-4 relative z-10">
                  <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400/60"></span>
                  <p className="text-cyan-400 font-mono tracking-[0.25em] text-[11px] uppercase font-extrabold flex items-center gap-1.5">
                    <Film size={13} className="text-cyan-400" />
                    <span>MÀN BẠC SILVER SCREEN 3D • DOLBY ATMOS 360°</span>
                  </p>
                  <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/60"></span>
                </div>
                <p className="text-[10px] text-cyan-300/80 font-mono mt-1">
                  Khoảng cách xem 3D tối ưu: Các hàng giữa C-F giúp mắt điều tiết tự nhiên khi đeo kính 3D
                </p>
              </div>
            )}

            {viewFormat === 'IMAX' && (
              /* IMAX MASSIVE CURVED FLOOR-TO-CEILING SCREEN */
              <div className="w-full max-w-3xl mx-auto mb-12 text-center animate-[fadeIn_0.3s_ease-out]">
                <div className="w-full h-12 border-t-[4px] border-amber-400 rounded-[50%/100%_100%_0_0] shadow-[0_-24px_50px_rgba(245,158,11,0.5)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 via-orange-500/10 to-transparent pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-white blur-sm rounded-full" />
                </div>
                <div className="flex items-center justify-center gap-2 -mt-5 relative z-10">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/80"></span>
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/80 border border-amber-500/40 shadow-lg shadow-amber-500/20">
                    <Sparkles size={13} className="text-amber-400" />
                    <span className="text-amber-300 font-mono tracking-[0.25em] text-xs uppercase font-black">
                      IMAX LASER DUAL 4K • MÀN HÌNH VÒM KHỔNG LỒ 18M
                    </span>
                  </div>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/80"></span>
                </div>
                <p className="text-[10px] text-amber-300/80 font-mono mt-1.5">
                  Khán đài dốc Stadium Seating • Bố cục ghế vòm cung bao trọn tầm nhìn ngoại vi
                </p>
              </div>
            )}

            {/* SEATS GRID CONTAINER */}
            <div className="w-full overflow-x-auto mb-10 pb-4">
              <div className="min-w-[650px] flex flex-col gap-2.5 items-center">
                {SEAT_ROWS.map(row => {
                  const isSweetboxRow = row === 'H';
                  const isVipRow = ['C', 'D', 'E', 'F', 'G'].includes(row);

                  return (
                    <div key={row} className="flex justify-center items-center gap-2 sm:gap-2.5 relative">
                      {/* Left Row Indicator */}
                      <span className={`font-mono font-bold w-5 text-center text-xs ${
                        isSweetboxRow 
                          ? 'text-rose-400' 
                          : isVipRow 
                          ? viewFormat === '3D' ? 'text-cyan-400' : 'text-amber-400'
                          : 'text-slate-400 dark:text-white/40'
                      }`}>
                        {row}
                      </span>
                      
                      {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                        const seatId = `${row}${i + 1}`;
                        const isSelected = selectedSeats.includes(seatId);
                        const isOccupied = occupiedSeats.includes(seatId);
                        const seatInfo = getSeatInfo(seatId, viewFormat);

                        // Format-specific Special Zones:
                        // 1. In IMAX: Seats 4, 5, 6, 7 on rows D, E, F are IMAX Golden Circle Prime
                        const isImaxGoldenCircle = viewFormat === 'IMAX' && ['D', 'E', 'F'].includes(row) && [3, 4, 5, 6].includes(i);
                        // 2. In 3D: Seats 3 to 8 on rows D, E, F are Dolby Atmos Sweet Spot
                        const is3DAtmosSweetSpot = viewFormat === '3D' && ['D', 'E', 'F'].includes(row) && i >= 2 && i <= 7;

                        // Base seat styles
                        let seatStyles = 'bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-700 dark:bg-slate-800/70 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400/60 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs';
                        
                        if (isVipRow) {
                          if (viewFormat === '3D') {
                            seatStyles = is3DAtmosSweetSpot
                              ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/25 shadow-xs'
                              : 'bg-cyan-500/[0.08] border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20 shadow-xs';
                          } else if (viewFormat === 'IMAX') {
                            seatStyles = isImaxGoldenCircle
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 hover:border-amber-300 hover:bg-amber-500/30 shadow-xs'
                              : 'bg-amber-500/[0.08] border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 shadow-xs';
                          } else {
                            seatStyles = 'bg-amber-50 hover:bg-amber-100 border-amber-300 hover:border-amber-500 text-amber-800 hover:text-amber-900 dark:bg-amber-500/[0.08] dark:border-amber-500/40 dark:text-amber-300 dark:hover:border-amber-400 dark:hover:bg-amber-500/20 shadow-xs';
                          }
                        } else if (isSweetboxRow) {
                          seatStyles = 'bg-rose-50 hover:bg-rose-100 border-rose-300 hover:border-rose-500 text-rose-700 hover:text-rose-900 dark:bg-rose-500/[0.08] dark:border-rose-500/40 dark:text-rose-300 dark:hover:border-rose-400 dark:hover:bg-rose-500/20 shadow-xs';
                        }

                        if (isSelected) {
                          seatStyles = 'cinema-btn-primary scale-110 shadow-lg shadow-amber-500/30 border-amber-300 font-extrabold text-black dark:text-black z-20';
                        } else if (isOccupied) {
                          seatStyles = 'bg-slate-200/70 border-slate-300/80 text-slate-400 opacity-60 cursor-not-allowed dark:bg-white/[0.02] dark:border-white/5 dark:text-white/10 dark:opacity-30';
                        }

                        // LAYOUT DIFFERENCE 1: AISLE CONFIGURATION
                        // In 2D: Central Aisle after seat 5
                        const is2DCenterAisle = viewFormat === '2D' && i === 4;
                        // In 3D: Side Aisles after seat 2 and seat 8
                        const is3DSideAisle = viewFormat === '3D' && (i === 1 || i === 7);
                        // Sweetbox spacing (couple pairs)
                        const isPairEnd = isSweetboxRow && (i % 2 === 1) && i < SEATS_PER_ROW - 1;

                        // LAYOUT DIFFERENCE 2: IMAX CURVED ARC TRANSFORMATION
                        let imaxTransformStyle: React.CSSProperties = {};
                        if (viewFormat === 'IMAX') {
                          // Parabolic curve: outer seats rotate and elevate towards center screen
                          const arcAngles = [11, 7, 4, 2, 0, 0, -2, -4, -7, -11];
                          const arcOffsets = [-8, -5, -3, -1, 0, 0, -1, -3, -5, -8];
                          const angle = arcAngles[i] || 0;
                          const offsetY = arcOffsets[i] || 0;
                          imaxTransformStyle = {
                            transform: `rotate(${angle}deg) translateY(${offsetY}px)`,
                            transformOrigin: 'center bottom'
                          };
                        }

                        return (
                          <div
                            key={seatId}
                            style={imaxTransformStyle}
                            className={`flex items-center transition-transform duration-300 ${
                              isPairEnd 
                                ? 'mr-3 sm:mr-4' 
                                : is2DCenterAisle 
                                ? 'mr-6 sm:mr-8' 
                                : is3DSideAisle 
                                ? 'mr-5 sm:mr-7' 
                                : ''
                            }`}
                          >
                            <button
                              onClick={() => !isOccupied && handleSeatClick(seatId)}
                              disabled={isOccupied}
                              title={`${seatId} - ${seatInfo.name} (${seatInfo.price.toLocaleString()}đ)`}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-t-lg rounded-b-sm border transition-all text-[11px] font-mono font-semibold flex flex-col items-center justify-center relative cursor-pointer ${seatStyles}`}
                            >
                              <span>{i + 1}</span>
                              {isSweetboxRow && <Heart size={8} className="fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400 -mt-0.5" />}
                              {isImaxGoldenCircle && !isSelected && !isOccupied && (
                                <Star size={7} className="fill-amber-400 text-amber-400 absolute -top-1 -right-1" />
                              )}
                            </button>
                          </div>
                        );
                      })}

                      {/* Right Row Indicator */}
                      <span className={`font-mono font-bold w-5 text-center text-xs ${
                        isSweetboxRow 
                          ? 'text-rose-400' 
                          : isVipRow 
                          ? viewFormat === '3D' ? 'text-cyan-400' : 'text-amber-400'
                          : 'text-slate-400 dark:text-white/40'
                      }`}>
                        {row}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FORMAT SPECIFIC SEAT LEGEND */}
            <div className="cinema-glass-subtle py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] max-w-4xl mx-auto shadow-sm mb-8 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-slate-700 dark:text-white/70 font-medium">
                {/* Standard Seat */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[9px] font-mono flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold">
                    A1
                  </div>
                  <span className="whitespace-nowrap text-slate-700 dark:text-white/80">
                    {viewFormat === 'IMAX' ? 'Ghế IMAX Standard' : viewFormat === '3D' ? 'Ghế Thường 3D' : 'Ghế Thường'} (
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {viewFormat === 'IMAX' ? '155k' : viewFormat === '3D' ? '115k' : '95k'}
                    </strong>)
                  </span>
                </div>

                {/* VIP / Prime Seat */}
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-t-md rounded-b-xs text-[9px] font-mono flex items-center justify-center font-bold ${
                    viewFormat === '3D'
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                      : 'bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300'
                  }`}>
                    C1
                  </div>
                  <span className={`whitespace-nowrap ${viewFormat === '3D' ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {viewFormat === 'IMAX' ? 'Ghế IMAX Prime' : viewFormat === '3D' ? 'Ghế VIP Atmos' : 'Ghế VIP'} (
                    <strong className="font-mono">
                      {viewFormat === 'IMAX' ? '185k' : viewFormat === '3D' ? '135k' : '110k'}
                    </strong>)
                  </span>
                </div>

                {/* IMAX Golden Circle (if IMAX) or Sweet Spot (if 3D) */}
                {viewFormat === 'IMAX' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-amber-500/30 border border-amber-400 ring-1 ring-amber-400/50 text-[9px] font-mono flex items-center justify-center text-amber-300 font-black relative">
                      ★
                    </div>
                    <span className="text-amber-300 whitespace-nowrap font-bold">IMAX Golden Circle</span>
                  </div>
                )}

                {viewFormat === '3D' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-cyan-500/25 border border-cyan-300 text-[9px] font-mono flex items-center justify-center text-cyan-200 font-bold">
                      🔊
                    </div>
                    <span className="text-cyan-300 whitespace-nowrap font-bold">Vùng Âm Thanh Atmos</span>
                  </div>
                )}

                {/* Sweetbox Seat */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-5 rounded-t-md rounded-b-xs bg-rose-50 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/50 text-[9px] font-mono flex items-center justify-center text-rose-600 dark:text-rose-300 font-bold">
                    <Heart size={9} className="fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" />
                  </div>
                  <span className="text-rose-600 dark:text-rose-300 whitespace-nowrap">
                    {viewFormat === 'IMAX' ? 'Ghế Đôi IMAX VIP' : 'Sweetbox Đôi'} (
                    <strong className="font-mono">
                      {viewFormat === 'IMAX' ? '290k' : viewFormat === '3D' ? '240k' : '210k'}
                    </strong>)
                  </span>
                </div>

                {/* Selected */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[9px] font-mono flex items-center justify-center shadow-xs">
                    ✓
                  </div>
                  <span className="text-slate-900 dark:text-white font-semibold whitespace-nowrap">Đang chọn</span>
                </div>

                {/* Occupied */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-slate-200/70 dark:bg-white/[0.02] border border-slate-300 dark:border-white/10 text-slate-400 dark:text-white/20 text-[10px] font-mono flex items-center justify-center opacity-60 dark:opacity-40">
                    ✕
                  </div>
                  <span className="text-slate-500 dark:text-white/40 whitespace-nowrap">Đã đặt</span>
                </div>
              </div>
            </div>

            {/* Floating Summary Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-200 dark:border-white/[0.08] pt-6">
              <div>
                <p className="text-slate-500 dark:text-white/50 text-xs uppercase font-mono tracking-wider mb-1">Ghế Đang Chọn ({selectedSeats.length})</p>
                <p className="text-gradient-gold font-display font-bold text-lg">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn vị trí nào'}
                </p>
                {selectedSeats.length > 0 && (
                  <p className="text-xs text-slate-600 dark:text-white/60 mt-0.5 font-mono">
                    Tạm tính: <strong className="text-slate-900 dark:text-white font-bold">{seatsTotal.toLocaleString()} đ</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 sm:flex-none cinema-btn-glass px-5 py-3 rounded-2xl text-xs font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={selectedSeats.length === 0}
                  className="flex-1 sm:flex-none cinema-btn-primary py-3 px-8 rounded-2xl text-xs font-display font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Giữ ghế & Tiếp tục →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Combos */}
        {step === 3 && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <div className="mb-8">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">Bước 03</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase">Bắp Nước & Concession Thượng Hạng</h2>
              <p className="text-white/50 text-xs mt-1">Nâng tầm trải nghiệm điện ảnh với các gói combo bắp rang bơ phô mai và nước giải khát</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {foodList.map(food => {
                const qty = selectedFoods[food.id] || 0;
                return (
                  <div key={food.id} className="cinema-glass-subtle p-4 rounded-2xl border border-white/[0.08] flex items-center gap-4 hover:border-white/15 transition-all">
                    <img src={food.imageUrl} alt={food.name} className="w-20 h-20 object-cover rounded-xl shrink-0 bg-black/40" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-white truncate">{food.name}</h3>
                      <p className="text-white/50 text-xs line-clamp-2 my-1">{food.description}</p>
                      <p className="text-amber-300 font-mono font-bold text-xs">{food.price.toLocaleString()} đ</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/[0.08]">
                      <button onClick={() => updateFoodQuantity(food.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white text-sm font-bold transition-colors">-</button>
                      <span className="w-5 text-center font-mono text-xs font-bold text-white">{qty}</span>
                      <button onClick={() => updateFoodQuantity(food.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white text-sm font-bold transition-colors">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center border-t border-white/[0.08] pt-6">
              <button onClick={() => setStep(2)} className="cinema-btn-glass px-5 py-3 rounded-2xl text-xs font-semibold">Quay lại</button>
              <button onClick={handleNextStep} className="cinema-btn-primary py-3.5 px-8 rounded-2xl text-xs font-display font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20">
                Xác nhận & Sang bước 4 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm Info, Voucher & REDEEM POINTS */}
        {step === 4 && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <div className="mb-8">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">Bước 04</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase">Xác Nhận Đơn Hàng & Giảm Giá</h2>
            </div>

            <div className="cinema-glass-subtle border border-white/[0.08] rounded-2xl p-6 mb-8">
              <div className="border-b border-white/[0.08] pb-4 mb-4">
                <span className="text-[11px] font-mono uppercase text-white/40 tracking-wider">Thông Tin Suất Chiếu</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">{time}</h3>
                <p className="text-white/60 text-xs">{cinema}</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Ghế ngồi ({selectedSeats.length} vé): <strong className="text-white font-mono">{selectedSeats.join(', ')}</strong></span>
                  <span className="font-mono font-bold text-white">{seatsTotal.toLocaleString()} đ</span>
                </div>
                
                {foodsTotal > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Bắp nước đã chọn</span>
                    <span className="font-mono font-bold text-white">{foodsTotal.toLocaleString()} đ</span>
                  </div>
                )}

                {appliedVoucher && (
                  <div className="flex justify-between items-center text-xs text-emerald-400">
                    <span>Mã giảm giá ({appliedVoucher.code})</span>
                    <span className="font-mono font-bold">-{appliedVoucher.discountAmount.toLocaleString()} đ</span>
                  </div>
                )}

                {pointsToUse > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-300 font-bold">
                    <span>Đổi {pointsToUse} Điểm thưởng</span>
                    <span className="font-mono">-{pointsDiscount.toLocaleString()} đ</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                  <span className="text-sm font-semibold text-white/80">Tổng thanh toán:</span>
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-gradient-gold font-mono">{finalTotalAmount.toLocaleString()} đ</span>
                </div>
              </div>
            </div>

            {/* Voucher Section */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">1. Mã Ưu Đãi / Voucher</h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  placeholder="Nhập mã voucher (vd: AEON20K)..." 
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500 uppercase tracking-wider" 
                />
                <button onClick={handleApplyVoucher} className="cinema-btn-glass px-6 py-3 rounded-2xl text-xs font-semibold">
                  Áp dụng
                </button>
              </div>
              {voucherMessage && <p className="text-xs mt-2 font-mono text-amber-300">{voucherMessage}</p>}
            </div>

            {/* REDEEM REWARD POINTS SECTION - Galaxy Cinema / VIP Member Points Style */}
            <div className="mb-8 bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-orange-500/[0.04] border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      2. Điểm Thưởng Thành Viên (Aeon Star)
                    </h3>
                    <p className="text-[11px] text-amber-300/80 font-medium">
                      Tỷ lệ quy đổi: <span className="font-mono font-bold text-amber-300">1 điểm = 100 VNĐ</span> (100 điểm = 10.000 VNĐ)
                    </p>
                  </div>
                </div>

                {/* Available points badge */}
                <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 shrink-0">
                  <Award size={14} className="text-amber-400" />
                  <span className="text-xs text-slate-300">Điểm hiện có:</span>
                  <span className="text-amber-300 font-mono font-extrabold text-sm">{userPoints} điểm</span>
                </div>
              </div>

              {userPoints === 0 ? (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white/50 flex items-center gap-3">
                  <Gift size={18} className="text-amber-400 shrink-0" />
                  <span>Bạn chưa có điểm tích lũy. Đơn hàng này sẽ giúp bạn tích thêm <strong>+{Math.round(subTotal * 0.05 / 100)} điểm</strong> sau khi xem phim!</span>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {/* Quick Action & Custom Input */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[11px] uppercase font-mono tracking-wider text-white/70 font-semibold">
                          Số điểm muốn sử dụng
                        </label>
                        <span className="text-[11px] font-mono text-white/40">
                          Tối đa: <strong className="text-amber-300 font-bold">{Math.min(userPoints, Math.floor(subTotal / 100))} điểm</strong> (~{(Math.min(userPoints, Math.floor(subTotal / 100)) * 100).toLocaleString()}đ)
                        </span>
                      </div>
                      
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={0}
                          max={Math.min(userPoints, Math.floor(subTotal / 100))}
                          value={pointsToUse || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const maxAllowed = Math.min(userPoints, Math.floor(subTotal / 100));
                            if (val < 0) setPointsToUse(0);
                            else if (val > maxAllowed) setPointsToUse(maxAllowed);
                            else setPointsToUse(Math.floor(val));
                          }}
                          placeholder="Nhập số điểm cần dùng..."
                          className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                        />
                        <span className="absolute right-3 text-xs text-white/40 font-mono">điểm</span>
                      </div>
                    </div>

                    {/* Quick Button Controls */}
                    <div className="flex items-center gap-2 self-end md:self-end">
                      <button
                        type="button"
                        onClick={() => {
                          const maxAllowed = Math.min(userPoints, Math.floor(subTotal / 100));
                          setPointsToUse(maxAllowed);
                        }}
                        className="cinema-btn-primary py-2.5 px-4 text-xs font-bold whitespace-nowrap cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        Dùng Tối Đa ({Math.min(userPoints, Math.floor(subTotal / 100))} điểm)
                      </button>

                      {pointsToUse > 0 && (
                        <button
                          type="button"
                          onClick={() => setPointsToUse(0)}
                          className="cinema-btn-glass py-2.5 px-3 text-xs font-semibold text-red-400 hover:text-red-300 border-red-500/30 whitespace-nowrap cursor-pointer"
                        >
                          Hủy dùng
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Feedback Box */}
                  {pointsToUse > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300 font-medium animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Đã áp dụng <strong className="font-mono font-bold text-white">{pointsToUse} điểm</strong> thưởng</span>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        -{(pointsToUse * 100).toLocaleString()} VNĐ
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-white/[0.08] pt-6">
              <button onClick={() => setStep(3)} className="cinema-btn-glass px-5 py-3 rounded-2xl text-xs font-semibold">Quay lại</button>
              <button onClick={handleNextStep} className="cinema-btn-primary py-3.5 px-8 rounded-2xl text-xs font-display font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20">
                Tiến hành thanh toán →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Payment Method */}
        {step === 5 && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <div className="mb-8">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">Bước 05</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase mb-1">Cổng Thanh Toán Trực Tuyến</h2>
              <p className="text-white/50 text-xs">
                Số tiền cần thanh toán: <strong className="text-gradient-gold font-mono font-bold text-lg">{finalTotalAmount.toLocaleString()} đ</strong>
              </p>
            </div>
            
            <div className="space-y-3 mb-10">
              {[
                { id: 'STRIPE', name: 'Cổng thanh toán quốc tế Stripe (Visa / Mastercard / Apple Pay)', icon: '💳' },
                { id: 'VNPAY', name: 'Cổng thanh toán VNPay (QR Code / Thẻ ATM / Visa)', icon: '💳' },
                { id: 'MOMO', name: 'Ví điện tử MoMo', icon: '📱' },
                { id: 'ZALOPAY', name: 'Ví điện tử ZaloPay', icon: '📱' },
                { id: 'CASH', name: 'Thanh toán trực tiếp tại quầy rạp', icon: '💵' }
              ].map(method => {
                const isSelected = paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500/[0.1] border-amber-500/40 shadow-sm'
                        : 'cinema-glass-subtle border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-amber-500 bg-black/40 border-white/20 focus:ring-amber-500"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-white/80'}`}>{method.name}</span>
                  </label>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center border-t border-white/[0.08] pt-6">
              <button onClick={() => setStep(4)} className="cinema-btn-glass px-5 py-3 rounded-2xl text-xs font-semibold">Quay lại</button>
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="cinema-btn-primary py-4 px-10 rounded-2xl text-xs font-display font-bold uppercase tracking-wider shadow-lg shadow-amber-500/25 disabled:opacity-40"
              >
                {isProcessing ? 'ĐANG XỬ LÝ GIAO DỊCH...' : 'XÁC NHẬN THANH TOÁN NGAY'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: E-Ticket Receipt & QR Code (Luxury Boarding Pass Style) */}
        {step === 6 && completedBooking && (
          <div className="animate-[fadeIn_0.3s_ease-in-out] text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-2xl">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-white/50 text-xs mb-8">Vé điện tử của bạn đã được khởi tạo và lưu vào hệ thống Aeon Cine.</p>

            {/* Boarding Pass Ticket Card */}
            <div className="cinema-glass rounded-3xl max-w-sm mx-auto overflow-hidden border border-white/[0.12] shadow-2xl relative text-left">
              <div className="p-6 border-b border-dashed border-white/15 text-center bg-black/40">
                {completedBooking.qrCodeUrl ? (
                  <img src={completedBooking.qrCodeUrl} alt="QR Code Checkin" className="w-40 h-40 mx-auto rounded-xl p-2 bg-white" />
                ) : (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${completedBooking.ticketCode || 'GLX-102948'}`} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl p-2 bg-white" />
                )}
                <p className="text-[11px] font-mono text-white/40 mt-3">Quét mã QR tại cổng kiểm soát vé</p>
              </div>
              
              <div className="p-6 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Mã Vé Điện Tử</span>
                  <h3 className="text-base font-mono font-extrabold text-gradient-gold uppercase">{completedBooking.ticketCode || 'GLX-849201'}</h3>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Cụm Rạp & Suất Chiếu</span>
                  <p className="text-white/80 font-medium">{cinema}</p>
                  <p className="text-white/60 font-mono">{time}</p>
                </div>
                <div className="flex justify-between border-t border-white/[0.08] pt-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/40">Phương Thức</span>
                    <p className="font-semibold text-white/80">{completedBooking.paymentMethod || paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-white/40">Ghế Đã Đặt</span>
                    <p className="font-mono font-bold text-amber-300">{selectedSeats.join(', ')}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                  <span className="text-white/60">Tổng đã thanh toán</span>
                  <span className="font-mono font-bold text-sm text-gradient-gold">
                    {completedBooking.total ? completedBooking.total.toLocaleString() : finalTotalAmount.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/')} className="mt-8 cinema-btn-glass py-3 px-8 rounded-2xl text-xs font-semibold">
              Quay về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

