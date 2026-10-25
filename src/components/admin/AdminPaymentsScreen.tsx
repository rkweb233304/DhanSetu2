import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';

export const AdminPaymentsScreen: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPayments() {
      const res = await supabaseService.request('payments', 'GET');
      if (res) setPayments(res);
      setLoading(false);
    }
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p =>
    p.loan_title?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.customer_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Payment Reconciliation</h1>
          <p className="text-xs text-slate-500">Repayment transactions, status and verification</p>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <CreditCard className="w-5 h-5" />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by loan, customer ID, or transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading payments...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
          No repayment transactions recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((p) => (
            <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Customer ID: {p.customer_id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{p.loan_title}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Tx ID: {p.reference_id}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-slate-900 block">₹{p.amount?.toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] font-bold flex items-center justify-end gap-1 ${
                    p.status === 'success' ? 'text-emerald-600' : p.status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {p.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                    {p.status === 'pending' && <Clock className="w-3 h-3" />}
                    {p.status === 'failed' && <XCircle className="w-3 h-3" />}
                    <span className="capitalize">{p.status}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
