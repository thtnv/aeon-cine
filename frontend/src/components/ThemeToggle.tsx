import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Chuyển sang giao diện nền sáng (Light)' : 'Chuyển sang giao diện nền tối (Dark)'}
      aria-label={isDark ? 'Chuyển sang giao diện nền sáng' : 'Chuyển sang giao diện nền tối'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 border ${
        isDark
          ? 'bg-gray-800/80 hover:bg-gray-700 text-amber-400 border-gray-700/80 hover:border-amber-400/40 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-amber-600 border-slate-200 hover:border-amber-400/60 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-300 transform active:scale-90">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-500 hover:rotate-90 animate-[fadeIn_0.2s_ease-out]" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-500 hover:-rotate-12 animate-[fadeIn_0.2s_ease-out]" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-bold whitespace-nowrap">
          {isDark ? 'Nền sáng' : 'Nền tối'}
        </span>
      )}
    </button>
  );
}
