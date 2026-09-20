import React from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  ShieldCheck,
  Heart,
  Truck,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Building2,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-bgLight text-textDark flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Anna Setu Zero Waste Initiative
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Connecting Surplus Food to <span className="text-primaryGreen">Needy Hands</span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              FoodBridge bridges restaurants with surplus food to verified NGOs and volunteer delivery fleets — ensuring zero food waste, 100% OTP security, and verified headcount distribution.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-primaryGreen hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                Donate Food <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-borderLight text-gray-800 font-bold text-sm shadow-xs transition-all"
              >
                Request Food / NGO Login
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Visual Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="ngo-card p-6 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-amber-500/10 border border-emerald-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
                alt="Food Distribution Drive"
                className="w-full h-80 object-cover rounded-2xl border border-gray-200 shadow-sm"
              />
              <div className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 block">Verified Distribution</span>
                  <span className="text-sm font-extrabold text-gray-900">50 Hot Meals Served Today</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white border-y border-gray-200 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-primaryGreen">15,000+ kg</div>
            <div className="text-xs font-semibold text-gray-500">Total Food Saved</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-gray-900">120+</div>
            <div className="text-xs font-semibold text-gray-500">NGOs Connected</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-accentOrange">60,000+</div>
            <div className="text-xs font-semibold text-gray-500">Meals Served</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">99.4%</div>
            <div className="text-xs font-semibold text-gray-500">Success Rate</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900">How FoodBridge Works</h2>
          <p className="text-xs text-gray-500">Simple 4-step accountable chain connecting donor restaurants to hungry people.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="ngo-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Post Food Surplus</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Restaurant posts quantity (kg), prep time, expiry window & pickup instructions.
            </p>
          </div>

          <div className="ngo-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Claim & Match</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nearby verified NGO claims food & requests volunteer delivery transport.
            </p>
          </div>

          <div className="ngo-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 font-bold flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-gray-900 text-sm">OTP & Live GPS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              4-digit OTP verified at pickup. Live GPS location tracked in real-time.
            </p>
          </div>

          <div className="ngo-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 font-bold flex items-center justify-center mx-auto">
              4
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Distribution Proof</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Photo proof & headcount fed submitted to complete audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100/70 border-t border-gray-200 py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Partner Testimonials</h2>
            <p className="text-xs text-gray-500">Trusted by top restaurants and social service organizations.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="ngo-card p-6 space-y-3 bg-white">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 italic">
                "FoodBridge eliminated our daily food waste entirely. The OTP system guarantees our surplus reaches genuine registered NGOs safely."
              </p>
              <div className="text-xs font-bold text-gray-900 pt-2">— Chef Vikram, Spice Garden Restaurant</div>
            </div>

            <div className="ngo-card p-6 space-y-3 bg-white">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 italic">
                "The live GPS volunteer tracking and headcount proof photos give complete accountability to our donors and trustees."
              </p>
              <div className="text-xs font-bold text-gray-900 pt-2">— Sunita Deshmukh, Feeding Hope Foundation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 text-center text-xs text-gray-500">
        © 2026 FoodBridge (Anna Setu). Sustainability & Zero Waste Platform.
      </footer>
    </div>
  );
}
