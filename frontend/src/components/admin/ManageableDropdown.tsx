import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, X, Edit2, Trash2, Check, RotateCcw, ChevronDown } from 'lucide-react';

export interface DropdownItem {
  value: string;
  label: string;
  badge?: string;
  isDefault?: boolean;
}

interface ManageableDropdownProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  storageKey?: string; // Key lưu trữ trong localStorage (dành cho client config)
  defaultOptions: DropdownItem[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomInput?: boolean; // Cho phép nhập tay trực tiếp kết hợp gợi ý dropdown

  // Custom mode dành riêng cho dữ liệu Server (như Phòng chiếu Room của Rạp)
  customItems?: DropdownItem[];
  onServerAdd?: (name: string) => Promise<boolean | string>;
  onServerEdit?: (id: string, newName: string) => Promise<boolean>;
  onServerDelete?: (id: string) => Promise<boolean>;
  serverSubtitle?: string;
}

export default function ManageableDropdown({
  label,
  required = false,
  value,
  onChange,
  storageKey,
  defaultOptions,
  placeholder = '-- Chọn --',
  className = '',
  disabled = false,
  allowCustomInput = false,
  customItems,
  onServerAdd,
  onServerEdit,
  onServerDelete,
  serverSubtitle
}: ManageableDropdownProps) {
  // 1. Quản lý danh sách tùy chọn
  const [items, setItems] = useState<DropdownItem[]>(() => {
    if (customItems) return customItems;
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`cine_dd_${storageKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return defaultOptions;
  });

  // Đồng bộ khi customItems thay đổi (chế độ server rooms)
  useEffect(() => {
    if (customItems) {
      setItems(customItems);
    }
  }, [customItems]);

  // Đảm bảo value hiện tại luôn xuất hiện trong danh sách lựa chọn (tránh hiển thị ô trống khi sửa phim)
  useEffect(() => {
    if (value && value.trim() && !customItems) {
      const trimmed = value.trim();
      setItems(prev => {
        const exists = prev.some(x => x.value === trimmed || x.label === trimmed);
        if (!exists) {
          return [{ value: trimmed, label: trimmed }, ...prev];
        }
        return prev;
      });
    }
  }, [value, customItems]);

  // Lưu vào localStorage khi items thay đổi (ở chế độ client)
  const saveItems = (newItems: DropdownItem[]) => {
    setItems(newItems);
    if (storageKey && !customItems) {
      try {
        localStorage.setItem(`cine_dd_${storageKey}`, JSON.stringify(newItems));
      } catch (e) {}
    }
  };

  // 2. Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Đóng suggestions khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    }
    if (isSuggestionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSuggestionsOpen]);

  // Quick add form
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionBadge, setNewOptionBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit inline trong Manage Modal
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // Xử lý Thêm nhanh tùy chọn mới (KHÔNG DÙNG <form> để tránh submit nhầm modal cha)
  const handleQuickAdd = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = newOptionName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      if (onServerAdd) {
        const res = await onServerAdd(trimmed);
        if (res) {
          setNewOptionName('');
          setIsQuickAddOpen(false);
        }
      } else {
        // Kiểm tra trùng
        const exists = items.some(x => x.value.toLowerCase() === trimmed.toLowerCase() || x.label.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
          alert(`Tùy chọn "${trimmed}" đã tồn tại trong danh sách!`);
          onChange(trimmed);
          setIsQuickAddOpen(false);
          setIsSubmitting(false);
          return;
        }

        const newItem: DropdownItem = {
          value: trimmed,
          label: trimmed,
          badge: newOptionBadge.trim() || undefined
        };
        const updated = [...items, newItem];
        saveItems(updated);
        onChange(newItem.value);
        setNewOptionName('');
        setNewOptionBadge('');
        setIsQuickAddOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm tùy chọn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bắt đầu sửa trong Manage Modal
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditLabel(items[index].label);
  };

  // Lưu sửa
  const handleSaveEdit = async (index: number) => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    const target = items[index];

    if (onServerEdit) {
      setIsSubmitting(true);
      const ok = await onServerEdit(target.value, trimmed);
      setIsSubmitting(false);
      if (ok) {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, label: trimmed } : item));
        setEditingIndex(null);
      }
    } else {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        label: trimmed,
        value: updated[index].isDefault ? updated[index].value : trimmed // Giữ nguyên value nếu là code mặc định
      };
      saveItems(updated);
      if (value === target.value) {
        onChange(updated[index].value);
      }
      setEditingIndex(null);
    }
  };

  // Xóa tùy chọn
  const handleDelete = async (index: number) => {
    const target = items[index];
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tùy chọn "${target.label}"?`)) return;

    if (onServerDelete) {
      setIsSubmitting(true);
      const ok = await onServerDelete(target.value);
      setIsSubmitting(false);
      if (ok) {
        setItems(prev => prev.filter((_, i) => i !== index));
        if (value === target.value) {
          onChange('');
        }
      }
    } else {
      const updated = items.filter((_, i) => i !== index);
      saveItems(updated);
      if (value === target.value) {
        onChange(updated[0]?.value || '');
      }
    }
  };

  // Khôi phục mặc định
  const handleResetToDefault = () => {
    if (window.confirm('Khôi phục danh sách tùy chọn về mặc định ban đầu?')) {
      saveItems(defaultOptions);
      setEditingIndex(null);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header bar với Label và Quick Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <label className="block font-semibold text-slate-700 dark:text-gray-300 text-xs sm:text-sm">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        
        {!disabled && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickAddOpen(true);
                setNewOptionName('');
                setNewOptionBadge('');
              }}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-105"
              title={`Thêm ${label.toLowerCase()} mới`}
            >
              <Plus size={12} />
              <span>Thêm mới</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsManageModalOpen(true);
                setEditingIndex(null);
              }}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 p-1 rounded-lg text-xs transition-all cursor-pointer"
              title={`Quản lý danh sách ${label.toLowerCase()}`}
            >
              <Settings size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Main Input/Select Box */}
      {allowCustomInput ? (
        /* CHẾ ĐỘ 1: Ô nhập tự do kết hợp Dropdown gợi ý (Dành cho Đạo diễn, Diễn viên, Quốc gia...) */
        <div className="relative" ref={suggestionsRef}>
          <div className="flex items-center">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700/80 rounded-xl pl-3.5 pr-9 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none transition-all disabled:opacity-50 text-xs sm:text-sm shadow-xs font-medium"
            />
            <button
              type="button"
              onClick={() => setIsSuggestionsOpen(prev => !prev)}
              disabled={disabled}
              className="absolute right-2 text-slate-400 dark:text-gray-400 hover:text-orange-500 p-1 rounded-md transition-colors"
              title="Xem danh sách gợi ý"
            >
              <ChevronDown size={16} className={`transition-transform duration-200 ${isSuggestionsOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </button>
          </div>

          {/* Menu popup gợi ý danh sách */}
          {isSuggestionsOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto sidebar-scroll p-1.5 animate-[fadeIn_0.15s_ease-out]">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-gray-400 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                <span>Gợi ý {label.toLowerCase()} ({items.length})</span>
                <span className="text-[10px] text-orange-500 font-normal">Nhấp để chọn hoặc gõ trực tiếp</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800/60">
                {items.map((opt, idx) => (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsSuggestionsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      value === opt.value
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                        : 'text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 font-mono shrink-0 ml-2">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: Select Box chuẩn (Dành cho Trạng thái, Độ tuổi, Phòng chiếu, Định dạng...) */
        <div className="relative">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700/80 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm shadow-xs font-medium"
          >
            <option value="">{placeholder}</option>
            {items.map((opt, idx) => (
              <option key={`${opt.value}-${idx}`} value={opt.value}>
                {opt.label} {opt.badge ? `(${opt.badge})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* MODAL 1: Quick Add Popup (z-[9999] để luôn nổi trên mọi modal cha, KHÔNG DÙNG THẺ <form>) */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-[fadeIn_0.15s_ease-out]">
          <div 
            className="bg-[#111827] border border-orange-500/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleQuickAdd();
              }
              if (e.key === 'Escape') {
                setIsQuickAddOpen(false);
              }
            }}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Plus size={16} className="text-orange-500" />
                Thêm {label} Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Tên / Giá trị <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={`Nhập ${label.toLowerCase()} mới...`}
                  value={newOptionName}
                  onChange={e => setNewOptionName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              {!onServerAdd && (
                <div>
                  <label className="block font-semibold text-gray-400 text-xs mb-1">
                    Ghi chú / Nhãn phụ (tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="ví dụ: Laser, Vietsub, Hollywood..."
                    value={newOptionBadge}
                    onChange={e => setNewOptionBadge(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              {serverSubtitle && (
                <p className="text-[11px] text-orange-400/80 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                  {serverSubtitle}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={isSubmitting || !newOptionName.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isSubmitting ? 'Đang lưu...' : 'Thêm & Áp Dụng'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Management Modal (Thêm / Sửa / Xóa danh sách, z-[9999]) */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#1a2333]">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-orange-500" />
                <h3 className="font-extrabold text-white text-sm">
                  Quản Lý Danh Sách {label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* List Body */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-gray-800/60 sidebar-scroll">
              <div className="flex items-center justify-between pb-2 text-xs text-gray-400">
                <span>Hiện có <strong>{items.length}</strong> tùy chọn</span>
                {!customItems && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                  >
                    <RotateCcw size={11} /> Khôi phục mặc định
                  </button>
                )}
              </div>

              {items.map((opt, idx) => {
                const isEditing = editingIndex === idx;
                const isSelected = value === opt.value;

                return (
                  <div key={`${opt.value}-${idx}`} className="pt-2 flex items-center justify-between gap-2 group">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          className="flex-1 bg-gray-900 border border-orange-500 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(idx);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg text-xs cursor-pointer"
                          title="Lưu"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-1.5 rounded-lg text-xs cursor-pointer"
                          title="Hủy"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-orange-400' : 'text-gray-200'}`}>
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono shrink-0">
                              {opt.badge}
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                              Đang chọn
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEdit(idx)}
                            className="text-blue-400 hover:text-white hover:bg-blue-600/80 p-1 rounded-md transition-colors cursor-pointer"
                            title="Sửa tên"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(idx)}
                            className="text-red-400 hover:text-white hover:bg-red-600/80 p-1 rounded-md transition-colors cursor-pointer"
                            title="Xóa tùy chọn"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Thêm mới nhanh */}
            <div className="p-3 border-t border-gray-800 bg-[#1a2333] flex justify-between items-center text-xs">
              <span className="text-gray-400 text-[11px]">Thay đổi được lưu tự động</span>
              <button
                type="button"
                onClick={() => {
                  setIsManageModalOpen(false);
                  setIsQuickAddOpen(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Thêm tùy chọn mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
