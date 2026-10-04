import { useState, useEffect } from 'react';
import { Shield, Trash2, DollarSign, UserCheck, Users } from 'lucide-react';
import { API_URL } from '../../config/api';
import UserAvatar from '../UserAvatar';

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = () => {
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert('Lỗi khi xóa người dùng');
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Cập nhật quyền thất bại');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật quyền người dùng');
    }
  };

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const accountantCount = users.filter(u => u.role === 'ACCOUNTANT').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Quản Lý Người Dùng & Phân Quyền Nhân Sự
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Phân định rõ ràng trách nhiệm giữa Quản trị viên (Admin), Kế toán (Accountant), Nhân viên (Staff) và Khách hàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Tổng Tài Khoản</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{users.length}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Quản Trị Viên (ADMIN)</span>
            <Shield size={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-black text-orange-500 font-mono">{adminCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Toàn quyền vận hành</span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Bộ Phận Kế Toán</span>
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-500 font-mono">{accountantCount}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Quản lý dòng tiền & doanh thu</span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Khách Hàng (USER)</span>
            <UserCheck size={18} className="text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-700 dark:text-slate-300 font-mono">{userCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Khách hàng đặt vé</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-gray-800">
                <th className="py-3 px-4">Tài Khoản</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Vai Trò Hiện Tại</th>
                <th className="py-3 px-4">Đổi Quyền Hạn</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-medium">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center gap-3">
                    <UserAvatar name={user.name} avatarUrl={user.avatar} size="sm" />
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Ngày tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-gray-300">
                    {user.email}
                  </td>

                  <td className="py-3 px-4">
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        <Shield size={12} /> QUẢN TRỊ VIÊN
                      </span>
                    )}
                    {user.role === 'ACCOUNTANT' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        <DollarSign size={12} /> KẾ TOÁN TRƯỞNG
                      </span>
                    )}
                    {user.role === 'STAFF' && (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        NHÂN VIÊN SOÁT VÉ
                      </span>
                    )}
                    {user.role === 'USER' && (
                      <span className="inline-flex items-center bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        KHÁCH HÀNG
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="USER">Khách hàng (USER)</option>
                      <option value="ACCOUNTANT">Kế toán (ACCOUNTANT)</option>
                      <option value="ADMIN">Quản trị viên (ADMIN)</option>
                      <option value="STAFF">Nhân viên soát vé (STAFF)</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)} 
                      className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors inline-flex cursor-pointer" 
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
