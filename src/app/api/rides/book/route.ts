import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock driver data
const MOCK_DRIVERS = [
    { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, distance: 0.5 },
    { id: '2', name: 'Amit Singh', phone: '+91 98765 43211', rating: 4.6, distance: 0.8 },
    { id: '3', name: 'Priya Sharma', phone: '+91 98765 43212', rating: 4.9, distance: 1.2 },
    { id: '4', name: 'Vikram Patel', phone: '+91 98765 43213', rating: 4.7, distance: 1.5 },
];

// Simple fare calculation: base fare + distance * rate
function calculateFare(pickup: string, dropoff: string): number {
    const baseFare = 30;
    const perKmRate = 12;
    // Mock distance calculation (in real app, use map API)
    const mockDistance = Math.random() * 10 + 2; // 2-12 km
    return Math.round(baseFare + (mockDistance * perKmRate));
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pickup, dropoff, driverId } = await req.json();

        if (!pickup || !dropoff) {
            return NextResponse.json({ error: 'Pickup and dropoff locations are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const fare = calculateFare(pickup, dropoff);

        // Check if user has sufficient balance
        if (user.walletBalance < fare) {
            return NextResponse.json({
                error: 'Insufficient balance',
                required: fare,
                current: user.walletBalance
            }, { status: 400 });
        }

        // Find selected driver
        const driver = MOCK_DRIVERS.find(d => d.id === driverId) || MOCK_DRIVERS[0];

        // Create ride and deduct from wallet
        const [ride, updatedUser, transaction] = await prisma.$transaction([
            prisma.ride.create({
                data: {
                    userId: user.id,
                    pickup,
                    dropoff,
                    fare,
                    driverName: driver.name,
                    driverPhone: driver.phone,
                    status: 'ONGOING'
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { decrement: fare } }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: fare,
                    type: 'DEBIT',
                    description: `Ride from ${pickup} to ${dropoff}`
                }
            })
        ]);

        return NextResponse.json({
            ride,
            newBalance: updatedUser.walletBalance,
            driver
        });
    } catch (error) {
        console.error('Error creating ride:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get available drivers
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return mock drivers
        return NextResponse.json({ drivers: MOCK_DRIVERS });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
