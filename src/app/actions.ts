'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RideType, PaymentMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function bookRide(data: {
    pickup: string
    dropoff: string
    type: RideType
    fare: number
}) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("User not found")
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    const ride = await prisma.ride.create({
        data: {
            userId: user.id,
            pickup: data.pickup,
            dropoff: data.dropoff,
            type: data.type,
            fare: data.fare,
            otp,
            status: "PENDING",
        },
    })

    return ride
}

export async function startRide(rideId: string) {
    await prisma.ride.update({
        where: { id: rideId },
        data: { status: "ONGOING" },
    })
    revalidatePath("/")
}

export async function completeRide(rideId: string) {
    await prisma.ride.update({
        where: { id: rideId },
        data: { status: "COMPLETED" },
    })
    revalidatePath("/")
}

export async function processPayment(rideId: string, method: PaymentMethod) {
    const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { user: true },
    })

    if (!ride) throw new Error("Ride not found")

    if (method === "WALLET") {
        if (ride.user.walletBalance < ride.fare) {
            throw new Error("Insufficient wallet balance")
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: ride.userId },
                data: { walletBalance: { decrement: ride.fare } },
            }),
            prisma.transaction.create({
                data: {
                    userId: ride.userId,
                    amount: ride.fare,
                    type: "DEBIT",
                    description: `Ride payment for ${ride.id}`,
                },
            }),
            prisma.ride.update({
                where: { id: rideId },
                data: { paymentMethod: method },
            }),
        ])
    } else {
        await prisma.ride.update({
            where: { id: rideId },
            data: { paymentMethod: method },
        })
    }

    revalidatePath("/")
}

export async function submitReview(rideId: string, rating: number, comment?: string) {
    await prisma.review.create({
        data: {
            rideId,
            rating,
            comment,
        },
    })
    revalidatePath("/")
}
