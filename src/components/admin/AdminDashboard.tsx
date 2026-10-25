import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Settings, 
  Database,
  UserCheck,
  Briefcase,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { adminStats, fetchAdminStats, updateUserRole, showToast } = useApp();
  const [searchId, setSearchId] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('retailer');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleUpdateRole = async () => {
    if (!searchId) {
      showToast('Please enter a Customer ID', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      await updateUserRole(searchId, targetRole);
      setSearchId('');
    } catch (e) {
      showToast('Failed to update role', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">System Overview & Management</p>
        </div>
        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
          <Database className="w-5 h-5" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-blue-600 font-bold">Total</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Users</p>
            <p className="text-2xl font-black">{adminStats.totalUsers}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Active</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Given Users</p>
            <p className="text-2xl font-black">{adminStats.totalActiveLoans}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-amber-600 font-bold">Capital</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Given</p>
            <p className="text-lg font-black font-mono">₹{adminStats.totalGivenAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-purple-600 font-bold">Returns</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Recovered</p>
            <p className="text-lg font-black font-mono">₹{adminStats.totalRecovered.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold">User Role Management</h2>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Customer ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 2026102401"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['customer', 'retailer', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setTargetRole(role)}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  targetRole === role 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={handleUpdateRole}
            disabled={isUpdating}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
          >
            {isUpdating ? 'Updating...' : 'Apply Role Change'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Manage Loan Offers</p>
                <p className="text-[10px] text-slate-500">Edit interest rates & amounts</p>
              </div>
            </div>
            <button className="text-slate-400"><ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">System Health</p>
                <p className="text-[10px] text-slate-500">Check Supabase connection</p>
              </div>
            </div>
            <button className="text-slate-400"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
