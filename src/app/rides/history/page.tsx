'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ride {
    id: string;
    pickup: string;
    dropoff: string;
    fare: number;
    status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    driverName: string | null;
    createdAt: string;
}

export default function RideHistoryPage() {
    const router = useRouter();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const res = await fetch('/api/rides');
            const data = await res.json();
            if (res.ok) {
                setRides(data.rides);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'ONGOING': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-lg">Loading ride history...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ride History</h1>
                <Button onClick={() => router.push('/')}>Book New Ride</Button>
            </div>

            {rides.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <p className="text-gray-600 text-lg mb-4">No rides yet</p>
                    <Button onClick={() => router.push('/')}>Book Your First Ride</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rides.map((ride) => (
                        <div
                            key={ride.id}
                            onClick={() => router.push(`/rides/${ride.id}`)}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ride.status)}`}>
                                            {ride.status}
                                        </span>
                                        {ride.driverName && (
                                            <span className="text-sm text-gray-600">
                                                Driver: {ride.driverName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Pickup</p>
                                                <p className="text-sm font-medium text-gray-800">{ride.pickup}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Navigation className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Dropoff</p>
                                                <p className="text-sm font-medium text-gray-800">{ride.dropoff}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-600 mb-2">
                                        <DollarSign className="w-5 h-5" />
                                        <span className="text-2xl font-bold">₹{ride.fare}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
