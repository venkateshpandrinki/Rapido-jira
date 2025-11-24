'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Bike, Car, Zap, CreditCard, Wallet, Star, MapPin, Clock, CheckCircle, Navigation } from "lucide-react"
import { bookRide, startRide, completeRide, processPayment, submitReview } from "@/app/actions"
import { RideType, PaymentMethod } from "@prisma/client"

type RideState = 'IDLE' | 'BOOKED' | 'RIDING' | 'PAYMENT' | 'REVIEW' | 'COMPLETED'

const RIDE_TYPES = [
    { id: 'BIKE', label: 'Bike', icon: Bike, rate: 10, description: 'Fast & Affordable' },
    { id: 'BIKE_LITE', label: 'Bike Lite', icon: Zap, rate: 8, description: 'Cheapest Option' },
    { id: 'AUTO', label: 'Auto', icon: Car, rate: 15, description: 'Convenient' },
    { id: 'CAB', label: 'Cab', icon: Car, rate: 25, description: 'Comfortable' },
]

const DUMMY_DRIVERS = [
    { name: "Ramesh Kumar", vehicle: "KA 01 AB 1234", rating: 4.8, phone: "9876543210" },
    { name: "Suresh Singh", vehicle: "KA 05 MN 5678", rating: 4.5, phone: "9876543211" },
    { name: "Abdul Rahman", vehicle: "KA 53 XY 9012", rating: 4.9, phone: "9876543212" },
    { name: "John Doe", vehicle: "KA 03 CD 3456", rating: 4.7, phone: "9876543213" },
    { name: "Manjunath R", vehicle: "KA 04 EF 7890", rating: 4.6, phone: "9876543214" },
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
    const [driver, setDriver] = useState<typeof DUMMY_DRIVERS[0] | null>(null)

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
            const distance = Math.floor(Math.random() * 10) + 2
            const rate = RIDE_TYPES.find(t => t.id === selectedType)?.rate || 10
            const calculatedFare = distance * rate
            setFare(calculatedFare)

            // Select random driver
            const randomDriver = DUMMY_DRIVERS[Math.floor(Math.random() * DUMMY_DRIVERS.length)]
            setDriver(randomDriver)

            const ride = await bookRide({
                pickup,
                dropoff,
                type: selectedType,
                fare: calculatedFare,
                driverName: randomDriver.name,
                driverPhone: randomDriver.phone
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
            setTimer(30)
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
        setDriver(null)
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            {state === 'IDLE' && (
                <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-[#FFD700] rounded-t-xl text-black">
                        <CardTitle className="flex items-center gap-2">
                            <Navigation className="h-6 w-6" />
                            Book a Ride
                        </CardTitle>
                        <CardDescription className="text-black/70">Where to today?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-3 top-3 h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                                <Input
                                    placeholder="Pickup Location"
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700] transition-all"
                                    value={pickup}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickup(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                                <Input
                                    placeholder="Dropoff Location"
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700] transition-all"
                                    value={dropoff}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDropoff(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {RIDE_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    className={`p-4 border rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all duration-200 ${selectedType === type.id
                                        ? 'border-[#FFD700] bg-[#FFD700]/10 shadow-md scale-[1.02]'
                                        : 'border-gray-100 hover:border-[#FFD700]/50 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSelectedType(type.id as RideType)}
                                >
                                    <div className={`p-2 rounded-full ${selectedType === type.id ? 'bg-[#FFD700] text-black' : 'bg-gray-100 text-gray-600'}`}>
                                        <type.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-sm text-gray-800">{type.label}</div>
                                        <div className="text-xs text-gray-500">₹{type.rate}/km</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full h-12 text-lg font-bold bg-[#FFD700] hover:bg-[#E5C100] text-black shadow-lg shadow-yellow-200 transition-all active:scale-95"
                            onClick={handleBook}
                        >
                            Book Ride
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'BOOKED' && (
                <Card className="border-none shadow-xl overflow-hidden">
                    <div className="bg-[#FFD700] p-6 text-center">
                        <h2 className="text-2xl font-bold text-black mb-1">Ride Booked!</h2>
                        <p className="text-black/70">Your captain is on the way</p>
                    </div>
                    <CardContent className="flex flex-col items-center space-y-6 pt-8">
                        <div className="text-center space-y-2">
                            <div className="text-5xl font-black tracking-widest text-gray-800 font-mono bg-gray-100 px-6 py-3 rounded-xl border-2 border-dashed border-gray-300">
                                {otp}
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">OTP for Verification</p>
                        </div>

                        {driver && (
                            <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-[#FFD700] flex items-center justify-center text-xl font-bold text-black">
                                    {driver.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{driver.name}</h3>
                                    <p className="text-sm text-gray-500">{driver.vehicle}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                                    <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                                    <span className="font-bold text-sm">{driver.rating}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl"
                            onClick={handleStartRide}
                        >
                            Start Ride (Simulate)
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'RIDING' && (
                <Card className="border-none shadow-xl overflow-hidden">
                    <div className="bg-green-500 p-6 text-center text-white">
                        <h2 className="text-2xl font-bold mb-1">On Trip</h2>
                        <p className="text-white/80">Heading to destination</p>
                    </div>
                    <CardContent className="flex flex-col items-center space-y-8 pt-10 pb-10">
                        <div className="relative h-40 w-40 flex items-center justify-center">
                            <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
                            <div className="absolute inset-0 border-8 border-[#FFD700] rounded-full animate-spin border-t-transparent"></div>
                            <div className="text-4xl font-black text-gray-800">{timer}s</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Estimated arrival time</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {state === 'PAYMENT' && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">Payment Due</CardTitle>
                        <div className="text-4xl font-black text-[#FFD700] mt-2">₹{fare}</div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-16 px-6 border-2 hover:border-[#FFD700] hover:bg-[#FFD700]/5 group transition-all"
                            onClick={() => handlePayment('CASH')}
                        >
                            <div className="p-2 bg-green-100 rounded-full mr-4 group-hover:bg-[#FFD700] transition-colors">
                                <CreditCard className="h-6 w-6 text-green-700 group-hover:text-black" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Cash</div>
                                <div className="text-xs text-gray-500">Pay directly to captain</div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-16 px-6 border-2 hover:border-[#FFD700] hover:bg-[#FFD700]/5 group transition-all"
                            onClick={() => handlePayment('WALLET')}
                        >
                            <div className="p-2 bg-purple-100 rounded-full mr-4 group-hover:bg-[#FFD700] transition-colors">
                                <Wallet className="h-6 w-6 text-purple-700 group-hover:text-black" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Wallet</div>
                                <div className="text-xs text-gray-500">Fast & seamless</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {state === 'REVIEW' && (
                <Card className="border-none shadow-xl text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-4">
                            <Star className="h-8 w-8 text-[#FFD700] fill-[#FFD700]" />
                        </div>
                        <CardTitle>Rate your Ride</CardTitle>
                        <CardDescription>How was your experience with {driver?.name}?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-10 w-10 cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <Input
                            placeholder="Write a compliment..."
                            className="bg-gray-50 border-gray-200"
                            value={reviewComment}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewComment(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold h-12 rounded-xl"
                            onClick={handleSubmitReview}
                            disabled={rating === 0}
                        >
                            Submit Review
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {state === 'COMPLETED' && (
                <Card className="border-none shadow-xl bg-green-500 text-white">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                        <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-3xl font-black">Awesome!</div>
                            <div className="text-white/90">Thank you for riding with us.</div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
