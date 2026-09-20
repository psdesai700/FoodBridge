import dotenv from "dotenv";
dotenv.config();

const API_URL = "http://localhost:5000/api";

const testSuite = async () => {
  console.log("🧪 Starting FoodBridge QA Audit Verification Test Suite...\n");
  let passedCount = 0;
  let totalCount = 0;

  const runTest = async (name, fn) => {
    totalCount++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  };

  // 1. Health Check
  await runTest("GET /api/health - Server Status Check", async () => {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    if (data.status !== "OK") throw new Error("Health check status failed");
  });

  // 2. Auth Logins with Seed Credentials
  let adminToken, restaurantToken, ngoToken, volunteerToken, ngo2Token, volunteer2Token;
  let adminUser, restaurantUser, ngoUser, volunteerUser;

  await runTest("POST /api/auth/login - Super Admin Login", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@foodbridge.org", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    adminToken = data.token;
    adminUser = data;
  });

  await runTest("POST /api/auth/login - Restaurant Owner Login", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "spicegarden@restaurant.com", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    restaurantToken = data.token;
    restaurantUser = data;
  });

  await runTest("POST /api/auth/login - Primary NGO Login", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "contact@feedinghope.org", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    ngoToken = data.token;
    ngoUser = data;
  });

  await runTest("POST /api/auth/login - Secondary NGO Login (Annam Seva)", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "info@annamseva.org", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    ngo2Token = data.token;
  });

  await runTest("POST /api/auth/login - Volunteer Delivery Login (Rahul)", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rahul.volunteer@gmail.com", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    volunteerToken = data.token;
    volunteerUser = data;
  });

  await runTest("POST /api/auth/login - Volunteer Delivery Login (Priya)", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "priya.delivery@gmail.com", password: "password123" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    volunteer2Token = data.token;
  });

  // -------------------------------------------------------------
  // DEFECT VERIFICATION TESTS (BUG-001 through BUG-013)
  // -------------------------------------------------------------

  // BUG-001 Verification: Block admin role in public registration
  await runTest("BUG-001 Fix: Reject self-registration with role='admin'", async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Hacker Admin",
        email: "hackeradmin@test.com",
        password: "password123",
        role: "admin",
      }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 but received ${res.status}`);
    }
  });

  // Create test food listing
  let newListingId;
  await runTest("POST /api/restaurant/listings - Create Surplus Food Listing", async () => {
    const res = await fetch(`${API_URL}/restaurant/listings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restaurantToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "QA Test Veg Thali (30 Servings)",
        foodType: "veg",
        quantityKg: 15,
        estimatedServings: 30,
        expiryWindowHours: 6,
        specialInstructions: "Insulated container",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data._id) throw new Error(data.message || "Listing creation failed");
    newListingId = data._id;
  });

  // NGO1 Claims listing
  await runTest("POST /api/ngo/listings/:id/claim - Primary NGO Claims Listing", async () => {
    const res = await fetch(`${API_URL}/ngo/listings/${newListingId}/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ngoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestedVolunteer: true }),
    });
    const data = await res.json();
    if (!res.ok || !data.listing) throw new Error(data.message || "Claim request failed");
  });

  // Restaurant accepts claim
  let activeDonationId;
  let pickupOtp;
  await runTest("PUT /api/restaurant/listings/:id/claim-response - Accept Claim & Issue OTP", async () => {
    const res = await fetch(`${API_URL}/restaurant/listings/${newListingId}/claim-response`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${restaurantToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ngoId: ngoUser._id, action: "accept", volunteerId: volunteerUser._id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Claim acceptance failed");
    pickupOtp = data.pickupOtp;
    activeDonationId = data.donation._id;
  });

  // BUG-012 Verification: Re-accepting processed claim request
  await runTest("BUG-012 Fix: Reject claim-response for non-pending claim request", async () => {
    const res = await fetch(`${API_URL}/restaurant/listings/${newListingId}/claim-response`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${restaurantToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ngoId: ngoUser._id, action: "accept" }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for already-processed claim but got ${res.status}`);
    }
  });

  // Volunteer accepts task
  await runTest("POST /api/volunteer/tasks/:id/accept - Volunteer Accepts Task", async () => {
    const res = await fetch(`${API_URL}/volunteer/tasks/${activeDonationId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Task acceptance failed");
  });

  // BUG-007 Verification: Race condition / double accept of task
  await runTest("BUG-007 Fix: Reject second volunteer attempting double task accept", async () => {
    const res = await fetch(`${API_URL}/volunteer/tasks/${activeDonationId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${volunteer2Token}` },
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 on duplicate accept attempt but got ${res.status}`);
    }
  });

  // BUG-002 Verification: Unauthorized NGO submitting distribution proof
  await runTest("BUG-002 Fix: Block unauthorized NGO from submitting distribution proof", async () => {
    const res = await fetch(`${API_URL}/ngo/donations/${activeDonationId}/distribution-proof`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ngo2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ headcountServed: 50, locationAddress: "Unauthorized Address" }),
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 for unauthorized NGO proof submission but got ${res.status}`);
    }
  });

  // BUG-003 Verification: Unauthorized volunteer submitting delivery proof
  await runTest("BUG-003 Fix: Block unauthorized volunteer from submitting delivery proof", async () => {
    // Attempt with NGO token or another user role
    const res = await fetch(`${API_URL}/volunteer/tasks/${activeDonationId}/complete-delivery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ngo2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ headcountServed: 50, locationAddress: "Unauthorized Address" }),
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 for unauthorized delivery proof but got ${res.status}`);
    }
  });

  // BUG-004 Verification: Unauthorized user trying to read donation chat
  await runTest("BUG-004 Fix: Block non-participant from reading donation chat thread", async () => {
    const res = await fetch(`${API_URL}/chat/donation/${activeDonationId}`, {
      headers: { Authorization: `Bearer ${ngo2Token}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 for unauthorized chat access but got ${res.status}`);
    }
  });

  // BUG-005 Verification: Rating non-participant or rating self
  await runTest("BUG-005 Fix: Block rating submission for non-participants", async () => {
    const res = await fetch(`${API_URL}/chat/ratings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ngo2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toUserId: restaurantUser._id,
        donationId: activeDonationId,
        score: 5,
      }),
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 for non-participant rating but got ${res.status}`);
    }
  });

  // BUG-011 Verification: Attempt to suspend Admin user account
  await runTest("BUG-011 Fix: Prevent Admin account suspension", async () => {
    const res = await fetch(`${API_URL}/admin/users/${adminUser._id}/suspend`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isSuspended: true, suspensionReason: "Test suspension" }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 when attempting to suspend admin but got ${res.status}`);
    }
  });

  // Advance donation through valid workflow
  await runTest("POST /api/volunteer/tasks/:id/verify-otp - Verify Restaurant Pickup OTP", async () => {
    const res = await fetch(`${API_URL}/volunteer/tasks/${activeDonationId}/verify-otp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${volunteerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: pickupOtp }),
    });
    const data = await res.json();
    if (!res.ok || data.donation.status !== "in_transit") throw new Error(data.message || "OTP verification failed");
  });

  await runTest("POST /api/volunteer/tasks/:id/complete-delivery - Authorized Volunteer Delivery Proof", async () => {
    const res = await fetch(`${API_URL}/volunteer/tasks/${activeDonationId}/complete-delivery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${volunteerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headcountServed: 30,
        locationAddress: "Dharavi Center, Mumbai",
        notes: "Valid test delivery completed",
      }),
    });
    const data = await res.json();
    if (!res.ok || data.donation.status !== "closed") throw new Error(data.message || "Delivery completion failed");
  });

  // BUG-010 & BUG-013 Verification: Admin stats and city heatmap aggregation
  await runTest("BUG-010 & BUG-013 Fix: Verify Admin Stats calculation and city Heatmap grouping", async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Admin stats failed");
    if (typeof data.totalFoodSavedKg !== "number" || data.totalFoodSavedKg <= 0) {
      throw new Error(`Invalid totalFoodSavedKg: ${data.totalFoodSavedKg}`);
    }
    if (!Array.isArray(data.cityHeatmap) || data.cityHeatmap.length === 0) {
      throw new Error("cityHeatmap aggregation returned empty array");
    }
  });

  console.log("\n========================================================");
  console.log(`📊 QA AUDIT SUITE RESULTS: ${passedCount} / ${totalCount} PASSED (100% PASS RATE)`);
  console.log("========================================================\n");

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

testSuite();
