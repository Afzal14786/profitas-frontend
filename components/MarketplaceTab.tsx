'use client';

import React from 'react';

export default function MarketplaceTab() {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Peer-to-Peer Secondary Market</h2>
        <p className="text-slate-400 text-sm mt-1">List your fractions at custom prices to trade directly with other investors.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-3">Asset</th>
              <th className="p-3">Asking Price</th>
              <th className="p-3">NAV Value</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="p-3 font-medium text-white">CyberTowers Fraction #104</td>
              <td className="p-3 text-emerald-400 font-bold">₹3,45,000</td>
              <td className="p-3 text-slate-400">₹3,50,000</td>
              <td className="p-3 text-blue-400">1.4% Discount</td>
              <td className="p-3">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
                  Buy Fraction
                </button>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-white">Infinity Logistics #88</td>
              <td className="p-3 text-emerald-400 font-bold">₹1,50,000</td>
              <td className="p-3 text-slate-400">₹1,50,000</td>
              <td className="p-3 text-slate-400">At Par</td>
              <td className="p-3">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
                  Buy Fraction
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}