'use client';

import React from 'react';
import { History } from 'lucide-react';
import { Transaction } from '../data/mockData';

interface LedgerTabProps {
  transactions: Transaction[];
}

export default function LedgerTab({ transactions }: LedgerTabProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <History className="w-5 h-5 text-blue-500" /> Settlement & Yield Activity Log
      </h2>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
            <div>
              <p className="text-white font-medium">{tx.type.replace('_', ' ')}</p>
              <p className="text-slate-500 text-xs">{tx.id} • {tx.date}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">{tx.amount}</p>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}