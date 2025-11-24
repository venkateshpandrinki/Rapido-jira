'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Driver {
    id: string;
    name: string;
    phone: string;
    rating: number;
    distance: number;
}

export default function RideBooking() {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await fetch('/api/rides/book');
            const data = await res.json();
            if (res.ok) {
                setDrivers(data.drivers);
                if (data.drivers.length > 0) {
                    setSelectedDriver(data.drivers[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const estimateFare = () => {
        if (pickup && dropoff) {
            // Mock fare estimation
            const baseFare = 30;
            const perKmRate = 12;
            const mockDistance = Math.random() * 10 + 2;
            setEstimatedFare(Math.round(baseFare + (mockDistance * perKmRate)));
        }
    };

    useEffect(() => {
        if (pickup && dropoff) {
            estimateFare();
        } else {
            setEstimatedFare(null);
        }
    }, [pickup, dropoff]);

    const handleBookRide = async () => {
        if (!pickup || !dropoff || !selectedDriver) return;

        setBooking(true);
        try {
            const res = await fetch('/api/rides/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup,
                    dropoff,
                    driverId: selectedDriver
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Ride booked successfully! Your driver ${data.driver.name} will arrive soon.`);
                setPickup('');
                setDropoff('');
                setEstimatedFare(null);
                // Redirect to ride status page
                window.location.href = `/rides/${data.ride.id}`;
            } else {
                alert(data.error || 'Failed to book ride');
            }
        } catch (error) {
            console.error('Error booking ride:', error);
            alert('Failed to book ride');
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Booking Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Book a Ride</h2>

                <div className="space-y-4">
                    {/* Pickup Location */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pickup Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                            <input
                                type="text"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                placeholder="Enter pickup location"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Dropoff Location */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dropoff Location
                        </label>
                        <div className="relative">
                            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                            <input
                                type="text"
                                value={dropoff}
                                onChange={(e) => setDropoff(e.target.value)}
                                placeholder="Enter dropoff location"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Estimated Fare */}
                    {estimatedFare && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Estimated Fare</span>
                                </div>
                                <span className="text-2xl font-bold text-purple-600">₹{estimatedFare}</span>
                            </div>
                        </div>
                    )}

                    {/* Driver Selection */}
                    {drivers.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Available Drivers
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {drivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        onClick={() => setSelectedDriver(driver.id)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedDriver === driver.id
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {driver.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{driver.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span>{driver.rating}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{driver.distance} km away</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Book Button */}
                    <Button
                        onClick={handleBookRide}
                        disabled={!pickup || !dropoff || !selectedDriver || booking}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg disabled:opacity-50"
                    >
                        {booking ? 'Booking...' : 'Book Ride'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
