import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./src/models/User.js";
import VerificationDocument from "./src/models/VerificationDocument.js";
import FoodListing from "./src/models/FoodListing.js";
import Donation from "./src/models/Donation.js";
import Rating from "./src/models/Rating.js";
import Notification from "./src/models/Notification.js";
import Message from "./src/models/Message.js";

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/foodbridge";
    await mongoose.connect(mongoUri);
    console.log("🌱 Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await VerificationDocument.deleteMany();
    await FoodListing.deleteMany();
    await Donation.deleteMany();
    await Rating.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();

    console.log("🧹 Cleared existing database collections.");

    // 1. Create Users
    const admin = await User.create({
      name: "FoodBridge Super Admin",
      email: "admin@foodbridge.org",
      password: "password123",
      phone: "+91 9876543210",
      role: "admin",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "Admin HQ, Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400051",
        coordinates: { lat: 19.0657, lng: 72.8687 },
      },
    });

    const restaurant1 = await User.create({
      name: "Spice Garden Restaurant",
      email: "spicegarden@restaurant.com",
      password: "password123",
      phone: "+91 9820011223",
      role: "restaurant",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "45 MG Road, Colaba",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400001",
        coordinates: { lat: 18.922, lng: 72.8336 },
      },
      profileDetails: {
        fssaiLicense: "FSSAI-11223344556677",
        gstNumber: "27AAAAA0000A1Z5",
        cuisineTypes: ["North Indian", "Biryani", "Continental"],
        contactPerson: "Chef Vikram Malhotra",
        bio: "Premium dining restaurant in South Mumbai committed to zero food waste.",
      },
      ratingAvg: 4.8,
      ratingCount: 15,
      impactStats: { totalFoodDonatedKg: 120, totalMealsProvided: 480, peopleServed: 450 },
    });

    const restaurant2 = await User.create({
      name: "Taj Bakery & Cafe",
      email: "tajbakery@restaurant.com",
      password: "password123",
      phone: "+91 9820044556",
      role: "restaurant",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "12 Linking Road, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400050",
        coordinates: { lat: 19.0596, lng: 72.8295 },
      },
      profileDetails: {
        fssaiLicense: "FSSAI-99887766554433",
        gstNumber: "27BBBBB1111B1Z2",
        cuisineTypes: ["Bakery", "Desserts", "Snacks"],
        contactPerson: "Farhan Merchant",
        bio: "Artisanal bakery producing fresh breads and pastries daily.",
      },
      ratingAvg: 4.9,
      ratingCount: 22,
    });

    const ngo1 = await User.create({
      name: "Feeding Hope Foundation",
      email: "contact@feedinghope.org",
      password: "password123",
      phone: "+91 9811122233",
      role: "ngo",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "Community Center, Dharavi",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400017",
        coordinates: { lat: 19.0402, lng: 72.8508 },
      },
      profileDetails: {
        ngoRegistrationNo: "NGO-MUM-2018-889",
        darpanId: "MH/2018/019283",
        taxExempt80G: "80G-VERIFIED-9920",
        organizationType: "Registered Trust",
        contactPerson: "Sunita Deshmukh",
        bio: "Dedicated to feeding underprivileged families and children across Mumbai slm clusters.",
      },
      ratingAvg: 4.9,
      ratingCount: 30,
      impactStats: { totalFoodDonatedKg: 350, totalMealsProvided: 1400, peopleServed: 1350 },
    });

    const ngo2 = await User.create({
      name: "Annam Seva Trust",
      email: "info@annamseva.org",
      password: "password123",
      phone: "+91 9833344455",
      role: "ngo",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "8 Dadar West Near Station",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400028",
        coordinates: { lat: 19.0178, lng: 72.8478 },
      },
      profileDetails: {
        ngoRegistrationNo: "NGO-MUM-2020-412",
        darpanId: "MH/2020/048192",
        taxExempt80G: "80G-VERIFIED-3310",
        contactPerson: "Ramesh Iyer",
        bio: "Providing daily warm meals to homeless elderly people.",
      },
      ratingAvg: 4.7,
      ratingCount: 18,
    });

    const volunteer1 = await User.create({
      name: "Rahul Sharma",
      email: "rahul.volunteer@gmail.com",
      password: "password123",
      phone: "+91 9900011122",
      role: "volunteer",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "24 Mahim West",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400016",
        coordinates: { lat: 19.0356, lng: 72.8402 },
      },
      profileDetails: {
        aadhaarNumber: "1234-5678-9012",
        vehicleType: "scooter",
        availability: "Available (Full Time)",
        bio: "College student passionate about social service and hunger relief.",
      },
      ratingAvg: 5.0,
      ratingCount: 25,
      impactStats: { deliveriesCompleted: 28, totalMealsProvided: 600, peopleServed: 580 },
    });

    const volunteer2 = await User.create({
      name: "Priya Singh",
      email: "priya.delivery@gmail.com",
      password: "password123",
      phone: "+91 9922233344",
      role: "volunteer",
      isVerified: true,
      verificationStatus: "approved",
      address: {
        street: "15 Worli Naka",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400018",
        coordinates: { lat: 19.0166, lng: 72.8166 },
      },
      profileDetails: {
        aadhaarNumber: "9876-5432-1098",
        vehicleType: "car",
        availability: "Available (Weekends)",
        bio: "Corporate IT professional volunteering during off-hours.",
      },
      ratingAvg: 4.9,
      ratingCount: 12,
    });

    console.log("👥 Created sample users (Admin, 2 Restaurants, 2 NGOs, 2 Volunteers).");

    // 2. Create Verification Documents
    await VerificationDocument.create([
      {
        userId: restaurant1._id,
        role: "restaurant",
        documentType: "FSSAI_LICENSE",
        documentNumber: "FSSAI-11223344556677",
        documentUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80",
        status: "approved",
        adminComment: "FSSAI License verified against official registry.",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
      {
        userId: ngo1._id,
        role: "ngo",
        documentType: "NGO_REGISTRATION",
        documentNumber: "NGO-MUM-2018-889",
        documentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
        status: "approved",
        adminComment: "NGO 80G Certificate and NITI Aayog Darpan ID verified.",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
      {
        userId: volunteer1._id,
        role: "volunteer",
        documentType: "AADHAAR_ID",
        documentNumber: "1234-5678-9012",
        documentUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        status: "approved",
        adminComment: "Government Aadhaar card identity verified.",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      },
    ]);

    console.log("📄 Created verification documents.");

    // 3. Create Surplus Food Listings
    const now = new Date();
    const listing1 = await FoodListing.create({
      restaurantId: restaurant1._id,
      title: "Fresh Veg Biryani & Paneer Gravy (60 Servings)",
      foodType: "veg",
      quantityKg: 25,
      estimatedServings: 60,
      prepTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hr ago
      expiryWindowHours: 5,
      expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      pickupAddress: restaurant1.address,
      photos: [
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      ],
      specialInstructions: "Packed in hygienic stainless thermal containers. Handle with care.",
      status: "available",
    });

    const listing2 = await FoodListing.create({
      restaurantId: restaurant2._id,
      title: "Assorted Bakery Breads, Croissants & Sandwiches",
      foodType: "bakery",
      quantityKg: 15,
      estimatedServings: 45,
      prepTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiryWindowHours: 8,
      expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      pickupAddress: restaurant2.address,
      photos: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"],
      specialInstructions: "Individually wrapped bakery items ready for immediate distribution.",
      status: "available",
    });

    // In-transit listing with live volunteer tracking & OTP
    const listing3 = await FoodListing.create({
      restaurantId: restaurant1._id,
      title: "North Indian Meals & Dal Makhani (40 Servings)",
      foodType: "cooked-meals",
      quantityKg: 20,
      estimatedServings: 40,
      prepTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiryWindowHours: 4,
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      pickupAddress: restaurant1.address,
      photos: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"],
      status: "in_transit",
      activeNGOId: ngo1._id,
      activeVolunteerId: volunteer1._id,
      otpCode: "4829",
    });

    // Completed listing with full proof distribution
    const listing4 = await FoodListing.create({
      restaurantId: restaurant2._id,
      title: "Fresh Baked Rolls & Patties (50 Servings)",
      foodType: "bakery",
      quantityKg: 18,
      estimatedServings: 50,
      prepTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expiryWindowHours: 12,
      expiresAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      pickupAddress: restaurant2.address,
      photos: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"],
      status: "distributed",
      activeNGOId: ngo2._id,
      activeVolunteerId: volunteer2._id,
      otpCode: "9102",
    });

    console.log("🍲 Created surplus food listings.");

    // 4. Create Active & Completed Donations with Audit Trails
    const activeDonation = await Donation.create({
      listingId: listing3._id,
      restaurantId: restaurant1._id,
      ngoId: ngo1._id,
      volunteerId: volunteer1._id,
      pickupType: "volunteer_delivery",
      quantityKg: 20,
      status: "in_transit",
      pickupOtp: "4829",
      otpVerifiedAt: new Date(now.getTime() - 20 * 60 * 1000),
      deliveryGpsHistory: [
        { lat: 18.922, lng: 72.8336, timestamp: new Date(now.getTime() - 20 * 60 * 1000) },
        { lat: 18.950, lng: 72.8400, timestamp: new Date(now.getTime() - 10 * 60 * 1000) },
        { lat: 19.010, lng: 72.8450, timestamp: new Date(now.getTime() - 2 * 60 * 1000) },
      ],
      currentLocation: { lat: 19.010, lng: 72.8450, updatedAt: new Date() },
      auditTrail: [
        {
          status: "listed",
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          updatedBy: restaurant1._id,
          updatedByRole: "restaurant",
          notes: "Food surplus listed by Spice Garden Restaurant",
        },
        {
          status: "claimed",
          timestamp: new Date(now.getTime() - 90 * 60 * 1000),
          updatedBy: ngo1._id,
          updatedByRole: "ngo",
          notes: "Claimed by Feeding Hope Foundation with Volunteer delivery request",
        },
        {
          status: "assigned",
          timestamp: new Date(now.getTime() - 60 * 60 * 1000),
          updatedBy: volunteer1._id,
          updatedByRole: "volunteer",
          notes: "Volunteer Rahul Sharma accepted delivery task",
        },
        {
          status: "picked_up",
          timestamp: new Date(now.getTime() - 20 * 60 * 1000),
          updatedBy: volunteer1._id,
          updatedByRole: "volunteer",
          notes: "Pickup OTP 4829 verified at restaurant. Food in transit.",
        },
        {
          status: "in_transit",
          timestamp: new Date(now.getTime() - 15 * 60 * 1000),
          updatedBy: volunteer1._id,
          updatedByRole: "volunteer",
          notes: "En route to Dharavi Community Center distribution point.",
        },
      ],
    });

    const completedDonation = await Donation.create({
      listingId: listing4._id,
      restaurantId: restaurant2._id,
      ngoId: ngo2._id,
      volunteerId: volunteer2._id,
      pickupType: "volunteer_delivery",
      quantityKg: 18,
      status: "closed",
      pickupOtp: "9102",
      otpVerifiedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      distributionProof: {
        photoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
        headcountServed: 50,
        locationAddress: "Dadar West Community Shelter, Mumbai",
        coordinates: { lat: 19.0178, lng: 72.8478 },
        notes: "Distributed 50 hot baked rolls and beverages to elderly homeless individuals.",
        verifiedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
      },
      auditTrail: [
        {
          status: "listed",
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          updatedBy: restaurant2._id,
          updatedByRole: "restaurant",
          notes: "Food listed",
        },
        {
          status: "claimed",
          timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000),
          updatedBy: ngo2._id,
          updatedByRole: "ngo",
          notes: "Claimed by Annam Seva Trust",
        },
        {
          status: "picked_up",
          timestamp: new Date(now.getTime() - 20 * 60 * 1000),
          updatedBy: volunteer2._id,
          updatedByRole: "volunteer",
          notes: "OTP 9102 verified",
        },
        {
          status: "distributed",
          timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
          updatedBy: ngo2._id,
          updatedByRole: "ngo",
          notes: "Distributed to 50 people with photo proof",
        },
        {
          status: "closed",
          timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
          updatedBy: ngo2._id,
          updatedByRole: "ngo",
          notes: "Audit closed",
        },
      ],
    });

    console.log("🚚 Created active and completed donation records.");

    // 5. Create Sample Chat Messages for active donation
    await Message.create([
      {
        donationId: activeDonation._id,
        senderId: ngo1._id,
        senderName: ngo1.name,
        senderRole: "ngo",
        text: "Hello Rahul, we are ready at Dharavi Community Center. Please call when near.",
      },
      {
        donationId: activeDonation._id,
        senderId: volunteer1._id,
        senderName: volunteer1.name,
        senderRole: "volunteer",
        text: "Hi Sunita! I have picked up the Biryani from Spice Garden. Reaching in ~15 mins.",
      },
    ]);

    console.log("💬 Created sample chat messages.");

    console.log("\n========================================================");
    console.log("🎉 FOODBRIDGE DATABASE SEEDED SUCCESSFULLY!");
    console.log("========================================================");
    console.log("🔑 SAMPLE DEMO ACCOUNTS:");
    console.log("   • ADMIN:      admin@foodbridge.org          / password123");
    console.log("   • RESTAURANT: spicegarden@restaurant.com    / password123");
    console.log("   • RESTAURANT: tajbakery@restaurant.com       / password123");
    console.log("   • NGO:        contact@feedinghope.org       / password123");
    console.log("   • NGO:        info@annamseva.org            / password123");
    console.log("   • VOLUNTEER:  rahul.volunteer@gmail.com     / password123");
    console.log("   • VOLUNTEER:  priya.delivery@gmail.com      / password123");
    console.log("========================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedData();
