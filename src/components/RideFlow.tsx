'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Bike, Car, Zap, CreditCard, Wallet, Star, MapPin, Clock, CheckCircle } from "lucide-react"
import { bookRide, startRide, completeRide, processPayment, submitReview } from "@/app/actions"
import { RideType, PaymentMethod } from "@prisma/client"

type RideState = 'IDLE' | 'BOOKED' | 'RIDING' | 'PAYMENT' | 'REVIEW' | 'COMPLETED'

const RIDE_TYPES = [
    { id: 'BIKE', label: 'Bike', icon: Bike, rate: 10, description: 'Fast & Affordable' },
    { id: 'BIKE_LITE', label: 'Bike Lite', icon: Zap, rate: 8, description: 'Cheapest Option' },
    { id: 'AUTO', label: 'Auto', icon: Car, rate: 15, description: 'Convenient' }, // Using Car icon for Auto as placeholder
    { id: 'CAB', label: 'Cab', icon: Car, rate: 25, description: 'Comfortable' },
]

export default function RideFlow() {
    const [state, setState] = useState<RideState>('IDLE')
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')
    const [selectedType, setSelectedType] = useState<RideType>('BIKE')
    const [rideId, setRideId] = useState<string | null>(null)
    const [otp, setOtp] = useState<string | null>(null)
    const [fare, setFare] = useState(0)
    const [timer, setTimer] = useState(0)
    const [rating, setRating] = useState(0)
    const [reviewComment, setReviewComment] = useState('')

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (state === 'RIDING') {
            interval = setInterval(() => {
                setTimer((prev) => Math.max(0, prev - 1))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [state])

    useEffect(() => {
        if (state === 'RIDING' && timer === 0) {
            const complete = async () => {
                if (!rideId) return
                try {
                    await completeRide(rideId)
                    setState('PAYMENT')
                    toast.success("Ride ended")
                } catch (error) {
                    toast.error("Failed to complete ride")
                }
            }
            complete()
        }
    }, [state, timer, rideId])

    const handleBook = async () => {
        if (!pickup || !dropoff) {
            toast.error("Please enter pickup and dropoff locations")
            return
        }

        try {
            // Simple distance simulation
            const distance = Math.floor(Math.random() * 10) + 2
            const rate = RIDE_TYPES.find(t => t.id === selectedType)?.rate || 10
            const calculatedFare = distance * rate
            setFare(calculatedFare)

            const ride = await bookRide({
                pickup,
                dropoff,
                type: selectedType,
                fare: calculatedFare
            })

            setRideId(ride.id)
            setOtp(ride.otp)
            setState('BOOKED')
            toast.success("Ride booked successfully!")
        } catch (error) {
            toast.error("Failed to book ride")
            console.error(error)
        }
    }

    const handleStartRide = async () => {
        if (!rideId) return
        try {
            await startRide(rideId)
            setState('RIDING')
            setTimer(15)
            toast.info("Ride started")
        } catch (error) {
            toast.error("Failed to start ride")
        }
    }

    const handlePayment = async (method: PaymentMethod) => {
        if (!rideId) return
        try {
            await processPayment(rideId, method)
            setState('REVIEW')
            toast.success("Payment successful")
        } catch (error) {
            toast.error("Payment failed. Insufficient balance?")
        }
    }

    const handleSubmitReview = async () => {
        if (!rideId) return
        try {
            await submitReview(rideId, rating, reviewComment)
            setState('COMPLETED')
            toast.success("Review submitted")
            // Reset flow after a delay or user action
            setTimeout(() => {
                resetFlow()
            }, 3000)
        } catch (error) {
            toast.error("Failed to submit review")
        }
    }

    const resetFlow = () => {
        setState('IDLE')
        setPickup('')
        setDropoff('')
        setRideId(null)
        setOtp(null)
        setFare(0)
        setRating(0)
        setReviewComment('')
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            {state === 'IDLE' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Book a Ride</CardTitle>
                        <CardDescription>Select your ride and destination</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                <Input
                                    placeholder="Pickup Location"
                                    className="pl-9"
                                    value={pickup}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickup(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                                <Input
                                    placeholder="Dropoff Location"
                                    className="pl-9"
                                    value={dropoff}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDropoff(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {RIDE_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center gap-2 transition-colors ${selectedType === type.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                    onClick={() => setSelectedType(type.id as RideType)}
                                >
                                    <type.icon className="h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold text-sm">{type.label}</div>
                                        <div className="text-xs text-muted-foreground">₹{type.rate}/km</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleBook}>Book Ride</Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'BOOKED' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ride Booked!</CardTitle>
                        <CardDescription>Share this OTP with your captain</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6">
                        <div className="text-4xl font-bold tracking-widest text-primary">{otp}</div>
                        <div className="text-center space-y-1">
                            <div className="font-medium">Captain is arriving</div>
                            <div className="text-sm text-muted-foreground">Vehicle: KA 01 AB 1234</div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleStartRide}>Start Ride (Simulate)</Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'RIDING' && (
                <Card>
                    <CardHeader>
                        <CardTitle>On Trip</CardTitle>
                        <CardDescription>Enjoy your ride</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
                            <div className="text-2xl font-bold">{timer}s</div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Estimated arrival in {timer} seconds</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {state === 'PAYMENT' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment</CardTitle>
                        <CardDescription>Total Fare: ₹{fare}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-14"
                            onClick={() => handlePayment('CASH')}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-semibold">Cash</div>
                                <div className="text-xs text-muted-foreground">Pay cash to captain</div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-14"
                            onClick={() => handlePayment('WALLET')}
                        >
                            <Wallet className="mr-2 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-semibold">Wallet</div>
                                <div className="text-xs text-muted-foreground">Deduct from balance</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {state === 'REVIEW' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rate your Ride</CardTitle>
                        <CardDescription>How was your experience?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <Input
                            placeholder="Add a comment (optional)"
                            value={reviewComment}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewComment(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSubmitReview} disabled={rating === 0}>Submit Review</Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'COMPLETED' && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <div className="text-xl font-bold text-green-700">Thank You!</div>
                        <div className="text-green-600">Your ride has been completed.</div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
