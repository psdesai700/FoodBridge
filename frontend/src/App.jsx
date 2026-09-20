import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UploadVerificationDocs from "./pages/auth/UploadVerificationDocs";

import AdminDashboard from "./pages/admin/AdminDashboard";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import NgoDashboard from "./pages/ngo/NgoDashboard";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";

import { initSocket } from "./services/socket";

export default function App() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      initSocket(user);
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Verification Route */}
            <Route
              path="/verification"
              element={
                <ProtectedRoute>
                  <UploadVerificationDocs />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Restaurant Dashboard */}
            <Route
              path="/restaurant"
              element={
                <ProtectedRoute allowedRoles={["restaurant"]}>
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />

            {/* NGO Dashboard */}
            <Route
              path="/ngo"
              element={
                <ProtectedRoute allowedRoles={["ngo"]}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />

            {/* Volunteer Dashboard */}
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
