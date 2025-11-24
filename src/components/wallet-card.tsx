'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string | null;
    createdAt: string;
}

export default function WalletCard() {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchBalance = async () => {
        try {
            const res = await fetch('/api/wallet/balance');
            const data = await res.json();
            if (res.ok) {
                setBalance(data.balance);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/wallet/transactions');
            const data = await res.json();
            if (res.ok) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchBalance(), fetchTransactions()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleAddCredits = async () => {
        setAdding(true);
        try {
            const res = await fetch('/api/wallet/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 50 })
            });
            const data = await res.json();
            if (res.ok) {
                setBalance(data.balance);
                await fetchTransactions();
            }
        } catch (error) {
            console.error('Error adding credits:', error);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-6 h-6" />
                        <h2 className="text-xl font-semibold">Wallet Balance</h2>
                    </div>
                    <Button
                        onClick={handleAddCredits}
                        disabled={adding}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {adding ? 'Adding...' : 'Add ₹50'}
                    </Button>
                </div>
                <div className="text-4xl font-bold">
                    ₹{balance?.toFixed(2) || '0.00'}
                </div>
                <p className="text-purple-200 text-sm mt-2">Available Credits</p>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Transactions</h3>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    {txn.type === 'CREDIT' ? (
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-red-100 rounded-full">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {txn.description || (txn.type === 'CREDIT' ? 'Credits Added' : 'Ride Payment')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(txn.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
