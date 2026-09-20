import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import {
  UtensilsCrossed,
  ShieldCheck,
  Bell,
  LogOut,
  Search,
  CheckCircle,
  AlertCircle,
  Menu,
  Heart,
  Truck,
  Building2,
} from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/chat/notifications", config);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/chat/notifications/${id}/read`, {}, config);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Brand / Mobile View */}
        <Link to="/" className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-base">FoodBridge</span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search surplus listings, NGOs, volunteers, cities..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        {/* User Navigation & Notifications */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Verification Badge */}
            {user.role !== "admin" && (
              <Link
                to="/verification"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  user.isVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : user.verificationStatus === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {user.isVerified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Partner
                  </>
                ) : user.verificationStatus === "pending" ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Verify Identity
                  </>
                )}
              </Link>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 lg:w-96 rounded-2xl bg-white border border-gray-200 shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" /> Notifications
                    </h3>
                    <span className="text-[10px] font-semibold text-gray-500">{unreadCount} unread</span>
                  </div>
                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3 rounded-xl cursor-pointer text-xs transition-colors ${
                            n.isRead
                              ? "bg-gray-50 text-gray-600"
                              : "bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium"
                          }`}
                        >
                          <div className="font-bold text-emerald-700">{n.title}</div>
                          <div className="mt-1 text-[11px]">{n.message}</div>
                          <div className="mt-1.5 text-[9px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-gray-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-emerald-600 font-semibold uppercase">{user.role}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
