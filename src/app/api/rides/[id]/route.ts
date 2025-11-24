import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await req.json();

        if (!['PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const ride = await prisma.ride.findFirst({
            where: {
                id: id,
                userId: user.id
            }
        });

        if (!ride) {
            return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
        }

        const updatedRide = await prisma.ride.update({
            where: { id: id },
            data: { status }
        });

        return NextResponse.json({ ride: updatedRide });
    } catch (error) {
        console.error('Error updating ride:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
