import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, User, Headphones, Loader2, Ticket } from 'lucide-react';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Chào bạn! Mình là nhân viên tư vấn của Aeon Cine. Bạn cần xem lịch chiếu phim, giá vé hay combo bắp nước hôm nay ạ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Phim đang chiếu hôm nay',
    'Giá vé xem phim bao nhiêu?',
    'Combo bắp nước hiện có',
    'Chương trình khuyến mãi'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userText = queryText.trim();
    const userMessage: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      const aiResponse: Message = {
        role: 'assistant',
        content: data.reply || 'Dạ hiện tại hệ thống đang bận một chút, bạn thử gửi lại câu hỏi giúp mình nhé!'
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Hiện tại chưa thể kết nối tới máy chủ. Bạn vui lòng kiểm tra lại kết nối mạng nhé.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendQuery(input);
  };

  // Helper render formatted markdown text (bold **text**, links [text](url) -> CTA button, bullets - or *)
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const cleanLine = isBullet ? trimmed.replace(/^(\*|-|•)\s+/, '') : line;

      // Phân tách Markdown links [Text](url) và In đậm **bold**
      const parts = cleanLine.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);

      const content = parts.map((part, pIdx) => {
        // Xử lý liên kết đặt vé nhanh [Tên nút](/booking/...)
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
          if (match) {
            const [, label, url] = match;
            if (url.startsWith('/')) {
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    const token = localStorage.getItem('token');
                    if (url.startsWith('/booking') && !token) {
                      navigate(`/login?redirect=${encodeURIComponent(url)}`);
                    } else {
                      navigate(url);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 mx-0.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-display font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300 align-middle"
                >
                  <Ticket size={13} className="shrink-0" />
                  <span>{label}</span>
                  <span className="text-[10px] font-mono opacity-80">→</span>
                </button>
              );
            }
            return (
              <a
                key={pIdx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 dark:text-amber-400 underline font-medium hover:text-amber-500 transition-colors"
              >
                {label}
              </a>
            );
          }
        }

        // Xử lý chữ in đậm **text**
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-inherit">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1">
            <span className={`shrink-0 select-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>-</span>
            <div className="flex-1 leading-relaxed">{content}</div>
          </div>
        );
      }

      if (trimmed === '') {
        return <div key={lIdx} className="h-1.5" />;
      }

      return (
        <p key={lIdx} className="my-0.5 leading-relaxed">
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* Nút mở Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Mở Tư Vấn Aeon Cine"
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-bold hover:shadow-amber-500/40 hover:shadow-xl group"
        >
          <MessageSquare size={26} className="text-slate-950 transition-transform group-hover:scale-105" />
        </button>
      )}

      {/* Cửa sổ Chatbot */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-[360px] sm:w-[420px] h-[560px] max-h-[85vh] rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border transition-all duration-300 origin-bottom-right ${
            isLight
              ? 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900 shadow-slate-900/15'
              : 'bg-[#0d1117]/95 backdrop-blur-xl border-white/10 text-slate-100 shadow-black/60'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-amber-400 p-4 flex justify-between items-center shadow-md select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Tư Vấn Aeon Cine</h3>
                <p className="text-xs text-amber-100/90 font-medium">Hỗ trợ trực tuyến</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-black/15 p-1.5 rounded-full transition-colors"
              title="Đóng chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scroll-smooth ${
              isLight
                ? 'bg-gradient-to-b from-slate-50/80 via-white to-amber-50/15'
                : 'bg-gradient-to-b from-[#07090d] via-[#0d1117] to-[#07090d]'
            }`}
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 max-w-[88%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm mt-0.5 ${
                      isUser
                        ? isLight
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white ring-2 ring-amber-300/60'
                          : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold ring-2 ring-amber-500/30'
                        : isLight
                        ? 'bg-orange-500 text-white shadow-orange-500/20'
                        : 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-amber-500/10'
                    }`}
                  >
                    {isUser ? <User size={14} /> : <Headphones size={14} />}
                  </div>

                  {/* Bong bóng tin nhắn */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed transition-all ${
                      isUser
                        ? isLight
                          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-amber-950 font-medium rounded-tr-xs shadow-md shadow-amber-400/25 border border-amber-300/80'
                          : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-semibold rounded-tr-xs shadow-md shadow-amber-500/20 border border-amber-400/40'
                        : isLight
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-sm'
                        : 'bg-white/[0.05] text-slate-200 rounded-tl-xs border border-white/10 shadow-sm backdrop-blur-md'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}

            {/* Trạng thái đang trả lời */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] self-start items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-orange-500 text-white' : 'bg-orange-600 text-white'
                  }`}
                >
                  <Headphones size={14} />
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs rounded-tl-xs flex items-center gap-2 ${
                    isLight
                      ? 'bg-white text-slate-600 border border-slate-200 shadow-sm'
                      : 'bg-white/[0.05] text-slate-400 border border-white/10'
                  }`}
                >
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span>Đang kiểm tra thông tin...</span>
                </div>
              </div>
            )}

            {/* Gợi ý câu hỏi nhanh khi bắt đầu */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2 flex flex-col gap-1.5">
                <p className={`text-[11px] font-medium px-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Gợi ý câu hỏi nhanh:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => sendQuery(prompt)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left ${
                        isLight
                          ? 'bg-white/80 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 shadow-2xs'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300'
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={`p-3 sm:p-4 border-t flex gap-2 items-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-white/10'
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi tư vấn phim..."
              disabled={isLoading}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm transition-all focus:outline-none ${
                isLight
                  ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Gửi tin nhắn"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shadow-amber-500/20 shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
