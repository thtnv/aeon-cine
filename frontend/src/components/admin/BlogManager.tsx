import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Newspaper, X, Eye, Calendar, Clock } from 'lucide-react';
import { API_URL } from '../../config/api';
import ManageableDropdown from './ManageableDropdown';

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

export default function BlogManager() {
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Review Phim');
  const [author, setAuthor] = useState('Ban Biên Tập Aeon Cine');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [readingTime, setReadingTime] = useState('5 phút đọc');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = () => {
    fetch(`${API_URL}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch(err => console.error('Error fetching blogs:', err));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setCategory('Review Phim');
    setAuthor('Ban Biên Tập Aeon Cine');
    setPublishDate(new Date().toISOString().slice(0, 10));
    setReadingTime('5 phút đọc');
    setImageUrl('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content || !category) return;

    setLoading(true);
    const payload = {
      title,
      summary,
      content,
      category,
      author: author.trim() || 'Ban Biên Tập Aeon Cine',
      publishDate,
      readingTime: readingTime.trim() || '5 phút đọc',
      imageUrl: imageUrl.trim() || undefined,
      status: 'ACTIVE'
    };

    const url = editingId 
      ? `${API_URL}/api/blogs/${editingId}`
      : `${API_URL}/api/blogs`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetForm();
        fetchBlogs();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể lưu bài viết');
      }
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Lỗi kết nối máy chủ khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Article) => {
    setEditingId(blog.id);
    setTitle(blog.title || '');
    setSummary(blog.summary || '');
    setContent(blog.content || '');
    setCategory(blog.category || 'Review Phim');
    setAuthor(blog.author || 'Ban Biên Tập Aeon Cine');
    setPublishDate(blog.publishDate || new Date().toISOString().slice(0, 10));
    setReadingTime(blog.readingTime || '5 phút đọc');
    setImageUrl(blog.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlogs();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể xóa bài viết');
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Lỗi kết nối máy chủ khi xóa bài viết');
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper className="text-orange-500 w-8 h-8" />
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Quản lý Góc Điện Ảnh (Blog)</h2>
          <p className="text-gray-400 text-sm mt-1">Đăng tải, chỉnh sửa bài viết đánh giá phim, tin tức điện ảnh và lịch khởi chiếu</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? 'Chỉnh sửa Bài Viết' : 'Tạo Bài Viết Điện Ảnh Mới'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={14} /> Hủy chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Review Phim Dune 2: Bom Tấn Viễn Tưởng Đáng Xem..."
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm font-bold transition-colors"
            />
          </div>
          <div>
            <ManageableDropdown
              label="Chuyên mục"
              required
              storageKey="blog_categories"
              value={category}
              onChange={val => setCategory(val)}
              defaultOptions={[
                { value: 'Bình Luận Phim', label: 'Bình Luận Phim', badge: 'Review Phim', isDefault: true },
                { value: 'Movie Blog', label: 'Blog Điện Ảnh (Movie Blog)', badge: 'Góc Điện Ảnh', isDefault: true },
                { value: 'Review Phim', label: 'Review Phim', badge: 'Đánh giá' },
                { value: 'Tin Điện Ảnh', label: 'Tin Điện Ảnh', badge: 'Tin tức', isDefault: true },
                { value: 'Phim Sắp Chiếu', label: 'Phim Sắp Chiếu', badge: 'Trailer / Teaser', isDefault: true },
                { value: 'Hậu Trường', label: 'Góc Hậu Trường', badge: 'Behind The Scenes' },
                { value: 'Phỏng Vấn', label: 'Phỏng Vấn Sao', badge: 'Interview' }
              ]}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Tác giả</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Aeon Cine Editor"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Ngày xuất bản</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2">Thời lượng đọc</label>
            <input
              type="text"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              placeholder="5 phút đọc"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Link Ảnh Bài Viết (Image URL)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Tóm tắt ngắn (Summary) <span className="text-red-500">*</span></label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="Tóm tắt nội dung chính hiển thị ở trang danh sách..."
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2">Nội dung chi tiết bài viết (Content) <span className="text-red-500">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Nội dung bài viết đầy đủ..."
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-xs transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-2 self-start mt-2"
        >
          {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
          {editingId ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
        </button>
      </form>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <div key={blog.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
            <div>
              {blog.imageUrl && (
                <div className="h-44 overflow-hidden relative">
                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 left-2 bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow">
                    {blog.category}
                  </span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-[11px] mb-2">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {blog.publishDate}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {blog.readingTime}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {blog.views || 0}</span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">{blog.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">{blog.summary}</p>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80 mt-auto">
              <button onClick={() => handleEdit(blog)} className="flex-1 bg-white hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-white border border-slate-200 dark:border-gray-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                <Edit3 size={15} /> Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(blog.id)} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-transparent font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-1">
                <Trash2 size={15} /> Xóa
              </button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            Chưa có bài viết nào trong cơ sở dữ liệu.
          </div>
        )}
      </div>
    </div>
  );
}
