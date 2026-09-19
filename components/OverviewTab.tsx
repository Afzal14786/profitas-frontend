'use client';

import React, { useState } from 'react';
import { Wallet, ArrowUpRight, Zap, Layers, RefreshCw } from 'lucide-react';

interface OverviewTabProps {
  holdingNAV: number;
  monthlyRent: number;
}

export default function OverviewTab({ holdingNAV, monthlyRent }: OverviewTabProps) {
  const haircutRate = 0.03; 
  const haircutFee = holdingNAV * haircutRate;
  const netExitPayout = holdingNAV - haircutFee;

  const maxLTV = 0.70; 
  const annualInterestRate = 0.11; 
  const [loanRequested, setLoanRequested] = useState<number>(250000); 
  
  const maxLoanAllowed = holdingNAV * maxLTV;
  const monthlyInterestOwed = (loanRequested * annualInterestRate) / 12;
  const netRentAfterSweep = monthlyRent - monthlyInterestOwed;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between text-slate-400 text-xs mb-2">
            <span>Total Portfolio NAV</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{holdingNAV.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">2 Commercial Properties</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between text-slate-400 text-xs mb-2">
            <span>Monthly Yield</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₹{monthlyRent.toLocaleString('en-IN')}/mo
          </div>
          <p className="text-xs text-slate-500 mt-1">Annualized Yield: 9.0% p.a.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between text-slate-400 text-xs mb-2">
            <span>Instant Exit Liquidity</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">Guaranteed</div>
          <p className="text-xs text-slate-500 mt-1">48-Hr Direct Buyback</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between text-slate-400 text-xs mb-2">
            <span>Platform Liquidity Pool</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300">₹2.50 Cr</div>
          <p className="text-xs text-emerald-400 mt-1">● Reserve Healthy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" /> Option A: Instant Cash Exit (3% Haircut)
              </h2>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                48-Hr Settlement
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              ProfitAs automatically purchases your real estate fraction using our automated liquidity pool.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl space-y-3 border border-slate-800/80 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Gross Portfolio NAV</span>
                <span className="text-white font-medium">₹{holdingNAV.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Liquidity Fee (3% Haircut)</span>
                <span className="text-rose-400 font-medium">- ₹{haircutFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between font-semibold text-base">
                <span className="text-slate-200">Net Cash Disbursal</span>
                <span className="text-emerald-400">₹{netExitPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert(`Instant Exit requested for ₹${netExitPayout.toLocaleString('en-IN')}`)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.99]"
          >
            Execute 48-Hour Cash Exit
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Option B: Rental Overdraft (Flash Credit)
              </h2>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20">
                70% Max LTV
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Pledge your fraction as collateral without selling. Rental yield repays monthly interest automatically.
            </p>

            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Credit Line Requested:</span>
                <span className="font-bold text-amber-400 text-base">₹{loanRequested.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max={maxLoanAllowed} 
                step="5000"
                value={loanRequested} 
                onChange={(e) => setLoanRequested(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 text-slate-400 border-t border-slate-800/60">
                <div>
                  <span>Interest Rate:</span> <strong className="text-slate-200">11% p.a.</strong>
                </div>
                <div>
                  <span>Monthly Interest Owed:</span> <strong className="text-rose-400">₹{monthlyInterestOwed.toFixed(0)}/mo</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/40 text-emerald-400">
                  <span>Net Rent Leftover:</span> <strong>₹{netRentAfterSweep.toFixed(0)}/mo</strong>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert(`Overdraft approved for ₹${loanRequested.toLocaleString('en-IN')}!`)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-[0.99]"
          >
            Disburse Instant Credit
          </button>
        </div>
      </div>
    </div>
  );
}