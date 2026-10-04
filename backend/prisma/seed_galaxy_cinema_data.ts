import prisma from '../src/prismaClient';

async function main() {
  console.log('🚀 Bắt đầu cập nhật và bổ sung dữ liệu chuẩn Galaxy Cinema...');

  // 1. THỂ LOẠI (GENRES) - https://www.galaxycine.vn/dien-anh/
  const genresList = [
    'Hành Động',
    'Phiêu Lưu',
    'Hoạt Hình',
    'Hài Hước',
    'Kinh Dị',
    'Tâm Lý',
    'Tình Cảm',
    'Khoa Học Viễn Tưởng',
    'Giả Tưởng',
    'Giật Gân',
    'Tội Phạm',
    'Bí Ẩn',
    'Gia Đình',
    'Chiến Tranh',
    'Lịch Sử',
    'Võ Thuật',
    'Cổ Trang',
    'Thần Thoại',
    'Ca Nhạc',
    'Tài Liệu',
    'Thể Thao',
    'Anime'
  ];

  console.log(`\n📌 Đang cập nhật ${genresList.length} Thể Loại Phim chuẩn Galaxy Cinema...`);
  let addedGenres = 0;
  for (const name of genresList) {
    const existing = await prisma.genre.findUnique({ where: { name } });
    if (!existing) {
      await prisma.genre.create({ data: { name } });
      addedGenres++;
    }
  }
  console.log(`✅ Đã bổ sung ${addedGenres} thể loại mới vào cơ sở dữ liệu.`);

  // 2. DIỄN VIÊN (ACTORS) - https://www.galaxycine.vn/dien-vien/
  const actorsList = [
    // Việt Nam
    'Trấn Thành',
    'Thái Hòa',
    'Ninh Dương Lan Ngọc',
    'Kaity Nguyễn',
    'Tuấn Trần',
    'Uyển Ân',
    'Phương Anh Đào',
    'Song Luân',
    'Kiều Minh Tuấn',
    'Thu Trang',
    'Tiến Luật',
    'Hồng Đào',
    'Võ Tấn Phát',
    'NSND Hồng Vân',
    'NSƯT Tuyết Thu',
    'NSND Tự Long',
    'Quang Tuấn',
    'Quốc Trường',
    'Hoàng Yến Chibi',
    'Liên Bỉnh Phát',
    'Diệu Nhi',
    'Anh Tú',
    'Hứa Vĩ Văn',
    'Lan Thy',
    'Samuel An',
    'Kiều Chinh',
    'Quách Ngọc Ngoan',
    'Johnny Trí Nguyễn',
    'Steven Nguyễn',
    'Ngô Kiến Huy',
    'Hạo Khang',
    'Phương Nam',
    'Kiều Oanh',
    'Ngọc Phước',
    'Huỳnh Minh Kiên',
    'Tùng Mint',
    'Trần Thiên Tú',
    'Đỗ Thị Hải Yến',
    'Ngân Quỳnh',
    'Khả Như',
    'Thành Lộc',
    'Đại Nghĩa',
    'Hữu Châu',
    // Quốc Tế (Hollywood, Hàn Quốc, Nhật Bản, Trung Quốc, Thái Lan)
    'Tom Cruise',
    'Leonardo DiCaprio',
    'Cillian Murphy',
    'Robert Downey Jr.',
    'Chris Hemsworth',
    'Chris Evans',
    'Scarlett Johansson',
    'Zendaya',
    'Timothée Chalamet',
    'Margot Robbie',
    'Brad Pitt',
    'Keanu Reeves',
    'Emma Stone',
    'Christian Bale',
    'Austin Abrams',
    'Paul Walter Hauser',
    'Zach Cherry',
    'Mark Ruffalo',
    'Jeremy Renner',
    'Paul Rudd',
    'Song Kang-ho',
    'Ma Dong-seok',
    'Gong Yoo',
    'Hyun Bin',
    'Son Ye-jin',
    'Lee Jung Eun',
    'Kong Hyo Jin',
    'Park So Dam',
    'Hwang Jung Min',
    'Hoyeon',
    'Jo In Sung',
    'Alicia Vikander',
    'Michael Fassbender',
    'Lương Triều Vỹ',
    'Chân Tử Đan',
    'Thành Long',
    'Cổ Thiên Lạc',
    'Nadech Kugimiya',
    'Supassra Thanachat',
    'Nanoka Hara',
    'Matsumura Hokuto'
  ];

  console.log(`\n📌 Đang cập nhật ${actorsList.length} Diễn Viên điện ảnh...`);
  let addedActors = 0;
  for (const name of actorsList) {
    const existing = await prisma.actor.findUnique({ where: { name } });
    if (!existing) {
      await prisma.actor.create({ data: { name } });
      addedActors++;
    }
  }
  console.log(`✅ Đã bổ sung ${addedActors} diễn viên mới vào cơ sở dữ liệu.`);

  // 3. MOVIE BLOG (BLOG ĐIỆN ẢNH) - https://www.galaxycine.vn/movie-blog/
  const movieBlogs = [
    {
      title: '[Movie Blog] Giải Mã Vũ Trụ Điện Ảnh Marvel: Kỷ Nguyên Đa Vũ Trụ Và Tương Lai Sau Avengers',
      summary: 'Khám phá bức tranh tổng thể của MCU trong Kỷ nguyên Đa Vũ Trụ (Multiverse Saga), các nhánh thời gian và những mắt xích bí mật định hình trận đại chiến tiếp theo.',
      category: 'Movie Blog',
      author: 'Hoàng Long (Cine Critic)',
      publishDate: '2026-03-20',
      readingTime: '7 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80',
      views: 3420,
      content: `Vũ trụ Điện ảnh Marvel (MCU) đã bước sang một kỷ nguyên hoàn toàn mới sau chiến thắng đầy bi tráng trong Avengers: Endgame. Kỷ nguyên Đa Vũ Trụ (Multiverse Saga) không chỉ mở rộng quy mô câu chuyện ra vô hạn chiều không gian, mà còn thách thức khán giả với những khái niệm khoa học viễn tưởng phức tạp.

1. BẢN ĐỒ KHÔNG - THỜI GIAN VÀ CÁC THỰC TẠI SONG SONG
Sự sụp đổ của Dòng Thời Gian Thiêng Liêng (Sacred Timeline) đã mở đường cho các biến thể và những cuộc chạm trán chưa từng có. Từ hiện tượng Incursion (Xâm lấn vũ trụ) đến sự can thiệp của TVA, mỗi tác phẩm giờ đây đều là một mảnh ghép của bức tranh toàn cảnh.

2. CÁC TỔ CHỨC VÀ PHE PHÁI MỚI TRỖI DẬY
Không chỉ có Avengers, thế giới siêu anh hùng đang chứng kiến sự ra đời của Young Avengers, Thunderbolts và các thực thể vũ trụ bí ẩn. Sự trở lại của các dị nhân X-Men và Bộ Tứ Siêu Đẳng (Fantastic Four) hứa hẹn sẽ đưa MCU trở lại đỉnh cao danh vọng.

3. TẠI SAO BẠN NÊN TRẢI NGHIỆM TẠI RẠP CHIẾU PHIM?
Đại cảnh chiến đấu liên vũ trụ với hàng nghìn chi tiết ẩn (Easter Eggs) chỉ có thể được thưởng thức trọn vẹn trên màn chiếu chuẩn IMAX Laser với âm thanh đa chiều Dolby Atmos rực lửa.`
    },
    {
      title: '[Movie Blog] Đạo Diễn Christopher Nolan Và Nỗi Ám Ảnh Về Thời Gian Trong Điện Ảnh',
      summary: 'Từ Memento, Inception, Interstellar, Tenet đến Oppenheimer: Phân tích phong cách làm phim bậc thầy và triết lý thời gian độc nhất vô nhị của Christopher Nolan.',
      category: 'Movie Blog',
      author: 'Tuấn Vũ (Cinema Lab)',
      publishDate: '2026-03-18',
      readingTime: '8 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      views: 4890,
      content: `Nếu có một đạo diễn đương đại khiến cả giới phê bình lẫn khán giả đại chúng phải ngả mũ thán phục trước cấu trúc kịch bản phi tuyến tính, đó chắc chắn là Christopher Nolan.

1. THỜI GIAN NHƯ MỘT NHÂN VẬT THỰC THỤ
Trong phim của Nolan, thời gian không phải là dòng chảy tuyến tính trôi qua thụ động, mà là một lực lượng vật lý hữu hình chi phối số phận con người:
- Memento (2000): Kể chuyện đảo ngược thời gian để mô phỏng chứng mất trí nhớ ngắn hạn.
- Inception (2010): Thời gian giãn nở theo từng tầng giấc mơ (1 phút ở thực tại = 20 phút ở tầng sâu).
- Interstellar (2014): Sự co giãn thời gian do trọng lực hố đen Gargantua (1 giờ trên hành tinh Miller = 7 năm Trái Đất).
- Tenet (2020): Nghịch đảo entropy thời gian, nơi quá khứ và tương lai va chạm trực diện.

2. NÓI KHÔNG VỚI CGI LẠM DỤNG
Nolan nổi tiếng với nguyên tắc quay thực tế (Practical Effects): Cho nổ máy bay Boeing 747 thật trong Tenet, tái hiện vụ thử hạt nhân Trinity trong Oppenheimer bằng phản ứng hóa học thực tế mà không cần kỹ xảo máy tính, và kiên trì sử dụng máy quay phim nhựa IMAX 70mm cồng kềnh.

Chính cam kết tuyệt đối với chất lượng điện ảnh chân thực này đã biến mỗi bộ phim của ông thành một sự kiện văn hóa toàn cầu.`
    },
    {
      title: '[Movie Blog] IMAX Laser & Dolby Atmos: Chuẩn Mực Nghe Nhìn Điện Ảnh Đỉnh Cao Tại Rạp Chiếu',
      summary: 'Khám phá sự khác biệt vượt trội giữa phòng chiếu tiêu chuẩn và công nghệ IMAX with Laser kết hợp âm thanh Dolby Atmos 64 kênh độc lập.',
      category: 'Movie Blog',
      author: 'Ban Kỹ Thuật Điện Ảnh',
      publishDate: '2026-03-15',
      readingTime: '6 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
      views: 2950,
      content: `Trong thời đại các thiết bị giải trí gia đình ngày càng phát triển, điều gì giữ chân khán giả bước chân vào rạp chiếu phim? Câu trả lời chính là: Trải nghiệm công nghệ trình chiếu không thể sao chép.

1. MÁY CHIẾU LASER THẾ HỆ MỚI (IMAX WITH LASER)
- Độ sáng vượt trội gấp 2 lần máy chiếu Xenon truyền thống, cho hình ảnh trong trẻo rực rỡ ngay cả khi xem định dạng 3D.
- Tỷ lệ tương phản cực sâu: Màu đen thăm thẳm và màu trắng tinh khiết, mang lại độ sâu thị giác đáng kinh ngạc.
- Màn chiếu vòm quang học siêu rộng với tỷ lệ khung hình 1.90:1 và 1.43:1, hiển thị thêm tới 40% hình ảnh so với bản chiếu thông thường.

2. HỆ THỐNG ÂM THANH DOLBY ATMOS KHÔNG GIAN ĐA CHIỀU
Khác với âm thanh 5.1 hay 7.1 kênh cố định, Dolby Atmos phân bổ âm thanh dạng vật thể tự do (Audio Objects) với tối đa 64 loa độc lập bố trí cả trên trần nhà rạp chiếu. Tiếng mưa rơi, tiếng trực thăng quần thảo hay tiếng bước chân kẻ địch đều định vị chuẩn xác đến từng centimet.

Đến rạp không chỉ để "xem" một bộ phim, mà là để "bước vào" không gian câu chuyện đó.`
    },
    {
      title: '[Movie Blog] Thế Giới Huyền Ảo Của Makoto Shinkai: Từ Your Name Đến Suzume',
      summary: 'Phân tích phong cách nghệ thuật duy mỹ, bầu trời sao rực rỡ và những câu chuyện về sự chia cắt thời - không trong hoạt hình của "phù thủy nỗi buồn" Makoto Shinkai.',
      category: 'Movie Blog',
      author: 'Cẩm Tú (Otaku Cine)',
      publishDate: '2026-03-11',
      readingTime: '6 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
      views: 5120,
      content: `Sau thời đại vàng son của Ghibli và Hayao Miyazaki, Makoto Shinkai đã định hình một trường phái anime điện ảnh hoàn toàn mới: Hiện đại, lãng mạn nhưng cũng đầy trăn trở về con người trước thiên nhiên.

1. NGHỆ THUẬT VẼ BẦU TRỜI VÀ ÁNH SÁNG DUY MỸ
Khán giả luôn nhận ra phim của Shinkai ngay từ khung hình đầu tiên: Những đám mây tích điện hoàng hôn, ánh phản chiếu của các giọt mưa trên đường ray xe lửa, và dải ngân hà rực rỡ màu lam ngọc. Mỗi khung hình đều có thể dừng lại làm một bức hình nền nghệ thuật.

2. CÂU CHUYỆN VỀ SỰ KẾT NỐI VÀ CHIA CẮT
- 5 Centimeters per Second (2007): Nỗi cô đơn của những khoảng cách địa lý và thời gian kéo giãn tình đầu.
- Your Name (2016): Sợi dây tơ hồng Musubi vượt qua cả dòng thời gian và thiên tai sao băng.
- Weathering With You (2019): Tình yêu tuổi trẻ sẵn sàng thách thức cả thời tiết thế gian.
- Suzume (2022): Hành trình khóa lại những cánh cửa đau thương của quá khứ để chữa lành vết thương động đất.

Âm nhạc của ban nhạc RADWIMPS kết hợp cùng phần nhìn mãn nhãn đã tạo nên những cơn sốt phòng vé kỷ lục khắp châu Á.`
    },
    {
      title: '[Movie Blog] Phim Lịch Sử & Cổ Trang Việt Nam: Sự Trỗi Dậy Đầy Tự Hào Trên Màn Ảnh Rộng',
      summary: 'Điểm lại những bước chuyển mình mạnh mẽ của dòng phim dã sử, cổ trang và lịch sử nước nhà trong việc phục dựng trang phục truyền thống và tôn vinh văn hóa Việt.',
      category: 'Movie Blog',
      author: 'Trần Minh Quân',
      publishDate: '2026-03-08',
      readingTime: '7 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      views: 3180,
      content: `Làm phim lịch sử tại Việt Nam chưa bao giờ là bài toán dễ dàng: Kinh phí đầu tư bối cảnh khổng lồ, yêu cầu khắt khe về tính chuẩn xác sử liệu, và kỳ vọng rất cao từ công chúng.

1. BƯỚC NGOẶT TỪ PHỤC DỰNG CỔ PHỤC
Những năm gần đây, nhờ sự đồng hành của các nhóm nghiên cứu văn hóa độc lập, trang phục trong phim Việt (như áo Nhật Bình, áo Ngũ Thân, giáp chiến cổ) đã đạt độ tinh xảo và tính chân thực lịch sử chưa từng có.

2. CÔNG NGHỆ KỸ XẢO CGI VÀ BỐI CẢNH THỰC
Các nhà làm phim Việt Nam ngày càng tự tin ứng dụng kỹ xảo mô phỏng thành quách cổ kính, đại cảnh giao tranh hàng ngàn binh sĩ, kết hợp cùng cảnh sắc thiên nhiên hùng vĩ của Ninh Bình, Quảng Bình, Huế và Tây Bắc.

Khán giả trẻ ngày nay sẵn sàng ủng hộ nhiệt tình những tác phẩm điện ảnh nước nhà tôn vinh cội nguồn và bản sắc hào hùng của dân tộc.`
    },
    {
      title: '[Movie Blog] Denis Villeneuve & Hành Trình Đưa Kiệt Tác Viễn Tưởng Dune Lên Màn Ảnh Rộng',
      summary: 'Từng bị coi là "tiểu thuyết không thể chuyển thể thành phim", Dune đã được Denis Villeneuve hiện thực hóa như thế nào để trở thành tượng đài Sci-Fi thế kỷ 21?',
      category: 'Movie Blog',
      author: 'Đức Trọng',
      publishDate: '2026-03-05',
      readingTime: '8 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
      views: 4210,
      content: `Bộ tiểu thuyết Dune (1965) của Frank Herbert từng khiến những tên tuổi cự phách như Alejandro Jodorowsky hay David Lynch phải gục ngã vì quy mô thế giới quá đồ sộ và tầng lớp chính trị - tôn giáo phức tạp.

Cho đến khi Denis Villeneuve bước vào:
- Chia câu chuyện thành 2 phần điện ảnh độc lập để đảm bảo nhịp thở và sự thấu suốt của kịch bản.
- Lựa chọn sa mạc Jordan và Abu Dhabi để ghi hình đại cảnh thực tế thay vì phông xanh nhà kính.
- Âm nhạc thử nghiệm mang tính đột phá của Hans Zimmer sử dụng những nhạc cụ tự chế kỳ quái, mô phỏng tiếng gió rít sa mạc và tiếng gọi Sâu Cát linh thiêng.

Dune không đơn thuần là một bộ phim, mà là một trải nghiệm tâm linh kỳ vĩ cho những người yêu nghệ thuật thứ bảy.`
    }
  ];

  console.log(`\n📌 Đang thêm ${movieBlogs.length} bài viết Movie Blog (Blog Điện Ảnh)...`);
  let addedBlogs = 0;
  for (const b of movieBlogs) {
    const existing = await prisma.blog.findFirst({ where: { title: b.title } });
    if (!existing) {
      await prisma.blog.create({ data: b });
      addedBlogs++;
    }
  }
  console.log(`✅ Đã thêm ${addedBlogs} bài Blog Điện Ảnh mới vào cơ sở dữ liệu.`);

  // 4. CẬP NHẬT CÁC PHIM TRONG DATABASE
  console.log('\n📌 Kiểm tra và cập nhật các phim hiện có trong cơ sở dữ liệu...');
  // Cập nhật phim Scotty nếu thiếu diễn viên
  const scotty = await prisma.movie.findFirst({
    where: { title: { contains: 'Scotty' } }
  });
  if (scotty && (!scotty.actors || scotty.actors.trim() === '')) {
    await prisma.movie.update({
      where: { id: scotty.id },
      data: {
        actors: 'Thành Lộc, Đại Nghĩa, Hữu Châu, Khả Như (Lồng tiếng Việt)'
      }
    });
    console.log(`✅ Đã cập nhật dàn diễn viên lồng tiếng cho phim [${scotty.title}].`);
  }

  console.log('\n🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ VÀ INSERT THÀNH CÔNG VÀO DATABASE!');
}

main()
  .catch(e => {
    console.error('Lỗi khi seed dữ liệu:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
