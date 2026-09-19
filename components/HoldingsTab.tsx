'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { PropertyAsset } from '../data/mockData';

interface HoldingsTabProps {
  assets: PropertyAsset[];
}

export default function HoldingsTab({ assets }: HoldingsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-500" /> Fractional Real Estate Holdings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                <p className="text-slate-400 text-xs">{asset.location}</p>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md">
                LLP Fraction
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Fraction Value</p>
                <p className="text-white font-semibold">₹{asset.fractionValue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Monthly Rent Yield</p>
                <p className="text-emerald-400 font-semibold">₹{asset.monthlyYield.toLocaleString('en-IN')}/mo</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Tenant & Occupancy</p>
                <p className="text-slate-300 text-xs font-medium">{asset.occupancy}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Lease Lock-in</p>
                <p className="text-slate-300 text-xs font-medium">{asset.leaseExpiry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
