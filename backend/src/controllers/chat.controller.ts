import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import prisma from '../prismaClient';

// Khởi tạo Gemini AI (Sẽ tự động lấy GEMINI_API_KEY từ process.env)
const ai = new GoogleGenAI();

// Helper định dạng giờ Việt Nam (UTC+7)
const formatVNTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

const formatVNDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMsg = message.toLowerCase();

    // 1. Lấy dữ liệu cơ bản từ Database
    const [rawMovies, cinemas, promotions, foodCombos] = await Promise.all([
      prisma.movie.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          duration: true,
          ageRating: true,
          director: true,
          description: true,
          movieGenres: { select: { genre: { select: { name: true } } } }
        }
      }),
      prisma.cinema.findMany({
        select: { id: true, name: true, city: true, address: true },
        take: 20
      }),
      prisma.promotion.findMany({
        select: { title: true, badge: true, validUntil: true },
        take: 8
      }),
      prisma.foodCombo.findMany({
        select: { name: true, price: true, description: true }
      })
    ]);

    const movies = rawMovies.map(m => ({
      ...m,
      genre: m.movieGenres?.map(mg => mg.genre.name).join(', ') || 'Đang cập nhật'
    }));

    // 2. Nhận diện phim được hỏi trong câu hỏi của khách
    const matchedMovies = movies.filter(m => {
      const titleLower = m.title.toLowerCase();
      if (lowerMsg.includes(titleLower)) return true;
      const cleanTitle = titleLower.replace(/[:,-]/g, ' ').trim();
      const words = cleanTitle.split(/\s+/).filter(w => w.length > 1);
      const matchCount = words.filter(w => lowerMsg.includes(w)).length;
      return words.length >= 2 ? matchCount >= 2 : matchCount === 1;
    });

    // 3. Truy vấn suất chiếu thực tế
    let targetMovieIds: string[] = [];
    if (matchedMovies.length > 0) {
      targetMovieIds = matchedMovies.map(m => m.id);
    } else {
      const isAskingShowtime = /chiếu|lịch|suất|giờ|khi nào|hôm nay|ngày mai|đặt vé|mua vé/i.test(lowerMsg);
      if (isAskingShowtime) {
        targetMovieIds = movies.filter(m => m.status === 'NOW_SHOWING').slice(0, 5).map(m => m.id);
      }
    }

    let showtimeSummary = '';
    if (targetMovieIds.length > 0) {
      const showtimes = await prisma.showtime.findMany({
        where: {
          movieId: { in: targetMovieIds }
        },
        include: {
          movie: { select: { id: true, title: true } },
          room: {
            select: {
              name: true,
              cinema: {
                select: { name: true, city: true }
              }
            }
          }
        },
        orderBy: { startTime: 'asc' },
        take: 400
      });

      interface GroupedMovieData {
        movieId: string;
        dates: Record<string, Record<string, string[]>>;
      }

      const grouped: Record<string, GroupedMovieData> = {};

      showtimes.forEach(s => {
        const mTitle = s.movie.title;
        const mId = s.movie.id;
        const dStr = formatVNDate(s.startTime);
        const tStr = formatVNTime(s.startTime);
        const cKey = `${s.room.cinema.name} (${s.room.cinema.city})`;

        if (!grouped[mTitle]) {
          grouped[mTitle] = { movieId: mId, dates: {} };
        }
        if (!grouped[mTitle].dates[dStr]) {
          grouped[mTitle].dates[dStr] = {};
        }
        if (!grouped[mTitle].dates[dStr][cKey]) {
          grouped[mTitle].dates[dStr][cKey] = [];
        }

        if (!grouped[mTitle].dates[dStr][cKey].includes(tStr)) {
          grouped[mTitle].dates[dStr][cKey].push(tStr);
        }
      });

      const lines: string[] = [];
      for (const [mTitle, data] of Object.entries(grouped)) {
        lines.push(`Phim: "${mTitle}" (Link đặt vé: /booking/${data.movieId})`);
        const dateEntries = Object.entries(data.dates).slice(0, 3);
        for (const [date, cinemaMap] of dateEntries) {
          lines.push(`  Ngày chiếu: ${date}`);
          const cEntries = Object.entries(cinemaMap).slice(0, 6);
          for (const [cinemaName, times] of cEntries) {
            lines.push(`    - ${cinemaName}: ${times.slice(0, 8).join(', ')}${times.length > 8 ? '...' : ''}`);
          }
        }
      }
      showtimeSummary = lines.join('\n');
    }

    const nowShowingList = movies
      .filter(m => m.status === 'NOW_SHOWING')
      .map(m => `- ${m.title} (${m.ageRating || 'P'} - ${m.duration} phút) | Thể loại: ${m.genre} | Link đặt vé: /booking/${m.id}`)
      .join('\n');

    const comingSoonList = movies
      .filter(m => m.status === 'COMING_SOON')
      .map(m => `- ${m.title} (${m.ageRating || 'P'} - ${m.duration} phút) | Thể loại: ${m.genre}`)
      .join('\n');

    const cinemaSummary = cinemas.map(c => `- ${c.name} (${c.city}): ${c.address}`).join('\n');
    const promoSummary = promotions.map(p => `- ${p.title} [${p.badge || 'Ưu đãi'}]: Hạn dùng ${p.validUntil}`).join('\n');
    const foodSummary = foodCombos.map(f => `- ${f.name} (${f.price.toLocaleString('vi-VN')}đ): ${f.description}`).join('\n');

    // 4. System prompt: Giọng người thật, không icon/emoji, có Deep Link đặt vé
    const systemPrompt = `Bạn là nhân viên tư vấn khách hàng của rạp chiếu phim Aeon Cine, đang hỗ trợ trực tiếp cho khách trên website.

QUY TẮC GIAO TIẾP VỚI KHÁCH HÀNG:
1. NÓI CHUYỆN TỰ NHIÊN NHƯ NGƯỜI THẬT:
   - Xưng hô là "mình" hoặc "em", gọi khách là "bạn" hoặc "anh/chị".
   - Giọng điệu nhã nhặn, thân thiện, ngắn gọn và thực tế như một bạn nhân viên quầy vé hoặc trực tổng đài rạp phim.
   - Tránh tuyệt đối giọng điệu máy móc, không mở đầu bằng các câu sáo rỗng kiểu "Tôi là trợ lý AI...", "Rất vui được hỗ trợ bạn tại AEON CINE"... Hãy chào hỏi tự nhiên và trả lời thẳng vào vấn đề.
2. TUYỆT ĐỐI KHÔNG DÙNG ICON / EMOJI:
   - Không sử dụng bất kỳ biểu tượng cảm xúc hay icon nào trong câu trả lời (như 😊, 🥰, 👋, ✨, 🎬, 🎟️, 🍿, 📍, 📅, v.v.).
   - Trình bày câu trả lời bằng văn bản thuần túy, sạch sẽ, dùng dấu gạch đầu dòng "-" để liệt kê.
3. TRẢ LỜI ĐÚNG TRỌNG TÂM:
   - Khi khách hỏi phim chiếu khi nào hoặc lịch chiếu: Liệt kê ngay các mốc giờ chiếu cụ thể và ngày chiếu tại các rạp tiêu biểu, không nói vòng vo, không bắt khách tự đi tìm suất chiếu. Sau đó hỏi khách muốn xem ở rạp nào hoặc khung giờ nào để hỗ trợ tiếp.
   - Khi khách hỏi về giá vé: Vé 2D từ 45.000đ đến 85.000đ tùy khung giờ và đối tượng (Thứ 3 Happy Day và HSSV/U22 đồng giá 45.000đ; phòng IMAX Laser, 3D Atmos có phụ thu).
   - Khi khách hỏi bắp nước: Nêu tên các combo kèm giá tiền cụ thể.
4. TÍCH HỢP NÚT ĐẶT VÉ NHANH (DEEP LINK):
   - Khi tư vấn về một bộ phim cụ thể hoặc khi khách muốn đặt vé / xem lịch chiếu: Ở cuối câu trả lời, hãy đính kèm liên kết đặt vé theo đúng cú pháp Markdown: [Đặt vé phim {Tên phim}](/booking/{movieId}) dựa vào Link đặt vé được cung cấp trong danh sách.
   - Ví dụ: "Bạn có thể bấm vào đây để xem rạp và chọn ghế nhé: [Đặt vé phim Trại Buôn Người](/booking/1e403224-98da-4a69-9d21-f6d034ee90e1)".
   - Hệ thống giao diện sẽ tự động chuyển liên kết này thành nút bấm đẹp mắt để khách hàng bấm là chuyển thẳng tới màn hình đặt vé.
5. TUYỆT ĐỐI KHÔNG bảo khách "hãy truy cập website hoặc tải ứng dụng" vì khách đang ở ngay trên website.

DỮ LIỆU THỰC TẾ HỆ THỐNG AEON CINE:
${showtimeSummary ? `=== LỊCH CHIẾU & SUẤT CHIẾU CỤ THỂ ===\n${showtimeSummary}\n` : ''}

=== DANH SÁCH PHIM ĐANG CHIẾU HÔM NAY ===
${nowShowingList || 'Hiện hệ thống đang cập nhật danh sách phim.'}

=== DANH SÁCH PHIM SẮP CHIẾU ===
${comingSoonList || 'Đang cập nhật các bom tấn sắp tới.'}

=== HỆ THỐNG CỤM RẠP TIÊU BIỂU ===
${cinemaSummary}

=== BẮP NƯỚC & COMBO ===
${foodSummary || 'Combo 1 Big (89k), Combo 2 Big Couple (109k), Family Combo (159k), Bắp Cốm Mùa Thu.'}

=== CHƯƠNG TRÌNH KHUYẾN MÃI ===
${promoSummary}

CÂU HỎI CỦA KHÁCH HÀNG:
"${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Lỗi khi kết nối với hệ thống tư vấn' });
  }
};
