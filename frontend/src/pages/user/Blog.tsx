import { useState, useEffect } from 'react';
import { Newspaper, Calendar, User, Eye, Clock, ChevronRight, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
  readingTime: string;
  imageUrl?: string;
  views: number;
}

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'ALL', label: 'TẤT CẢ' },
    { id: 'Review Phim', label: 'BÌNH LUẬN PHIM' },
    { id: 'Movie Blog', label: 'BLOG ĐIỆN ẢNH' },
    { id: 'Tin Điện Ảnh', label: 'TIN TỨC ĐIỆN ẢNH' },
    { id: 'Phim Sắp Chiếu', label: 'PHIM SẮP CHIẾU' }
  ];

  const filteredArticles = selectedCategory === 'ALL'
    ? articles
    : articles.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (sel === 'review phim') {
          return cat.includes('review') || cat.includes('bình luận');
        }
        if (sel === 'movie blog') {
          return cat.includes('movie blog') || cat.includes('blog');
        }
        return cat === sel;
      });

  const handleOpenArticle = async (article: Article) => {
    // 1. Mở modal ngay lập tức để người dùng không phải chờ
    setSelectedArticle(article);

    // 2. Ghi nhận lượt xem và chống spam trùng lặp trong cùng phiên làm việc (Session Deduplication)
    try {
      const viewedKey = 'aeon_viewed_articles';
      const raw = sessionStorage.getItem(viewedKey);
      const viewedList: string[] = raw ? JSON.parse(raw) : [];

      if (!viewedList.includes(article.id)) {
        const res = await fetch(`${API_URL}/api/blogs/${article.id}`);
        if (res.ok) {
          const updated: Article = await res.json();
          // Cập nhật lượt xem mới nhất trong Modal
          setSelectedArticle(updated);
          // Cập nhật lượt xem mới nhất trên thẻ Card ngoài danh sách
          setArticles(prev => prev.map(a => a.id === article.id ? { ...a, views: updated.views } : a));
          // Ghi nhớ bài viết đã đọc vào session
          viewedList.push(article.id);
          sessionStorage.setItem(viewedKey, JSON.stringify(viewedList));
        }
      }
    } catch (err) {
      console.error('Lỗi cập nhật lượt xem bài viết:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Cinematic Banner */}
      <div className="relative w-full py-20 bg-gradient-to-b from-slate-100 to-white dark:from-[#14171f] dark:to-[#0f1115] border-b border-slate-200 dark:border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-black px-4 py-1.5 rounded-full border border-orange-500/30 uppercase tracking-widest mb-4">
            <Newspaper size={14} /> GÓC ĐIỆN ẢNH & TIN TỨC
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
            THÔNG TIN PHIM & REVIEW NÓNG HỎI
          </h1>
          <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Cập nhật tin tức điện ảnh mới nhất, góc nhìn đánh giá phim sâu sắc và lịch chiếu phim bom tấn chiếu rạp.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105' 
                    : 'bg-slate-200/80 dark:bg-gray-800/80 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-slate-100 dark:bg-[#1a1d24] rounded-2xl border border-slate-200 dark:border-gray-800">
            <p className="text-slate-500 dark:text-gray-400 text-lg">Chưa có bài viết nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => handleOpenArticle(article)}
                className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-md dark:shadow-xl hover:border-orange-500/50 transition-all hover:-translate-y-2 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      {article.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-500 mb-3 font-semibold">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {article.publishDate}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {article.readingTime}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-gray-800/50 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                    <Eye size={13} className="text-amber-500" /> {Number(article.views || 0).toLocaleString('vi-VN')} lượt xem
                  </span>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Đọc tiếp <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white dark:bg-[#181a20] border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl p-6 sm:p-10">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-slate-100 hover:bg-orange-500 text-slate-700 hover:text-white dark:bg-gray-800 dark:hover:bg-orange-500 dark:text-white rounded-full flex items-center justify-center transition-all border border-slate-200 dark:border-gray-700"
            >
              <X size={20} />
            </button>

            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 border border-orange-500/30">
              {selectedArticle.category}
            </span>

            <h2 className="text-2xl sm:text-4xl font-black mb-4 uppercase tracking-tight leading-tight">
              {selectedArticle.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-8 border-b border-gray-800 pb-4 font-semibold">
              <span className="flex items-center gap-1"><User size={14} className="text-orange-500" /> Tác giả: {selectedArticle.author || 'Ban Biên Tập Aeon Cine'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {selectedArticle.publishDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {selectedArticle.views} lượt xem</span>
            </div>

            <div className="rounded-2xl overflow-hidden mb-8 border border-gray-800">
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-80 object-cover" />
            </div>

            <div className="text-gray-300 leading-relaxed text-base space-y-4 whitespace-pre-line text-justify">
              {selectedArticle.content}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-800 text-center">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
