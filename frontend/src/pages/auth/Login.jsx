import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/authSlice";
import { ShieldCheck, UtensilsCrossed, Heart, Truck, Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "restaurant") navigate("/restaurant");
      else if (user.role === "ngo") navigate("/ngo");
      else if (user.role === "volunteer") navigate("/volunteer");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    dispatch(login({ email: demoEmail, password: "password123" }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-bgLight">
      <div className="w-full max-w-md ngo-card bg-white border border-gray-200 rounded-3xl p-8 shadow-lg space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In to FoodBridge</h2>
          <p className="text-xs text-gray-500">Access your role dashboard & donation tasks</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Quick Demo Login Presets */}
        <div className="pt-4 border-t border-gray-100 space-y-2.5">
          <span className="text-[10px] font-extrabold text-gray-400 block text-center uppercase tracking-wider">
            Quick 1-Click Demo Accounts
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin("admin@foodbridge.org")}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin
            </button>
            <button
              onClick={() => handleDemoLogin("spicegarden@restaurant.com")}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" /> Restaurant
            </button>
            <button
              onClick={() => handleDemoLogin("contact@feedinghope.org")}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <Heart className="w-4 h-4 text-emerald-600" /> NGO
            </button>
            <button
              onClick={() => handleDemoLogin("rahul.volunteer@gmail.com")}
              className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <Truck className="w-4 h-4 text-sky-600" /> Volunteer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2">
          New to FoodBridge?{" "}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register Partner Account
          </Link>
        </div>
      </div>
    </div>
  );
}
