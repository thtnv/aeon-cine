import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&agrave;/g, 'à')
    .replace(/&atilde;/g, 'ã')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&otilde;/g, 'õ')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&yacute;/g, 'ý')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

const targetUrls = [
  'https://www.galaxycine.vn/binh-luan-phim/review-the-odyssey-tiep-tuc-khang-dinh-phuong-cham-in-nolan-we-trust',
  'https://www.galaxycine.vn/binh-luan-phim/review-tham-tu-lung-danh-conan-thien-than-sa-nga-tren-xa-lo-fast--furious-phien-ban-hoat-hinh',
  'https://www.galaxycine.vn/binh-luan-phim/review-spider-man-brand-new-day-hoan-tat-hanh-trinh-truong-thanh-cua-nhen-nhi',
  'https://www.galaxycine.vn/binh-luan-phim/review-moana-hanh-trinh-hap-dan-dam-chat-mua-he',
  'https://www.galaxycine.vn/binh-luan-phim/review-minions--monsters-vo-tri-van-hot-bac-ti-do',
  'https://www.galaxycine.vn/binh-luan-phim/review-colony-khai-thac-co-che-xac-song-vo-cung-hap-dan',
  'https://www.galaxycine.vn/binh-luan-phim/review-doraemon-nobita-va-lau-dai-duoi-day-bien-meo-u-con-lau-moi-het-thoi',
  'https://www.galaxycine.vn/binh-luan-phim/review-the-devil-wears-prada-2-ai-cung-so-mat-viec-thoi-ke-ca-ba-hoang-thoi-trang',
  'https://www.galaxycine.vn/binh-luan-phim/review-anh-hung-thai-hoa-qua-xuat-sac',
  'https://www.galaxycine.vn/binh-luan-phim/review-ho-linh-trang-si-hanh-trinh-dua-phim-su-viet-ve-vi-tri-xung-dang',
  'https://www.galaxycine.vn/binh-luan-phim/review-len-huong-quan-tai-cau-tai-va-tinh-mau-tu-thieng-lieng',
  'https://www.galaxycine.vn/binh-luan-phim/review-trai-buon-nguoi-bao-luc-khoc-liet-day-man-nhan'
];

async function main() {
  console.log(`🎬 Bắt đầu cào ${targetUrls.length} bài Bình Luận Phim từ Galaxy Cinema...`);

  let count = 0;

  for (const url of targetUrls) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.galaxycine.vn/'
        }
      });

      if (!res.ok) {
        console.warn(`Lỗi fetch ${url}: ${res.status}`);
        continue;
      }

      const text = await res.text();
      const nextDataMatch = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

      if (!nextDataMatch) {
        console.warn(`Không tìm thấy __NEXT_DATA__ tại ${url}`);
        continue;
      }

      const json = JSON.parse(nextDataMatch[1]);
      const pd = json.props?.pageProps?.postDetail;

      if (!pd || !pd.name) {
        console.warn(`Không tìm thấy postDetail tại ${url}`);
        continue;
      }

      const rawTitle = pd.name.trim();
      const title = rawTitle.startsWith('[Review]') ? rawTitle : `[Review] ${rawTitle}`;
      const summary = cleanHtml(pd.shortDescription || '').slice(0, 300) || `Đánh giá và phân tích phim ${title} từ chuyên gia điện ảnh.`;
      const rawContent = cleanHtml(pd.description || pd.content || '');
      const content = rawContent.length > 50 ? rawContent : `${summary}\n\nBộ phim mang đến trải nghiệm điện ảnh sâu sắc, kết hợp kỹ xảo đỉnh cao và thông điệp cảm động. Tác phẩm hiện đang nhận được sự quan tâm lớn từ khán giả yêu điện ảnh tại các cụm rạp.`;

      // Format image URL
      let imageUrl = pd.imageLandscape || pd.imagePortrait || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80';
      if (imageUrl.startsWith('/media/')) {
        imageUrl = `https://cdn.galaxycine.vn${imageUrl}`;
      }

      const views = parseInt(pd.views) || Math.floor(Math.random() * 5000) + 1200;
      const readingTime = `${Math.max(3, Math.min(8, Math.ceil(content.split(' ').length / 200)))} phút đọc`;
      const publishDate = '30/09/2026';

      const existingBlog = await prisma.blog.findFirst({
        where: { title }
      });

      const blogPayload = {
        title,
        summary,
        content,
        category: 'Review Phim',
        author: 'Galaxy Cine Critic',
        publishDate,
        readingTime,
        imageUrl,
        views,
        status: 'ACTIVE'
      };

      if (existingBlog) {
        await prisma.blog.update({
          where: { id: existingBlog.id },
          data: blogPayload
        });
        console.log(`✅ Đã cập nhật review: ${title}`);
      } else {
        await prisma.blog.create({
          data: blogPayload
        });
        console.log(`✨ Đã thêm mới review: ${title}`);
      }

      count++;
    } catch (err: any) {
      console.error(`Lỗi xử lý bài ${url}:`, err.message);
    }
  }

  console.log(`🎉 Thành công nạp ${count} bài Bình Luận Phim từ Galaxy Cinema vào Database!`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp reviews:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
