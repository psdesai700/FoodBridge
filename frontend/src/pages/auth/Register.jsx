import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/authSlice";
import { UtensilsCrossed, Heart, Truck, ShieldCheck, ArrowRight } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("restaurant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mumbai");

  // Role specific fields
  const [fssaiLicense, setFssaiLicense] = useState("");
  const [ngoRegistrationNo, setNgoRegistrationNo] = useState("");
  const [darpanId, setDarpanId] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/verification");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const profileDetails = {};
    if (role === "restaurant") profileDetails.fssaiLicense = fssaiLicense;
    if (role === "ngo") {
      profileDetails.ngoRegistrationNo = ngoRegistrationNo;
      profileDetails.darpanId = darpanId;
    }
    if (role === "volunteer") profileDetails.aadhaarNumber = aadhaarNumber;

    dispatch(
      register({
        name,
        email,
        password,
        phone,
        role,
        address: { city, state: "Maharashtra", zipcode: "400001" },
        profileDetails,
      })
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 bg-bgLight">
      <div className="w-full max-w-xl ngo-card bg-white border border-gray-200 rounded-3xl p-8 shadow-lg space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Partner Registration</h2>
          <p className="text-xs text-gray-500">Join FoodBridge as a Restaurant, NGO, or Volunteer</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Role Selector Grid */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">Select Role</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRole("restaurant")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                role === "restaurant"
                  ? "bg-amber-50 border-amber-400 text-amber-900 shadow-xs"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UtensilsCrossed className="w-5 h-5 mb-1 text-amber-600" />
              <span className="font-bold text-xs block">Restaurant</span>
              <span className="text-[10px] text-gray-500">Donate surplus</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("ngo")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                role === "ngo"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart className="w-5 h-5 mb-1 text-emerald-600" />
              <span className="font-bold text-xs block">NGO</span>
              <span className="text-[10px] text-gray-500">Claim & Serve</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("volunteer")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                role === "volunteer"
                  ? "bg-sky-50 border-sky-400 text-sky-900 shadow-xs"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Truck className="w-5 h-5 mb-1 text-sky-600" />
              <span className="font-bold text-xs block">Volunteer</span>
              <span className="text-[10px] text-gray-500">Deliver food</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name / Organization</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "restaurant" ? "Spice Garden Restaurant" : role === "ngo" ? "Feeding Hope NGO" : "Rahul Sharma"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@org.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {role === "restaurant" && (
            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">FSSAI License Number</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                placeholder="e.g. FSSAI-11223344556677"
                className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-gray-800"
              />
            </div>
          )}

          {role === "ngo" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1">NGO Registration No.</label>
                <input
                  type="text"
                  value={ngoRegistrationNo}
                  onChange={(e) => setNgoRegistrationNo(e.target.value)}
                  placeholder="NGO-MUM-2018-889"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1">Darpan ID (Optional)</label>
                <input
                  type="text"
                  value={darpanId}
                  onChange={(e) => setDarpanId(e.target.value)}
                  placeholder="MH/2018/019283"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-gray-800"
                />
              </div>
            </div>
          )}

          {role === "volunteer" && (
            <div>
              <label className="block text-xs font-bold text-sky-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="1234-5678-9012"
                className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-gray-800"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating Partner Account..." : <>Proceed to Document Upload <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2">
          Already registered?{" "}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
