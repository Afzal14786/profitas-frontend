export interface PropertyAsset {
  id: string;
  name: string;
  location: string;
  fractionValue: number;
  monthlyYield: number;
  occupancy: string;
  leaseExpiry: string;
}

export interface Transaction {
  id: string;
  type: 'RENT_PAYOUT' | 'INSTANT_EXIT' | 'OVERDRAFT_DISBURSED';
  amount: string;
  date: string;
  status: string;
}

export const mockAssets: PropertyAsset[] = [
  {
    id: 'prop-1',
    name: 'CyberTowers Tech Park',
    location: 'Hyderabad, TS',
    fractionValue: 350000,
    monthlyYield: 2625,
    occupancy: '100% (MNC Tenant)',
    leaseExpiry: '2029 (5 Yrs Remaining)',
  },
  {
    id: 'prop-2',
    name: 'Infinity Logistics Hub',
    location: 'Bhiwandi, MH',
    fractionValue: 150000,
    monthlyYield: 1125,
    occupancy: '98% (3PL Logistics)',
    leaseExpiry: '2031 (7 Yrs Remaining)',
  },
];

export const mockTransactions: Transaction[] = [
  { id: 'TX-9081', type: 'RENT_PAYOUT', amount: '+ ₹3,750', date: 'Jul 01, 2026', status: 'COMPLETED' },
  { id: 'TX-8842', type: 'RENT_PAYOUT', amount: '+ ₹3,750', date: 'Jun 01, 2026', status: 'COMPLETED' },
  { id: 'TX-7210', type: 'INSTANT_EXIT', amount: '+ ₹1,94,000', date: 'May 14, 2026', status: 'SETTLED_48HR' },
];