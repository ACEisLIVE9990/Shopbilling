/**
 * Employee & Staff Management Screen
 * Restricted to Administrator role. Manage cashiers, employees, credentials, and offline POS access.
 */

import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Key,
  Phone,
  Search,
  Lock,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { User, UserRole } from '../../types';

export const EmployeesScreen: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, isAdmin, currentUser } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-300">
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl max-w-md space-y-3">
          <ShieldAlert size={48} className="mx-auto text-rose-400" />
          <h2 className="text-lg font-bold text-white">Access Denied: Admin Rights Required</h2>
          <p className="text-xs text-slate-400">
            Employee and Cashier accounts do not have permission to view or manage staff accounts.
            Please switch to an Administrator account to access this module.
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('employee');
    setPhone('');
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password);
    setFullName(u.fullName);
    setRole(u.role);
    setPhone(u.phone || '');
    setIsActive(u.isActive);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !fullName.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const payload: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      username: username.trim().toLowerCase(),
      password: password.trim(),
      fullName: fullName.trim(),
      role,
      phone: phone.trim() || undefined,
      isActive,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    const res = editingUser ? updateUser(payload) : addUser(payload);
    if (!res.success) {
      setErrorMessage(res.message || 'Operation failed');
      return;
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (!res.success) {
      alert(res.message || 'Failed to delete user');
    }
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  const activeStaffCount = users.filter((u) => u.isActive && u.role === 'employee').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCog size={18} className="text-blue-400" />
            Staff & Employee Accounts ({users.length})
          </h2>
          <p className="text-xs text-slate-400">
            Manage cashier terminals, credentials, and offline role access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Cashiers:</span>
            <span className="font-bold text-emerald-400">{activeStaffCount} Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Admins:</span>
            <span className="font-bold text-blue-400">{adminCount}</span>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <UserPlus size={15} /> Add New Employee
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or phone..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3">Full Name</th>
              <th className="py-2.5 px-3">Username</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Contact Phone</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredUsers.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      {u.fullName}
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-900/60 text-blue-300 rounded border border-blue-700">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{u.username}</td>
                  <td className="py-2.5 px-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold bg-blue-950/60 text-blue-400 border-blue-800">
                        <Shield size={12} /> Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border-emerald-800">
                        <UserCheck size={12} /> Cashier / Staff
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{u.phone || '-'}</td>
                  <td className="py-2.5 px-3 text-center">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                        title="Edit user details or reset password"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      {u.id !== 'user-admin-01' && (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded text-[11px] border border-rose-900/60 flex items-center gap-1"
                          title="Delete employee account"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCog size={16} className="text-blue-400" />
                {editingUser ? 'Edit Staff Account' : 'Add New Staff / Cashier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/70 border border-rose-800/80 rounded text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahul"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Login password"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="employee">Employee / Cashier</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Mobile</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="user-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="user-active" className="text-slate-300 cursor-pointer font-medium">
                  Account Active (Allow logging into POS)
                </label>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
                {role === 'employee' ? (
                  <p>
                    <b className="text-emerald-400">Employee Permissions:</b> Limited strictly to Billing, product search, customer selection, and loyalty point rewards. Cannot modify products, view reports, or change settings.
                  </p>
                ) : (
                  <p>
                    <b className="text-blue-400">Admin Permissions:</b> Complete access to all 10 POS modules, database backups, returns, reports, and system settings.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Trash2 size={16} /> Confirm Account Deletion
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete employee <b>{userToDelete.fullName}</b> (
              <span className="font-mono">{userToDelete.username}</span>)?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
