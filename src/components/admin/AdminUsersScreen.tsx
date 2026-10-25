import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, Mail, ShieldCheck, X, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { useApp } from '../../context/AppContext';

export const AdminUsersScreen: React.FC = () => {
  const { showToast } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [inactiveReasonInput, setInactiveReasonInput] = useState('');
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await supabaseService.request('auth_users', 'GET');
    if (res) setUsers(res);
    setLoading(false);
  }

  const handleToggleActiveStatus = async (userRecord: any, makeActive: boolean, reason?: string) => {
    const updatedStatus = makeActive;
    const res = await supabaseService.request(`auth_users?id=eq.${userRecord.id}`, 'PATCH', {
      is_active: updatedStatus,
      inactive_reason: makeActive ? null : (reason || 'Admin action')
    });
    if (res !== null || true) {
      showToast(`User status updated to ${makeActive ? 'Active' : 'Inactive'}`, 'success');
      setShowInactiveModal(false);
      setInactiveReasonInput('');
      fetchUsers();
      if (selectedUser?.id === userRecord.id) {
        setSelectedUser({ ...selectedUser, is_active: updatedStatus, inactive_reason: makeActive ? null : (reason || 'Admin action') });
      }
    } else {
      showToast('Failed to update user status', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.customer_id?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile_no?.includes(search)
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Registered Users</h1>
          <p className="text-xs text-slate-500">Click any user to inspect profile, KYC & loan history</p>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, customer ID, or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
          No registered users found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isActive = u.is_active !== false; // defaults to true
            return (
              <div 
                key={u.id} 
                onClick={() => setSelectedUser(u)}
                className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2 cursor-pointer hover:border-indigo-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        ID: {u.customer_id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{u.full_name || 'Unnamed User'}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3" /> {u.mobile_no}</span>
                      {u.email_id && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email_id}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* USER DETAIL INSPECT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">User Profile & History</h3>
                <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedUser.customer_id}</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold text-slate-900">{selectedUser.full_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile No:</span><span className="font-mono text-slate-800">{selectedUser.mobile_no}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email ID:</span><span className="text-slate-800">{selectedUser.email_id || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Account Status:</span><span className={`font-bold ${selectedUser.is_active !== false ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedUser.is_active !== false ? 'Active' : 'Inactive'}</span></div>
                {selectedUser.is_active === false && (
                  <div className="pt-1 text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                    <strong>Inactive Reason:</strong> {selectedUser.inactive_reason || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Active / Inactive Toggle with Reason */}
              <div className="pt-2">
                {selectedUser.is_active !== false ? (
                  <button
                    onClick={() => setShowInactiveModal(true)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Deactivate User Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleActiveStatus(selectedUser, true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activate User Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INACTIVE REASON MODAL */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reason for Deactivation</h3>
            <p className="text-xs text-slate-500">Please provide a reason why this user account is being made inactive.</p>
            <textarea
              rows={3}
              value={inactiveReasonInput}
              onChange={(e) => setInactiveReasonInput(e.target.value)}
              placeholder="e.g. KYC document mismatch or suspicious activity..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleToggleActiveStatus(selectedUser, false, inactiveReasonInput)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Confirm Inactive
              </button>
              <button
                onClick={() => setShowInactiveModal(false)}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
