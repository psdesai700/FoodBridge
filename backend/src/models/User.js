import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    role: {
      type: String,
      enum: ["admin", "restaurant", "ngo", "volunteer"],
      required: [true, "Role is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["unsubmitted", "pending", "approved", "rejected"],
      default: "unsubmitted",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "Mumbai" },
      state: { type: String, default: "Maharashtra" },
      zipcode: { type: String, default: "400001" },
      coordinates: {
        lat: { type: Number, default: 19.0760 },
        lng: { type: Number, default: 72.8777 },
      },
    },
    profileDetails: {
      // Restaurant details
      fssaiLicense: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      cuisineTypes: [{ type: String }],
      
      // NGO details
      ngoRegistrationNo: { type: String, default: "" },
      darpanId: { type: String, default: "" },
      taxExempt80G: { type: String, default: "" },
      organizationType: { type: String, default: "" },
      
      // Volunteer details
      aadhaarNumber: { type: String, default: "" },
      vehicleType: { type: String, enum: ["foot", "bicycle", "scooter", "car", "van"], default: "scooter" },
      availability: { type: String, default: "Available" },
      
      // Common
      contactPerson: { type: String, default: "" },
      bio: { type: String, default: "" },
    },
    ratingAvg: {
      type: Number,
      default: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    impactStats: {
      totalFoodDonatedKg: { type: Number, default: 0 },
      totalMealsProvided: { type: Number, default: 0 },
      deliveriesCompleted: { type: Number, default: 0 },
      peopleServed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
