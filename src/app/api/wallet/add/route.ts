import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update wallet balance and create transaction
        const [updatedUser, transaction] = await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { increment: amount } }
            }),
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount,
                    type: 'CREDIT',
                    description: 'Credits added to wallet'
                }
            })
        ]);

        return NextResponse.json({
            balance: updatedUser.walletBalance,
            transaction
        });
    } catch (error) {
        console.error('Error adding credits:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
