import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignIn from "@/components/ui/sign-in";
import RideFlow from "@/components/RideFlow";
import WalletCard from "@/components/wallet-card";
import { Car, Zap, Shield, Clock } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-3xl shadow-lg">
                <Zap className="w-8 h-8" />
                <span>Rapido</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Your Ride,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                On Demand
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Book rides instantly, track in real-time, and pay with credits. Fast, reliable, and affordable.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Quick Booking</h3>
                  <p className="text-sm text-gray-600">Book in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Safe & Secure</h3>
                  <p className="text-sm text-gray-600">Verified drivers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">24/7 Available</h3>
                  <p className="text-sm text-gray-600">Anytime, anywhere</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Instant Credits</h3>
                  <p className="text-sm text-gray-600">Easy payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>
            <p className="text-gray-600 mb-6">Sign in with Google to start booking rides</p>
            <SignIn />
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                New users get ₹100 credits for free! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Booking Section */}
        <div className="lg:col-span-2">
          <RideFlow />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WalletCard />
        </div>
      </div>
    </div>
  );
}
