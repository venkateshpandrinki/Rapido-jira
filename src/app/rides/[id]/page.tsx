'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Navigation, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ride {
    id: string;
    pickup: string;
    dropoff: string;
    fare: number;
    status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    driverName: string | null;
    driverPhone: string | null;
    createdAt: string;
}

export default function RideStatusPage() {
    const params = useParams();
    const router = useRouter();
    const [ride, setRide] = useState<Ride | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRideStatus();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchRideStatus, 5000);
        return () => clearInterval(interval);
    }, [params.id]);

    const fetchRideStatus = async () => {
        try {
            const res = await fetch('/api/rides');
            const data = await res.json();
            if (res.ok) {
                const currentRide = data.rides.find((r: Ride) => r.id === params.id);
                if (currentRide) {
                    setRide(currentRide);
                }
            }
        } catch (error) {
            console.error('Error fetching ride status:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/rides/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                await fetchRideStatus();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-lg">Loading ride details...</div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-lg text-gray-600">Ride not found</p>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ONGOING': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Status Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Ride Status</h1>
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(ride.status)}`}>
                        {ride.status}
                    </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-4 mt-6">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-600">Pickup</p>
                            <p className="text-lg font-semibold text-gray-800">{ride.pickup}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Navigation className="w-6 h-6 text-red-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-600">Dropoff</p>
                            <p className="text-lg font-semibold text-gray-800">{ride.dropoff}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-purple-600 mt-1" />
                        <div>
                            <p className="text-sm text-gray-600">Booked At</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {new Date(ride.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fare */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Total Fare</span>
                        <span className="text-2xl font-bold text-purple-600">₹{ride.fare.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Driver Details */}
            {ride.driverName && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Driver Details</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {ride.driverName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-600" />
                                <p className="text-lg font-semibold text-gray-800">{ride.driverName}</p>
                            </div>
                            {ride.driverPhone && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4 text-gray-600" />
                                    <p className="text-gray-600">{ride.driverPhone}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
                <div className="flex gap-3">
                    {ride.status === 'ONGOING' && (
                        <Button
                            onClick={() => updateStatus('COMPLETED')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Mark as Completed
                        </Button>
                    )}
                    {(ride.status === 'PENDING' || ride.status === 'ONGOING') && (
                        <Button
                            onClick={() => updateStatus('CANCELLED')}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            Cancel Ride
                        </Button>
                    )}
                    {ride.status === 'COMPLETED' && (
                        <Button
                            onClick={() => router.push('/rides/history')}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            View Ride History
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
