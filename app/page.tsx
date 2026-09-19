'use client';

import React, { useState } from 'react';
import { Building2, ShieldCheck, LogIn, LogOut, Lock } from 'lucide-react';

import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

import OverviewTab from '../components/OverviewTab';
import HoldingsTab from '../components/HoldingsTab';
import MarketplaceTab from '../components/MarketplaceTab';
import LedgerTab from '../components/LedgerTab';

import { mockAssets, mockTransactions } from '../data/mockData';

function MainDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'market' | 'ledger'>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const holdingNAV = 500000;
  const monthlyRent = 3750;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 max-w-7xl mx-auto gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </span>
            ProfitAs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Fractional Real Estate Liquidity & Settlement Protocol</p>
        </div>

        {/* Global Navigation Tabs */}
        {isAuthenticated && (
          <nav className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'assets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Holdings
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'market' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              P2P Market
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'ledger' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ledger
            </button>
          </nav>
        )}

        {/* User Auth Actions */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Asset-Backed LLP
          </span>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="text-xs text-right">
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-slate-400 text-[10px]">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <LogIn className="w-4 h-4" /> Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-8">
        {isAuthenticated ? (
          <>
            {activeTab === 'overview' && <OverviewTab holdingNAV={holdingNAV} monthlyRent={monthlyRent} />}
            {activeTab === 'assets' && <HoldingsTab assets={mockAssets} />}
            {activeTab === 'market' && <MarketplaceTab />}
            {activeTab === 'ledger' && <LedgerTab transactions={mockTransactions} />}
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-2xl mx-auto my-12 space-y-6">
            <div className="inline-flex bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Investor Portal Secured</h2>
              <p className="text-slate-400 text-sm mt-2">
                Log in to access your portfolio metrics, execute 48-hour instant cash buybacks, or request Flash Credit overdraft lines.
              </p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Log In to View Holdings
            </button>
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

// CRITICAL STEP: Next.js requires this exact default export line at the bottom!
export default function Page() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}