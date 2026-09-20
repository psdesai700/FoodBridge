import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import {
  UtensilsCrossed,
  LayoutDashboard,
  FileCheck,
  Heart,
  Truck,
  ShieldCheck,
  MessageSquare,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  User,
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "restaurant":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "ngo":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "volunteer":
        return "bg-sky-100 text-sky-700 border-sky-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderNavLinks = () => {
    if (!user) return null;

    if (user.role === "admin") {
      return (
        <>
          <button
            onClick={() => setActiveTab("verifications")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "verifications"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" /> Pending Approvals
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "users"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4" /> User Management
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "pipeline"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UtensilsCrossed className="w-4 h-4" /> Donations Pipeline
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "heatmap"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" /> Impact Heatmap
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </>
      );
    }

    if (user.role === "restaurant") {
      return (
        <>
          <button
            onClick={() => setActiveTab("listings")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "listings"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UtensilsCrossed className="w-4 h-4" /> My Surplus Listings
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Clock className="w-4 h-4" /> Donation History & OTPs
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </>
      );
    }

    if (user.role === "ngo") {
      return (
        <>
          <button
            onClick={() => setActiveTab("browse")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "browse"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" /> Browse Available Food
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("my-claims")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "my-claims"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4" /> Active NGO Claims
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </>
      );
    }

    if (user.role === "volunteer") {
      return (
        <>
          <button
            onClick={() => setActiveTab("open-tasks")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "open-tasks"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Truck className="w-4 h-4" /> Open Delivery Tasks
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "my-tasks"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" /> My Active Deliveries
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </>
      );
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 p-4 shadow-xs hidden md:flex">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 leading-tight block">FoodBridge</span>
            <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">Anna Setu NGO</span>
          </div>
        </Link>

        {/* Role Badge Pill */}
        {user && (
          <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-700 capitalize">{user.role} Portal</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getRoleColor(user.role)}`}>
              {user.isVerified ? "Verified" : "Pending"}
            </span>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Main Menu</div>
          
          <Link
            to={user?.role === "admin" ? "/admin" : user?.role === "restaurant" ? "/restaurant" : user?.role === "ngo" ? "/ngo" : "/volunteer"}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Role Overview
          </Link>

          {renderNavLinks()}

          <Link
            to="/verification"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" /> Identity Verification
          </Link>
        </div>
      </div>

      {/* Footer User Info & Logout */}
      {user && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center border border-emerald-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900 truncate">{user.name}</div>
              <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold text-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
