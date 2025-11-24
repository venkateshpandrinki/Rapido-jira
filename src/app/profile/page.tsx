'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletCard from '@/components/wallet-card';

interface UserProfile {
    name: string | null;
    email: string | null;
    image: string | null;
    walletBalance: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-lg">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-lg text-gray-600">Please sign in to view your profile</p>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-6 mb-6">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-24 h-24 rounded-full border-4 border-purple-200"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name || 'User'}</h1>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/api/auth/signout')}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Wallet Section */}
            <WalletCard />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-6"
                    >
                        Book a Ride
                    </Button>
                    <Button
                        onClick={() => router.push('/rides/history')}
                        variant="outline"
                        className="py-6"
                    >
                        View Ride History
                    </Button>
                </div>
            </div>
        </div>
    );
}
